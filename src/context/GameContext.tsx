import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, INITIAL_GAME_STATE, Module, Hardware, HardwareCapacity, NewsItem, Achievement, HardwareType } from '../types';
import { ALL_MODULES, getModuleCost, getModuleEffectiveBPS } from '../data/modules';
import { ALL_HARDWARE, getHardwareCost } from '../data/hardware';
import { ALL_ACHIEVEMENTS, initializeAchievements, checkAchievements } from '../data/achievements';

interface GameContextType {
  gameState: GameState;
  addBeats: (amount: number) => void;
  purchaseModule: (moduleId: string) => void;
  purchaseHardware: (hardwareId: string) => void;
  addNews: (message: string) => void;
  // TODO: Add more actions like selling, upgrading variants, prestige, etc.
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Initialize modules and achievements by copying from ALL_MODULES/ALL_ACHIEVEMENTS
    // This ensures we work with mutable copies
    const initialModules: { [id: string]: Module } = {};
    for (const id in ALL_MODULES) {
      initialModules[id] = { ...ALL_MODULES[id] };
    }

    return {
      ...INITIAL_GAME_STATE,
      modules: initialModules,
      achievements: initializeAchievements(),
      // Initially unlock bd module, ram, and cpu hardware if they aren't already
      // This is important because the 'unlocked' property from data.ts is only a default.
      modules: {
        ...initialModules,
        'bd': { ...initialModules['bd'], unlocked: true }
      },
      hardware: {
        ...INITIAL_GAME_STATE.hardware,
        ram: { ...INITIAL_GAME_STATE.hardware.ram, total: ALL_HARDWARE['ram_stick_1gb'].capacity }, // Start with 1GB RAM total
        cpu: { ...INITIAL_GAME_STATE.hardware.cpu, total: ALL_HARDWARE['cpu_core_1'].capacity }, // Start with 1 Core total
      },
      unlockedHardwareTypes: ['ram', 'cpu']
    };
  });

  // --- Game Loop Logic ---
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp: DOMHighResTimeStamp = 0;

    const gameLoop = (timestamp: DOMHighResTimeStamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = (timestamp - lastTimestamp) / 1000; // delta in seconds
      lastTimestamp = timestamp;

      setGameState(prevState => {
        let newBeats = prevState.beats + prevState.bps * deltaTime;
        let newGameTime = prevState.gameTime + deltaTime;

        // Calculate BPS for current tick based on active modules
        let currentBPS = 0;
        let usedRam = 0;
        let usedCpu = 0;
        let usedDsp = 0;
        let usedStorage = 0;
        let currentStrudelCode = ''; // Code to send to Strudel.cc
        let currentStrudelBPM = prevState.strudelBPM; // Keep BPM for now

        // Determine active modules and their consumption
        const activeModules: Module[] = [];
        for (const moduleId in prevState.modules) {
          const module = prevState.modules[moduleId];
          if (module.acquiredCount > 0) {
            activeModules.push(module);
            currentBPS += getModuleEffectiveBPS(module);
            usedRam += module.consumption.ram * module.acquiredCount;
            usedCpu += module.consumption.cpu * module.acquiredCount;
            usedDsp += module.consumption.dsp * module.acquiredCount;
            usedStorage += module.consumption.storage * module.acquiredCount;
            // Build Strudel.cc code string
            // TODO: This part needs significant expansion for actual Strudel integration
            // For MVP, just a simple string for existing modules
            if (module.type === 'sample' && module.acquiredCount > 0) {
              const pattern = `~ ${module.name}`; // Simple pattern for now
              currentStrudelCode += `d${activeModules.indexOf(module) + 1} $ sound "${module.name}"\n`;
            } else if (module.type === 'synth' && module.acquiredCount > 0) {
              currentStrudelCode += `d${activeModules.indexOf(module) + 1} $ synth "${module.name.replace('_synth', '')}"\n`;
            }
          }
        }
        if (currentStrudelCode === '') currentStrudelCode = 'd1 $ sound "bd"'; // Default if nothing is active

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
        if (newHardware.ram.used > newHardware.ram.total) {
          overloadPenalty *= 0.5; // 50% penalty
          addNews(`WARNING: RAM overload! Beats generation reduced. Upgrade RAM!`); // Use direct addNews to avoid state loop
        }
        if (newHardware.cpu.used > newHardware.cpu.total) {
          overloadPenalty *= 0.5; // 50% penalty
          addNews(`WARNING: CPU overload! Beats generation reduced. Upgrade CPU!`);
        }
        if (newHardware.dsp.used > newHardware.dsp.total && newHardware.dsp.total > 0) {
             overloadPenalty *= 0.5;
             addNews(`WARNING: DSP overload! Effect processing reduced.`);
        }
        currentBPS *= overloadPenalty;


        const updatedState: GameState = {
          ...prevState,
          beats: newBeats,
          bps: currentBPS,
          hardware: newHardware,
          gameTime: newGameTime,
          strudelCode: currentStrudelCode,
          strudelBPM: currentStrudelBPM,
          // TODO: Update audience metrics based on active modules and other factors
        };

        // Check for unlocked modules/hardware based on criteria (e.g., beats, total BPS)
        for (const id in ALL_MODULES) {
          const module = ALL_MODULES[id];
          if (!updatedState.modules[id].unlocked) {
            // MVP unlock condition: unlock if player has enough beats, or has other modules
            // For example, unlock 'sn' if 'bd' acquiredCount > 0 and beats > 20
            if (id === 'sn' && updatedState.modules['bd'].acquiredCount > 0 && updatedState.beats >= 20 && updatedState.modules[id].baseCost <= updatedState.beats) {
              updatedState.modules[id].unlocked = true;
              addNews(`NEW MODULE UNLOCKED: ${module.name}!`);
            }
            if (id === 'hh' && updatedState.modules['sn'].acquiredCount > 0 && updatedState.beats >= 50 && updatedState.modules[id].baseCost <= updatedState.beats) {
              updatedState.modules[id].unlocked = true;
              addNews(`NEW MODULE UNLOCKED: ${module.name}!`);
            }
            if (id === 'sine_synth' && updatedState.modules['hh'].acquiredCount > 0 && updatedState.beats >= 100 && updatedState.modules[id].baseCost <= updatedState.beats) {
              updatedState.modules[id].unlocked = true;
              addNews(`NEW MODULE UNLOCKED: ${module.name}!`);
              // Unlock DSP hardware when first synth is unlocked
              updatedState.unlockedHardwareTypes = Array.from(new Set([...updatedState.unlockedHardwareTypes, 'dsp']));
            }
            if (id === 'reverb_unit' && updatedState.modules['sine_synth'].acquiredCount > 0 && updatedState.beats >= 200 && updatedState.modules[id].baseCost <= updatedState.beats) {
              updatedState.modules[id].unlocked = true;
              addNews(`NEW MODULE UNLOCKED: ${module.name}!`);
            }
            if (id === 'auto_quantizer' && updatedState.modules['reverb_unit'].acquiredCount > 0 && updatedState.beats >= 300 && updatedState.modules[id].baseCost <= updatedState.beats) {
              updatedState.modules[id].unlocked = true;
              addNews(`NEW MODULE UNLOCKED: ${module.name}!`);
            }
          }
        }
        for (const id in ALL_HARDWARE) {
          const hardwareDef = ALL_HARDWARE[id];
          if (!updatedState.unlockedHardwareTypes.includes(hardwareDef.type)) {
            // Example: unlock 4GB RAM if 1GB RAM count > 5
            if (hardwareDef.id === 'ram_stick_4gb' && updatedState.hardware.ram.total >= ALL_HARDWARE['ram_stick_1gb'].capacity * 5 && updatedState.beats >= 100) {
              updatedState.unlockedHardwareTypes = Array.from(new Set([...updatedState.unlockedHardwareTypes, hardwareDef.type]));
              addNews(`NEW HARDWARE UNLOCKED: ${hardwareDef.name} available!`);
            }
            if (hardwareDef.id === 'cpu_core_4' && updatedState.hardware.cpu.total >= ALL_HARDWARE['cpu_core_1'].capacity * 2 && updatedState.beats >= 150) {
              updatedState.unlockedHardwareTypes = Array.from(new Set([...updatedState.unlockedHardwareTypes, hardwareDef.type]));
              addNews(`NEW HARDWARE UNLOCKED: ${hardwareDef.name} available!`);
            }
            if (hardwareDef.id === 'dsp_chip_low' && updatedState.unlockedHardwareTypes.includes('dsp') && updatedState.beats >= 250) {
              updatedState.unlockedHardwareTypes = Array.from(new Set([...updatedState.unlockedHardwareTypes, hardwareDef.type]));
              addNews(`NEW HARDWARE UNLOCKED: ${hardwareDef.name} available!`);
            }
            if (hardwareDef.id === 'ssd_100gb' && updatedState.beats >= 50 && updatedState.hardware.storage.total === INITIAL_GAME_STATE.hardware.storage.total) {
              updatedState.unlockedHardwareTypes = Array.from(new Set([...updatedState.unlockedHardwareTypes, hardwareDef.type]));
              addNews(`NEW HARDWARE UNLOCKED: ${hardwareDef.name} available!`);
            }
          }
        }

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
  }, []); // Run effect once on mount

  // --- State Modifiers ---
  const addBeats = useCallback((amount: number) => {
    setGameState(prevState => ({
      ...prevState,
      beats: prevState.beats + amount,
    }));
  }, []);

  const purchaseModule = useCallback((moduleId: string) => {
    setGameState(prevState => {
      const moduleToBuy = prevState.modules[moduleId];
      const cost = getModuleCost(moduleToBuy);

      if (prevState.beats >= cost) {
        // Check if there's enough hardware capacity
        const newUsedRam = prevState.hardware.ram.used + moduleToBuy.consumption.ram;
        const newUsedCpu = prevState.hardware.cpu.used + moduleToBuy.consumption.cpu;
        const newUsedDsp = prevState.hardware.dsp.used + moduleToBuy.consumption.dsp;
        const newUsedStorage = prevState.hardware.storage.used + moduleToBuy.consumption.storage;

        if (newUsedRam > prevState.hardware.ram.total ||
            newUsedCpu > prevState.hardware.cpu.total ||
            newUsedDsp > prevState.hardware.dsp.total ||
            newUsedStorage > prevState.hardware.storage.total) {
            addNews(`ERROR: Not enough hardware capacity for ${moduleToBuy.name}!`);
            return prevState; // Prevent purchase
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
      const cost = getHardwareCost(hardwareToBuy);

      if (prevState.beats >= cost) {
        const updatedHardware = { ...prevState.hardware };
        updatedHardware[hardwareToBuy.type] = {
          ...updatedHardware[hardwareToBuy.type],
          total: updatedHardware[hardwareToBuy.type].total + hardwareToBuy.capacity,
        };

        // Update the individual hardware's acquiredCount in ALL_HARDWARE for display or future dynamic cost calc
        // (This is a simplified approach, a more robust solution would track acquired hardware instances in gameState)
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

  const addNews = useCallback((message: string) => {
    setGameState(prevState => {
      const newNewsItem: NewsItem = { id: Date.now().toString(), message, timestamp: Date.now() };
      const updatedNewsFeed = [newNewsItem, ...prevState.newsFeed].slice(0, 10); // Keep last 10 items
      return { ...prevState, newsFeed: updatedNewsFeed };
    });
  }, []);

  const contextValue = useMemo(() => ({
    gameState,
    addBeats,
    purchaseModule,
    purchaseHardware,
    addNews,
  }), [gameState, addBeats, purchaseModule, purchaseHardware, addNews]);

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
