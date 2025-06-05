// src/context/GameContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, INITIAL_GAME_STATE, Module, Hardware, HardwareCapacity, NewsItem, Achievement, HardwareType } from '../types';
import { ALL_MODULES, getModuleCost, getModuleEffectiveBPS } from '../data/modules';
import { ALL_HARDWARE, getHardwareCost } from '../data/hardware';
import { ALL_ACHIEVEMENTS, initializeAchievements, checkAchievements } from '../data/achievements';

interface GameContextType {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  addBeats: (amount: number) => void;
  purchaseModule: (moduleId: string) => void;
  purchaseHardware: (hardwareId: string) => void;
  addNews: (message: string) => void;
  // TODO: Add more actions like selling, upgrading variants, prestige, etc.
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Initialize modules by copying from ALL_MODULES
    const initialModules: { [id: string]: Module } = {};
    for (const id in ALL_MODULES) {
      initialModules[id] = { ...ALL_MODULES[id] };
    }

    // Explicitly unlock 'bd' module here before using initialModules in state
    if (initialModules['bd']) { // Defensive check
      initialModules['bd'] = { ...initialModules['bd'], unlocked: true };
    }

    // Initialize hardware capacities based on initial hardware (e.g., 1GB RAM, 1 Core CPU)
    const initialHardwareState = {
        ...INITIAL_GAME_STATE.hardware, // Spread existing hardware structure
        ram: { ...INITIAL_GAME_STATE.hardware.ram, total: ALL_HARDWARE['ram_stick_1gb']?.capacity || 0 }, // Ensure default capacity if ALL_HARDWARE not fully loaded
        cpu: { ...INITIAL_GAME_STATE.hardware.cpu, total: ALL_HARDWARE['cpu_core_1']?.capacity || 0 },
    };

    return {
      ...INITIAL_GAME_STATE,
      modules: initialModules, // Now only one 'modules' key
      achievements: initializeAchievements(),
      hardware: initialHardwareState, // Use the prepared initial hardware state
      unlockedHardwareTypes: ['ram', 'cpu', 'storage'] // Initially unlock ram, cpu, and storage types
    };
  });

  // Memoize addNews as it's used internally by effects and callbacks
  const addNews = useCallback((message: string) => {
    setGameState(prevState => {
      const newNewsItem: NewsItem = { id: Date.now().toString(), message, timestamp: Date.now() };
      const updatedNewsFeed = [newNewsItem, ...prevState.newsFeed].slice(0, 10); // Keep last 10 items
      return { ...prevState, newsFeed: updatedNewsFeed };
    });
  }, []); // No dependencies as it only uses prevState and Date.now()

  // --- Game Loop Logic ---
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp: DOMHighResTimeStamp = 0;

    const gameLoop = (timestamp: DOMHighResTimeStamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = (timestamp - lastTimestamp) / 1000; // delta in seconds
      lastTimestamp = timestamp;

      setGameState(prevState => {
        let newBeats = prevState.beats; // Initialize with current beats
        let currentBPS = 0;
        let usedRam = 0;
        let usedCpu = 0;
        let usedDsp = 0;
        let usedStorage = 0;
        let currentStrudelCode = '';
        let currentStrudelBPM = prevState.strudelBPM;
        let currentHasLooping = prevState.hasLooping;


        // Determine active modules and their consumption
        const activeModules: Module[] = [];
        const moduleLines: string[] = []; // To build strudel code
        for (const moduleId in prevState.modules) {
          const module = prevState.modules[moduleId];
          if (module.acquiredCount > 0) {
            activeModules.push(module);
            currentBPS += getModuleEffectiveBPS(module);
            usedRam += module.consumption.ram * module.acquiredCount;
            usedCpu += module.consumption.cpu * module.acquiredCount;
            usedDsp += module.consumption.dsp * module.acquiredCount;
            usedStorage += module.consumption.storage * module.acquiredCount;

            // Build Strudel.cc code string (JavaScript syntax)
            if (module.type === 'sample') {
              moduleLines.push(`s("${module.id}")`);
            } else if (module.type === 'synth') {
              const synthName = module.id.replace('_synth', '');
              moduleLines.push(`note("c3 e3 g3").s("${synthName}")`);
            } else if (module.type === 'effect') {
              // Effects will be applied to existing patterns
              // For now, just add as a modifier
              moduleLines.push(`// Effect: ${module.name}`);
            } else if (module.type === 'refactor') {
              // Handle refactor tools that affect playback
              if (module.id === 'loop_enable') {
                currentHasLooping = true;
              } else if (module.id === 'bpm_upgrade_1') {
                currentStrudelBPM = 90;
              } else if (module.id === 'bpm_upgrade_2') {
                currentStrudelBPM = 120;
              } else if (module.id === 'bpm_upgrade_3') {
                currentStrudelBPM = 150;
              }
            }
          }
        }
        
        // Build the final Strudel code
        if (moduleLines.length === 0) {
            // If no modules are active, default to bd
            currentStrudelCode = 's("bd")';
        } else if (moduleLines.length === 1) {
            currentStrudelCode = moduleLines[0];
        } else {
            // Stack multiple patterns
            currentStrudelCode = moduleLines[0] + '.stack(' + moduleLines.slice(1).join(', ') + ')';
        }
        
        // Add BPM to the pattern if we have looping enabled
        if (currentHasLooping) {
            // Convert BPM to CPS for Strudel (BPM / 60 / 4 for quarter note patterns)
            const cps = currentStrudelBPM / 60 / 4;
            currentStrudelCode = `${currentStrudelCode}.cps(${cps})`;
        }


        // Apply Audience Engagement boosts
        // TODO: Calculate audience metrics based on actual module types/complexity
        const audienceExcitementMultiplier = 1 + (prevState.audienceExcitement / 100);
        currentBPS *= audienceExcitementMultiplier;


        // Update hardware usage
        const newHardware = {
          ram: { ...prevState.hardware.ram, used: usedRam },
          cpu: { ...prevState.hardware.cpu, used: usedCpu },
          dsp: { ...prevState.hardware.dsp, used: usedDsp },
          storage: { ...prevState.hardware.storage, used: usedStorage },
        };

        // Check for resource overloads (simplistic for MVP)
        let overloadPenalty = 1;
        let overloadMessages: string[] = [];
        if (newHardware.ram.used > newHardware.ram.total) {
          overloadPenalty *= 0.5; // 50% penalty
          overloadMessages.push(`RAM overload!`);
        }
        if (newHardware.cpu.used > newHardware.cpu.total) {
          overloadPenalty *= 0.5; // 50% penalty
          overloadMessages.push(`CPU overload!`);
        }
        // Only apply DSP/Storage overload if they actually have capacity > 0 (i.e., hardware purchased)
        if (newHardware.dsp.total > 0 && newHardware.dsp.used > newHardware.dsp.total) {
             overloadPenalty *= 0.5;
             overloadMessages.push(`DSP overload!`);
        }
        if (newHardware.storage.total > INITIAL_GAME_STATE.hardware.storage.total && newHardware.storage.used > newHardware.storage.total) {
             overloadPenalty *= 0.5;
             overloadMessages.push(`Storage overload!`);
        }

        // Add news messages for new overloads
        overloadMessages.forEach(msg => {
            if (!prevState.newsFeed.some(n => n.message.includes(msg))) { // Prevent spamming same message
                // This call to addNews won't cause an infinite loop because it schedules a new state update,
                // it doesn't modify prevState directly.
                // However, for strictness within a setState, it's better to update newsfeed directly.
                // For MVP, this direct addNews call is acceptable and simpler.
                addNews(`WARNING: ${msg} Beats generation reduced.`);
            }
        });
        currentBPS *= overloadPenalty;

        newBeats = prevState.beats + currentBPS * deltaTime; // Update beats after penalty


        const updatedState: GameState = {
          ...prevState,
          beats: newBeats,
          bps: currentBPS,
          hardware: newHardware,
          gameTime: prevState.gameTime + deltaTime, // Use delta from gameLoop
          strudelCode: currentStrudelCode,
          strudelBPM: currentStrudelBPM,
          hasLooping: currentHasLooping,
          // TODO: Update audience metrics based on active modules and other factors
        };

        // Check for unlocked modules/hardware based on criteria (e.g., beats, total BPS)
        for (const id in ALL_MODULES) {
          const module = ALL_MODULES[id];
          if (!updatedState.modules[id].unlocked) {
            // MVP unlock condition: unlock if player has enough beats, or has other modules
            // For example, unlock 'sn' if 'bd' acquiredCount > 0 and beats > 20
            let shouldUnlock = false;
            if (id === 'sn' && updatedState.modules['bd'].acquiredCount > 0 && updatedState.beats >= 20 && getModuleCost(module) <= updatedState.beats) {
              shouldUnlock = true;
            } else if (id === 'hh' && updatedState.modules['sn'].acquiredCount > 0 && updatedState.beats >= 50 && getModuleCost(module) <= updatedState.beats) {
              shouldUnlock = true;
            } else if (id === 'sine_synth' && updatedState.modules['hh'].acquiredCount > 0 && updatedState.beats >= 100 && getModuleCost(module) <= updatedState.beats) {
              shouldUnlock = true;
              // Unlock DSP hardware type when first synth is unlocked
              if (!updatedState.unlockedHardwareTypes.includes('dsp')) {
                updatedState.unlockedHardwareTypes = Array.from(new Set([...updatedState.unlockedHardwareTypes, 'dsp']));
                addNews(`NEW HARDWARE TYPE UNLOCKED: DSP Units available!`);
              }
            } else if (id === 'reverb_unit' && updatedState.modules['sine_synth'].acquiredCount > 0 && updatedState.beats >= 200 && getModuleCost(module) <= updatedState.beats) {
              shouldUnlock = true;
            } else if (id === 'auto_quantizer' && updatedState.modules['reverb_unit'].acquiredCount > 0 && updatedState.beats >= 300 && getModuleCost(module) <= updatedState.beats) {
              shouldUnlock = true;
            } else if (id === 'cp' && updatedState.modules['hh'].acquiredCount > 0 && updatedState.beats >= 150) {
              shouldUnlock = true;
            } else if (id === 'arpy' && updatedState.modules['cp'].acquiredCount > 0 && updatedState.beats >= 250) {
              shouldUnlock = true;
            } else if (id === 'bass' && updatedState.modules['arpy'].acquiredCount > 0 && updatedState.beats >= 400) {
              shouldUnlock = true;
            } else if (id === 'perc' && updatedState.modules['cp'].acquiredCount > 0 && updatedState.beats >= 200) {
              shouldUnlock = true;
            } else if (id === 'drum' && updatedState.modules['bass'].acquiredCount > 0 && updatedState.beats >= 600) {
              shouldUnlock = true;
            } else if (id === 'loop_enable' && updatedState.modules['sn'].acquiredCount > 0 && updatedState.beats >= 80) {
              shouldUnlock = true;
            } else if (id === 'bpm_upgrade_1' && updatedState.modules['loop_enable'].acquiredCount > 0 && updatedState.beats >= 300) {
              shouldUnlock = true;
            } else if (id === 'bpm_upgrade_2' && updatedState.modules['bpm_upgrade_1'].acquiredCount > 0 && updatedState.beats >= 700) {
              shouldUnlock = true;
            } else if (id === 'bpm_upgrade_3' && updatedState.modules['bpm_upgrade_2'].acquiredCount > 0 && updatedState.beats >= 1500) {
              shouldUnlock = true;
            }
            // TODO: Add more specific unlock conditions here

            if (shouldUnlock) {
              updatedState.modules[id] = { ...updatedState.modules[id], unlocked: true };
              addNews(`NEW MODULE UNLOCKED: ${module.name}!`);
            }
          }
        }

        // Check for unlocked hardware items (these are direct purchases, not types)
        // No specific unlock logic here, just that they become buyable if their type is unlocked
        // and base cost is met, handled by HardwareShop component.

        // Check achievements
        const newAchievements = checkAchievements(updatedState, prevState.achievements);
        updatedState.achievements = newAchievements;


        return updatedState;
      });

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [addNews]); // addNews needs to be a dependency for the useEffect if used inside setGameState callback.

  // --- State Modifiers ---
  const addBeats = useCallback((amount: number) => {
    setGameState(prevState => ({
      ...prevState,
      beats: prevState.beats + amount,
    }));
  }, []);

  const purchaseModule = useCallback((moduleId: string) => {
    setGameState(prevState => {
      const moduleToBuy = prevState.modules[moduleId]; // Get from current game state
      if (!moduleToBuy) {
        addNews(`ERROR: Module ${moduleId} not found!`);
        return prevState;
      }
      const cost = getModuleCost(moduleToBuy);

      if (prevState.beats >= cost) {
        // Check if there's enough hardware capacity
        const newUsedRam = prevState.hardware.ram.used + moduleToBuy.consumption.ram;
        const newUsedCpu = prevState.hardware.cpu.used + moduleToBuy.consumption.cpu;
        const newUsedDsp = prevState.hardware.dsp.used + moduleToBuy.consumption.dsp;
        const newUsedStorage = prevState.hardware.storage.used + moduleToBuy.consumption.storage;

        if (newUsedRam > prevState.hardware.ram.total) {
            addNews(`ERROR: Not enough RAM for ${moduleToBuy.name}!`);
            return prevState;
        }
        if (newUsedCpu > prevState.hardware.cpu.total) {
            addNews(`ERROR: Not enough CPU for ${moduleToBuy.name}!`);
            return prevState;
        }
        if (newUsedDsp > prevState.hardware.dsp.total && moduleToBuy.consumption.dsp > 0) {
             addNews(`ERROR: Not enough DSP for ${moduleToBuy.name}!`);
             return prevState;
        }
        if (newUsedStorage > prevState.hardware.storage.total && moduleToBuy.consumption.storage > 0) {
             addNews(`ERROR: Not enough Storage for ${moduleToBuy.name}!`);
             return prevState;
        }


        const updatedModules = {
          ...prevState.modules,
          [moduleId]: {
            ...moduleToBuy,
            acquiredCount: moduleToBuy.acquiredCount + 1,
          },
        };

        const updatedHardware = {
            ram: { ...prevState.hardware.ram, used: newUsedRam },
            cpu: { ...prevState.hardware.cpu, used: newUsedCpu },
            dsp: { ...prevState.hardware.dsp, used: newUsedDsp },
            storage: { ...prevState.hardware.storage, used: newUsedStorage },
        };

        addNews(`Purchased ${moduleToBuy.name}!`); // Add news item
        return {
          ...prevState,
          beats: prevState.beats - cost,
          modules: updatedModules,
          hardware: updatedHardware,
        };
      }
      addNews(`ERROR: Not enough beats for ${moduleToBuy.name}!`);
      return prevState;
    });
  }, [addNews]); // addNews dependency for internal calls

  const purchaseHardware = useCallback((hardwareId: string) => {
    setGameState(prevState => {
      const hardwareToBuy = ALL_HARDWARE[hardwareId]; // Get from ALL_HARDWARE as it's not in gameState.hardware
      if (!hardwareToBuy) {
        addNews(`ERROR: Hardware ${hardwareId} not found!`);
        return prevState;
      }
      const cost = getHardwareCost(hardwareToBuy);

      if (prevState.beats >= cost) {
        const updatedHardware = { ...prevState.hardware };
        
        // Update the capacity for the specific hardware type
        updatedHardware[hardwareToBuy.type] = {
          ...updatedHardware[hardwareToBuy.type],
          total: updatedHardware[hardwareToBuy.type].total + hardwareToBuy.capacity,
        };

        // Important: Update the acquiredCount on the ALL_HARDWARE definition.
        // This is a workaround for the MVP, as we don't store individual hardware instances in gameState yet.
        ALL_HARDWARE[hardwareId].acquiredCount += 1;

        addNews(`Purchased ${hardwareToBuy.name}!`);
        return {
          ...prevState,
          beats: prevState.beats - cost,
          hardware: updatedHardware,
        };
      }
      addNews(`ERROR: Not enough beats for ${hardwareToBuy.name}!`);
      return prevState;
    });
  }, [addNews]);

  const contextValue = useMemo(() => ({
    gameState,
    setGameState,
    addBeats,
    purchaseModule,
    purchaseHardware,
    addNews,
  }), [gameState, setGameState, addBeats, purchaseModule, purchaseHardware, addNews]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
