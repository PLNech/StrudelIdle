// src/context/GameContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, INITIAL_GAME_STATE, Module, NewsItem } from '../types';
import { STRUDEL_MODULES } from '../data/strudelModules';

// Utility functions for Strudel modules
function getModuleCost(module: Module): number {
  return module.baseCost * Math.pow(1.15, module.acquiredCount);
}

function getModuleEffectiveBPS(module: Module): number {
  return module.bpsPerUnit * module.acquiredCount;
}
import { ALL_HARDWARE, getHardwareCost } from '../data/hardware';
import { initializeAchievements, checkAchievements } from '../data/achievements';

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
    // Initialize modules by copying from STRUDEL_MODULES
    const initialModules: { [id: string]: Module } = {};
    for (const id in STRUDEL_MODULES) {
      initialModules[id] = { ...STRUDEL_MODULES[id] };
    }

    // Explicitly unlock the first basic drum module
    if (initialModules['bd_basic']) {
      initialModules['bd_basic'] = { ...initialModules['bd_basic'], unlocked: true };
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
        const currentStrudelBPM = prevState.strudelBPM;
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

            // Build Strudel.cc code based on module type and progression
            if (module.type === 'sample') {
              const sampleName = module.id.replace('_basic', '');
              
              // Apply sample variations if unlocked
              if (prevState.modules['sample_variations']?.acquiredCount > 0) {
                const variation = Math.floor(Math.random() * 3);
                moduleLines.push(`s("${sampleName}:${variation}")`);
              } else {
                moduleLines.push(`s("${sampleName}")`);
              }
            } else if (module.type === 'synth') {
              if (module.id === 'note_c') {
                moduleLines.push(`note("c")`);
              } else if (module.id === 'note_scale') {
                moduleLines.push(`note("c d e f g a b")`);
              } else if (module.id === 'chord_triads') {
                moduleLines.push(`note("c e g")`);
              } else if (module.id === 'oscillator_bank') {
                moduleLines.push(`note("c").s("sawtooth")`);
              } else if (module.id === 'wavetable_synth') {
                moduleLines.push(`note("c d e").s("square")`);
              } else {
                // Default synth pattern
                moduleLines.push(`note("c3 e3 g3")`);
              }
            } else if (module.type === 'effect') {
              // Effects will be stored and applied later
            } else if (module.type === 'refactor') {
              // Handle pattern modification tools - these don't add sounds but modify patterns
              if (module.id === 'loop_enable') {
                currentHasLooping = true;
              }
            }
          }
        }
        
        // Build the final Strudel code with authentic progression features
        if (moduleLines.length === 0) {
            currentStrudelCode = 's("bd")';
        } else {
            let basePattern = '';
            const patterns: string[] = [];
            
            // Separate sample and note patterns
            const samplePatterns: string[] = [];
            const notePatterns: string[] = [];
            
            moduleLines.forEach(line => {
                if (line.includes('s(')) {
                    samplePatterns.push(line.replace('s("', '').replace('")', ''));
                } else if (line.includes('note(')) {
                    notePatterns.push(line);
                }
            });
            
            // Build sequences based on unlocked capabilities
            if (prevState.modules['sequence_builder']?.acquiredCount > 0) {
                // Create proper sequences using mini-notation
                if (samplePatterns.length > 0) {
                    let sampleSequence = samplePatterns.join(' ');
                    
                    // Add rests if unlocked
                    if (prevState.modules['rest_notes']?.acquiredCount > 0) {
                        sampleSequence = sampleSequence.replace(/(\w+)/g, '$1 ~');
                    }
                    
                    // Add speed multipliers if unlocked
                    if (prevState.modules['speed_multiplier']?.acquiredCount > 0) {
                        sampleSequence = sampleSequence.replace(/(\w+)/g, '$1*2');
                    }
                    
                    // Add sub-sequences if unlocked
                    if (prevState.modules['sub_sequences']?.acquiredCount > 0) {
                        sampleSequence = sampleSequence.replace(/bd/g, 'bd [hh hh]');
                    }
                    
                    // Add polyphony if unlocked
                    if (prevState.modules['polyphony']?.acquiredCount > 0 && samplePatterns.length >= 2) {
                        const firstPattern = samplePatterns[0];
                        const secondPattern = samplePatterns[1];
                        sampleSequence = `[${firstPattern},${secondPattern}] [${firstPattern}]`;
                    }
                    
                    // Add cycling patterns if unlocked
                    if (prevState.modules['cycling_patterns']?.acquiredCount > 0) {
                        sampleSequence = `<${sampleSequence}>`;
                    }
                    
                    // Add Euclidean rhythms if unlocked
                    if (prevState.modules['euclidean_engine']?.acquiredCount > 0) {
                        sampleSequence = sampleSequence.replace(/bd/g, 'bd(3,8)').replace(/hh/g, 'hh(2,5)');
                    }
                    
                    patterns.push(`s("${sampleSequence}")`);
                }
                
                // Handle note patterns
                if (notePatterns.length > 0) {
                    patterns.push(...notePatterns);
                }
                
                // Stack patterns if multiple exist
                if (patterns.length > 1) {
                    basePattern = patterns[0] + '.stack(' + patterns.slice(1).join(', ') + ')';
                } else {
                    basePattern = patterns[0] || 's("bd")';
                }
            } else {
                // Simple stacking without sequence building
                basePattern = moduleLines.length > 1 
                    ? moduleLines[0] + '.stack(' + moduleLines.slice(1).join(', ') + ')'
                    : moduleLines[0];
            }
            
            // Apply effects if unlocked
            let finalPattern = basePattern;
            
            if (prevState.modules['reverb_engine']?.acquiredCount > 0) {
                finalPattern += '.room(0.3)';
            }
            if (prevState.modules['delay_unit']?.acquiredCount > 0) {
                finalPattern += '.delay(0.25)';
            }
            if (prevState.modules['filter_bank']?.acquiredCount > 0) {
                finalPattern += '.lpf(800)';
            }
            
            currentStrudelCode = finalPattern;
        }
        
        // Add BPM control if looping is enabled
        if (currentHasLooping) {
            // Convert BPM to CPS for Strudel
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
        const overloadMessages: string[] = [];
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

        // Helper function to safely check module acquisition count
        const getModuleCount = (moduleId: string): number => {
          return updatedState.modules[moduleId]?.acquiredCount || 0;
        };

        // Check for unlocked modules based on Strudel progression phases
        for (const id in STRUDEL_MODULES) {
          const module = STRUDEL_MODULES[id];
          if (updatedState.modules[id] && !updatedState.modules[id].unlocked) {
            let shouldUnlock = false;
            
            // Phase 1: First Sounds (0-100 beats)
            if (id === 'hh_basic' && getModuleCount('bd_basic') > 0 && updatedState.beats >= 10) {
              shouldUnlock = true;
            } else if (id === 'sd_basic' && getModuleCount('hh_basic') > 0 && updatedState.beats >= 50) {
              shouldUnlock = true;
            } else if (id === 'oh_basic' && getModuleCount('sd_basic') > 0 && updatedState.beats >= 75) {
              shouldUnlock = true;
            } else if (id === 'sample_variations' && getModuleCount('oh_basic') > 0 && updatedState.beats >= 100) {
              shouldUnlock = true;
            }
            
            // Phase 2: Mini-notation basics (100-500 beats)
            else if (id === 'sequence_builder' && updatedState.beats >= 120 && getModuleCount('hh_basic') > 0) {
              shouldUnlock = true;
            } else if (id === 'rest_notes' && getModuleCount('sequence_builder') > 0 && updatedState.beats >= 150) {
              shouldUnlock = true;
            } else if (id === 'speed_multiplier' && getModuleCount('rest_notes') > 0 && updatedState.beats >= 200) {
              shouldUnlock = true;
            } else if (id === 'slow_division' && getModuleCount('speed_multiplier') > 0 && updatedState.beats >= 250) {
              shouldUnlock = true;
            }
            
            // Phase 3: Advanced notation (500-1500 beats)
            else if (id === 'sub_sequences' && updatedState.beats >= 500 && updatedState.modules['slow_division'].acquiredCount > 0) {
              shouldUnlock = true;
            } else if (id === 'cycling_patterns' && updatedState.modules['sub_sequences'].acquiredCount > 0 && updatedState.beats >= 600) {
              shouldUnlock = true;
            } else if (id === 'polyphony' && updatedState.modules['cycling_patterns'].acquiredCount > 0 && updatedState.beats >= 800) {
              shouldUnlock = true;
              // Unlock DSP hardware type when polyphony is unlocked
              if (!updatedState.unlockedHardwareTypes.includes('dsp')) {
                updatedState.unlockedHardwareTypes = Array.from(new Set([...updatedState.unlockedHardwareTypes, 'dsp']));
                addNews(`NEW HARDWARE TYPE UNLOCKED: DSP Units available!`);
              }
            } else if (id === 'nested_patterns' && updatedState.modules['polyphony'].acquiredCount > 0 && updatedState.beats >= 1000) {
              shouldUnlock = true;
            }
            
            // Phase 4: Melodic elements (1500-3000 beats)
            else if (id === 'note_c' && updatedState.beats >= 1500) {
              shouldUnlock = true;
            } else if (id === 'octave_control' && updatedState.modules['note_c'].acquiredCount > 0 && updatedState.beats >= 1800) {
              shouldUnlock = true;
            } else if (id === 'note_scale' && updatedState.modules['octave_control'].acquiredCount > 0 && updatedState.beats >= 2200) {
              shouldUnlock = true;
            } else if (id === 'chord_triads' && updatedState.modules['note_scale'].acquiredCount > 0 && updatedState.beats >= 2800) {
              shouldUnlock = true;
            }
            
            // Phase 5: Sound shaping (3000-6000 beats)
            else if (id === 'reverb_engine' && updatedState.beats >= 3000 && updatedState.modules['chord_triads'].acquiredCount > 0) {
              shouldUnlock = true;
            } else if (id === 'delay_unit' && updatedState.modules['reverb_engine'].acquiredCount > 0 && updatedState.beats >= 3500) {
              shouldUnlock = true;
            } else if (id === 'filter_bank' && updatedState.modules['delay_unit'].acquiredCount > 0 && updatedState.beats >= 4000) {
              shouldUnlock = true;
            }
            
            // Phase 6: Rhythm complexity (6000-10000 beats)
            else if (id === 'euclidean_engine' && updatedState.beats >= 6000 && updatedState.modules['filter_bank'].acquiredCount > 0) {
              shouldUnlock = true;
            } else if (id === 'polyrhythm_generator' && updatedState.modules['euclidean_engine'].acquiredCount > 0 && updatedState.beats >= 8000) {
              shouldUnlock = true;
            }
            
            // Phase 7: Synthesis (10000-20000 beats)
            else if (id === 'oscillator_bank' && updatedState.beats >= 10000 && updatedState.modules['polyrhythm_generator'].acquiredCount > 0) {
              shouldUnlock = true;
            } else if (id === 'wavetable_synth' && updatedState.modules['oscillator_bank'].acquiredCount > 0 && updatedState.beats >= 15000) {
              shouldUnlock = true;
            }
            
            // Phase 8: Live coding mastery (20000+ beats)
            else if (id === 'ai_composer' && updatedState.beats >= 20000 && updatedState.modules['wavetable_synth'].acquiredCount > 0) {
              shouldUnlock = true;
            }

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
