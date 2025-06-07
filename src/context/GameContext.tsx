// src/context/GameContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GameState, INITIAL_GAME_STATE, Module, NewsItem } from '../types';
import { STRUDEL_MODULES } from '../data/strudelModules';
import { SAMPLE_BANKS, getSampleUnlockProgression } from '../data/sampleScanner';

// Utility functions for Strudel modules
function getModuleCost(module: Module): number {
  return module.baseCost * Math.pow(1.15, module.acquiredCount);
}

function getModuleEffectiveBPS(module: Module): number {
  return module.bpsPerUnit * module.acquiredCount;
}
import { ALL_HARDWARE, getHardwareCost } from '../data/hardware';
import { initializeAchievements, checkAchievements } from '../data/achievements';
import { ALL_PHASES } from '../data/progression';
import { CodeGenerator } from '../utils/codeGenerator';

interface GameContextType {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  addBeats: (amount: number) => void;
  purchaseModule: (moduleId: string) => void;
  purchaseHardware: (hardwareId: string) => void;
  addNews: (message: string) => void;
  // New progression system
  purchasePhase: (phaseId: string, cost: number) => void;
  purchaseFeature: (featureId: string, cost: number) => void;
  // Code-o-matic
  purchaseCodeOMatic: () => void;
  toggleCodeOMatic: () => void;
  setCodeOMaticComplexity: (complexity: number) => void;
  // Sample banks
  purchaseSampleBank: (bankId: string) => void;
  purchaseSampleVariant: (bankId: string, variantIndex: number) => void;
  setActiveSample: (sample: string) => void;
  toggleSampleEnabled: (bankId: string) => void;
  // Multi-line sound system
  unlockSoundLine: (lineNumber: 2 | 3 | 4) => void;
  setSoundLineSample: (lineKey: 'line1' | 'line2' | 'line3' | 'line4', sample: string) => void;
  unlockMelodicSample: (sample: string) => void;
  unlockMusicalFeature: (feature: 'notes' | 'chords' | 'progressions' | 'circleOfFifths' | 'jazzSequences') => void;
  // BPM upgrades
  purchaseBPMUpgrade: (bpm: number) => void;
  purchaseBPMSlider: () => void;
  setBPM: (bpm: number) => void;
  // Debug functions
  resetPatternState: () => void;
  // AST Pattern System
  updatePatternAST: (lineKey: 'line1' | 'line2' | 'line3' | 'line4', ast: import('../types/ast').ASTNode | null) => void;
  toggleInteractiveMode: () => void;
  trackSampleUsage: (sampleName: string, duration: number) => void;
  // Jazz Theory Progressions
  purchaseJazzProgression: (progressionId: string, cost: number) => void;
  playJazzProgression: (progressionId: string) => void;
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

  // Counter to ensure unique news item IDs
  const newsCounterRef = useRef(0);
  
  // Queue for news messages to avoid calling addNews from within setGameState
  const newsQueueRef = useRef<string[]>([]);

  // Memoize addNews as it's used internally by effects and callbacks
  const addNews = useCallback((message: string) => {
    setGameState(prevState => {
      newsCounterRef.current += 1;
      const newNewsItem: NewsItem = { 
        id: `${Date.now()}-${newsCounterRef.current}`, 
        message, 
        timestamp: Date.now() 
      };
      const updatedNewsFeed = [newNewsItem, ...prevState.newsFeed].slice(0, 10); // Keep last 10 items
      return { ...prevState, newsFeed: updatedNewsFeed };
    });
  }, []); // No dependencies as it only uses prevState and counter ref

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
                // Queue the news message instead of calling addNews directly
                newsQueueRef.current.push(`WARNING: ${msg} Beats generation reduced.`);
            }
        });
        currentBPS *= overloadPenalty;

        newBeats = prevState.beats + currentBPS * deltaTime; // Update beats after penalty


        // Code-o-matic pattern generation
        let finalStrudelCode = currentStrudelCode;
        let updatedCodeOMatic = prevState.codeOMatic;
        
        // Use manual pattern override if set, otherwise use generated code
        if (prevState.manualPatternOverride) {
          finalStrudelCode = prevState.manualPatternOverride;
        } else if (prevState.codeOMatic?.purchased && prevState.codeOMatic?.enabled) {
          const now = Date.now();
          const timeSinceLastGeneration = (now - prevState.codeOMatic.lastGeneration) / 1000;
          const isPaused = prevState.codeOMatic.pausedUntil && now < prevState.codeOMatic.pausedUntil;
          
          if (timeSinceLastGeneration >= prevState.codeOMatic.generationInterval && !isPaused) {
            try {
              const codeGenerator = new CodeGenerator();
              const unlockedFeatures = ALL_PHASES
                .flatMap(phase => phase.features)
                .filter(feature => prevState.unlockedFeatures.includes(feature.id));
              
              const generationContext = {
                unlockedFeatures,
                complexity: prevState.codeOMatic.complexity,
                unlockedBanks: prevState.sampleBanks.unlockedBanks,
                bankVariants: prevState.sampleBanks.bankVariants
              };
              
              finalStrudelCode = codeGenerator.generatePattern(generationContext);
              updatedCodeOMatic = {
                ...prevState.codeOMatic,
                lastGeneration: Date.now()
              };
              
              console.log('🤖 Code-o-matic generated NEW pattern:', finalStrudelCode);
              console.log('🤖 Replacing current code:', currentStrudelCode);
            } catch (error) {
              console.error('Code-o-matic generation error:', error);
            }
          }
        }

        const updatedState: GameState = {
          ...prevState,
          beats: newBeats,
          bps: currentBPS,
          hardware: newHardware,
          gameTime: prevState.gameTime + deltaTime, // Use delta from gameLoop
          strudelCode: finalStrudelCode,
          strudelBPM: currentStrudelBPM,
          hasLooping: currentHasLooping,
          codeOMatic: updatedCodeOMatic,
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

        // Check for automatic sample bank unlocks
        const progressionUnlocks = getSampleUnlockProgression(updatedState.beats);
        const newUnlockedBanks = progressionUnlocks.filter(bankId => 
          !updatedState.sampleBanks.unlockedBanks.includes(bankId)
        );
        
        if (newUnlockedBanks.length > 0) {
          updatedState.sampleBanks = {
            ...updatedState.sampleBanks,
            unlockedBanks: [...updatedState.sampleBanks.unlockedBanks, ...newUnlockedBanks],
          };
          
          // Initialize bank variants for new banks (first variant unlocked)
          for (const bankId of newUnlockedBanks) {
            if (!updatedState.sampleBanks.bankVariants[bankId]) {
              updatedState.sampleBanks.bankVariants[bankId] = [0];
              updatedState.sampleBanks.totalSamplesUnlocked += 1;
            }
            const bank = SAMPLE_BANKS[bankId];
            if (bank) {
              addNews(`🎵 New sample bank available: ${bank.name}!`);
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
  }, []); // Remove addNews dependency to break the infinite loop
  
  // Process queued news messages after state updates
  useEffect(() => {
    if (newsQueueRef.current.length > 0) {
      const messages = [...newsQueueRef.current];
      newsQueueRef.current = []; // Clear the queue
      
      // Add all queued messages
      messages.forEach(message => {
        addNews(message);
      });
    }
  }, [gameState.beats, addNews]); // Trigger when beats change (indicating game loop ran)

  // --- State Modifiers ---
  const addBeats = useCallback((amount: number) => {
    setGameState(prevState => {
      // Calculate enhanced click reward based on unlocked samples
      const totalUnlockedSamples = prevState.sampleBanks.totalSamplesUnlocked;
      const log2Factor = totalUnlockedSamples > 1 ? Math.log2(totalUnlockedSamples) : 1;
      const enhancedAmount = amount * totalUnlockedSamples * log2Factor;
      
      return {
        ...prevState,
        beats: prevState.beats + enhancedAmount,
      };
    });
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

  // New progression system functions
  const purchasePhase = useCallback((phaseId: string, cost: number) => {
    setGameState(prevState => {
      if (prevState.beats >= cost && !prevState.unlockedPhases.includes(phaseId)) {
        addNews(`🎓 Phase unlocked: ${phaseId.replace('_', ' ').toUpperCase()}!`);
        return {
          ...prevState,
          beats: prevState.beats - cost,
          unlockedPhases: [...prevState.unlockedPhases, phaseId],
        };
      }
      return prevState;
    });
  }, [addNews]);

  const purchaseFeature = useCallback((featureId: string, cost: number) => {
    setGameState(prevState => {
      if (prevState.beats >= cost && !prevState.unlockedFeatures.includes(featureId)) {
        // Find the feature to get its name
        const feature = ALL_PHASES
          .flatMap(phase => phase.features)
          .find(f => f.id === featureId);
        
        addNews(`✨ New feature learned: ${feature?.name || featureId}!`);
        return {
          ...prevState,
          beats: prevState.beats - cost,
          unlockedFeatures: [...prevState.unlockedFeatures, featureId],
        };
      }
      return prevState;
    });
  }, [addNews]);

  // Code-o-matic functions
  const purchaseCodeOMatic = useCallback(() => {
    setGameState(prevState => {
      if (prevState.beats >= prevState.codeOMatic.cost && !prevState.codeOMatic.purchased) {
        addNews(`🤖 Code-o-matic purchased! Auto-generation enabled.`);
        return {
          ...prevState,
          beats: prevState.beats - prevState.codeOMatic.cost,
          codeOMatic: {
            ...prevState.codeOMatic,
            purchased: true,
          },
        };
      }
      return prevState;
    });
  }, [addNews]);

  const toggleCodeOMatic = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      codeOMatic: {
        ...prevState.codeOMatic,
        enabled: !prevState.codeOMatic.enabled,
        lastGeneration: Date.now(), // Reset timer when toggling
      },
    }));
  }, []);

  const setCodeOMaticComplexity = useCallback((complexity: number) => {
    setGameState(prevState => ({
      ...prevState,
      codeOMatic: {
        ...prevState.codeOMatic,
        complexity: Math.max(0, Math.min(1, complexity)),
      },
    }));
  }, []);

  // Sample bank functions
  const purchaseSampleBank = useCallback((bankId: string) => {
    setGameState(prevState => {
      const bank = SAMPLE_BANKS[bankId];
      if (!bank) return prevState;
      
      if (prevState.beats >= bank.unlockCost && !prevState.sampleBanks.unlockedBanks.includes(bankId)) {
        addNews(`🎵 Sample bank unlocked: ${bank.name}!`);
        return {
          ...prevState,
          beats: prevState.beats - bank.unlockCost,
          sampleBanks: {
            ...prevState.sampleBanks,
            unlockedBanks: [...prevState.sampleBanks.unlockedBanks, bankId],
            bankVariants: {
              ...prevState.sampleBanks.bankVariants,
              [bankId]: [0] // Unlock first variant
            },
            totalSamplesUnlocked: prevState.sampleBanks.totalSamplesUnlocked + 1,
          },
        };
      }
      return prevState;
    });
  }, [addNews]);

  const purchaseSampleVariant = useCallback((bankId: string, variantIndex: number) => {
    setGameState(prevState => {
      const bank = SAMPLE_BANKS[bankId];
      if (!bank || variantIndex >= bank.variantCount) return prevState;
      
      const variant = bank.variants[variantIndex];
      const currentVariants = prevState.sampleBanks.bankVariants[bankId] || [];
      
      if (prevState.beats >= variant.unlockCost && !currentVariants.includes(variantIndex)) {
        addNews(`🔊 New variant unlocked: ${bank.name} #${variantIndex}!`);
        return {
          ...prevState,
          beats: prevState.beats - variant.unlockCost,
          sampleBanks: {
            ...prevState.sampleBanks,
            bankVariants: {
              ...prevState.sampleBanks.bankVariants,
              [bankId]: [...currentVariants, variantIndex].sort((a, b) => a - b),
            },
            totalSamplesUnlocked: prevState.sampleBanks.totalSamplesUnlocked + 1,
          },
        };
      }
      return prevState;
    });
  }, [addNews]);

  const setActiveSample = useCallback((sample: string) => {
    console.log('🎵 setActiveSample called with:', sample);
    setGameState(prevState => {
      console.log('🎵 Current loaded variants before change:', prevState.loadedSampleVariants);
      console.log('🎵 Current manual override:', prevState.manualPatternOverride);
      
      // If it's a Strudel pattern/syntax (contains parentheses), use as-is
      if (sample.includes('(') && sample.includes(')')) {
        console.log('🎵 Setting full pattern:', sample);
        return {
          ...prevState,
          manualPatternOverride: sample,
          // Pause Code-o-matic for 30 seconds to prevent overriding manual selections
          codeOMatic: {
            ...prevState.codeOMatic,
            pausedUntil: Date.now() + 30000, // 30 seconds pause
          },
        };
      }
      
      // Extract base sample name and variant
      const [baseSample, variantStr] = sample.includes(':') ? sample.split(':') : [sample, '0'];
      const variant = parseInt(variantStr, 10);
      
      console.log('🎵 Base sample:', baseSample, 'Variant:', variant);
      
      // Update the loaded sample variant for this bank
      const newLoadedVariants = {
        ...prevState.loadedSampleVariants,
        [baseSample]: variant,
      };
      
      // Create a simple pattern using the selected sample
      const newPattern = `s("${sample}")`;
      
      console.log('🎵 Updated loaded variants:', newLoadedVariants);
      console.log('🎵 Setting manual pattern to:', newPattern);
      
      const result = {
        ...prevState,
        loadedSampleVariants: newLoadedVariants,
        manualPatternOverride: newPattern,
        // Pause Code-o-matic for 30 seconds to prevent overriding manual selections
        codeOMatic: {
          ...prevState.codeOMatic,
          enabled: false, // Temporarily disable to prevent interference
          pausedUntil: Date.now() + 30000, // 30 seconds pause
        },
      };
      
      console.log('🎵 Final result - loaded variants:', result.loadedSampleVariants);
      console.log('🎵 Final result - manual override:', result.manualPatternOverride);
      console.log('🎵 Code-o-matic disabled and paused for debugging');
      return result;
    });
  }, []);

  // BPM upgrade functions
  const purchaseBPMUpgrade = useCallback((bpm: number) => {
    setGameState(prevState => {
      // Calculate cost based on BPM (higher BPMs cost more)
      const baseCost = 100;
      const bpmCostMultiplier = Math.pow(1.5, Math.floor((bpm - 60) / 10));
      const cost = Math.floor(baseCost * bpmCostMultiplier);
      
      if (prevState.beats >= cost && !prevState.bpmUpgrades.unlockedBPMs.includes(bpm)) {
        addNews(`🎵 BPM ${bpm} unlocked!`);
        return {
          ...prevState,
          beats: prevState.beats - cost,
          bpmUpgrades: {
            ...prevState.bpmUpgrades,
            unlockedBPMs: [...prevState.bpmUpgrades.unlockedBPMs, bpm].sort((a, b) => a - b),
          },
        };
      }
      return prevState;
    });
  }, [addNews]);

  const purchaseBPMSlider = useCallback(() => {
    setGameState(prevState => {
      if (prevState.beats >= prevState.bpmUpgrades.sliderCost && !prevState.bpmUpgrades.hasSlider) {
        addNews(`🎛️ BPM Slider unlocked! Full tempo control available.`);
        return {
          ...prevState,
          beats: prevState.beats - prevState.bpmUpgrades.sliderCost,
          bpmUpgrades: {
            ...prevState.bpmUpgrades,
            hasSlider: true,
          },
        };
      }
      return prevState;
    });
  }, [addNews]);

  const setBPM = useCallback((bpm: number) => {
    setGameState(prevState => {
      // Only allow setting BPM if it's unlocked or slider is available
      const canSetBPM = prevState.bpmUpgrades.hasSlider || 
                       prevState.bpmUpgrades.unlockedBPMs.includes(bpm);
      
      if (canSetBPM) {
        return {
          ...prevState,
          strudelBPM: Math.max(60, Math.min(180, bpm)), // Clamp to valid range
        };
      }
      return prevState;
    });
  }, []);

  const resetPatternState = useCallback(() => {
    console.log('🔄 Resetting entire game state except achievements');
    setGameState(prevState => ({
      ...INITIAL_GAME_STATE,
      // Keep achievements
      achievements: prevState.achievements,
      // Reset modules to initial state
      modules: (() => {
        const resetModules: { [id: string]: Module } = {};
        for (const id in STRUDEL_MODULES) {
          resetModules[id] = { ...STRUDEL_MODULES[id] };
        }
        // Explicitly unlock the first basic drum module
        if (resetModules['bd_basic']) {
          resetModules['bd_basic'] = { ...resetModules['bd_basic'], unlocked: true };
        }
        return resetModules;
      })(),
      // Reset hardware to initial state
      hardware: {
        ...INITIAL_GAME_STATE.hardware,
        ram: { ...INITIAL_GAME_STATE.hardware.ram, total: ALL_HARDWARE['ram_stick_1gb']?.capacity || 0 },
        cpu: { ...INITIAL_GAME_STATE.hardware.cpu, total: ALL_HARDWARE['cpu_core_1']?.capacity || 0 },
      },
    }));
    addNews('🔄 Game reset! Starting fresh journey with achievements intact.');
  }, [addNews]);

  const toggleSampleEnabled = useCallback((bankId: string) => {
    setGameState(prevState => {
      const newEnabledSamples = {
        ...prevState.enabledSamples,
        [bankId]: !prevState.enabledSamples[bankId],
      };
      
      console.log('🎵 Toggling sample enabled state:', bankId, '→', !prevState.enabledSamples[bankId]);
      console.log('🎵 New enabled samples:', newEnabledSamples);
      
      return {
        ...prevState,
        enabledSamples: newEnabledSamples,
      };
    });
  }, []);

  // Multi-line sound system functions
  const unlockSoundLine = useCallback((lineNumber: 2 | 3 | 4) => {
    const costs = { 2: 500, 3: 1500, 4: 3000 };
    const cost = costs[lineNumber];
    
    setGameState(prevState => {
      if (prevState.beats >= cost) {
        const lineKey = `line${lineNumber}` as 'line2' | 'line3' | 'line4';
        addNews(`🎼 Sound Line ${lineNumber} unlocked! Add melodic elements to your track.`);
        return {
          ...prevState,
          beats: prevState.beats - cost,
          soundLines: {
            ...prevState.soundLines,
            [lineKey]: {
              ...prevState.soundLines[lineKey],
              enabled: true,
            },
          },
        };
      }
      return prevState;
    });
  }, [addNews]);

  const setSoundLineSample = useCallback((lineKey: 'line1' | 'line2' | 'line3' | 'line4', sample: string) => {
    setGameState(prevState => ({
      ...prevState,
      soundLines: {
        ...prevState.soundLines,
        [lineKey]: {
          ...prevState.soundLines[lineKey],
          selectedSample: sample,
        },
      },
    }));
  }, []);

  const unlockMelodicSample = useCallback((sample: string) => {
    const costs: { [key: string]: number } = {
      casio: 200,
      jazz: 400,
      piano: 600,
      rhodes: 800,
      strings: 1000,
      brass: 1200,
    };
    
    const cost = costs[sample] || 500;
    
    setGameState(prevState => {
      if (prevState.beats >= cost && !prevState.unlockedMelodicSamples.includes(sample)) {
        addNews(`🎹 Melodic sample unlocked: ${sample.charAt(0).toUpperCase() + sample.slice(1)}!`);
        return {
          ...prevState,
          beats: prevState.beats - cost,
          unlockedMelodicSamples: [...prevState.unlockedMelodicSamples, sample],
        };
      }
      return prevState;
    });
  }, [addNews]);

  const unlockMusicalFeature = useCallback((feature: 'notes' | 'chords' | 'progressions' | 'circleOfFifths' | 'jazzSequences') => {
    const costs = {
      notes: 300,
      chords: 800,
      progressions: 2000,
      circleOfFifths: 5000,
      jazzSequences: 10000,
    };
    
    const cost = costs[feature];
    
    setGameState(prevState => {
      if (prevState.beats >= cost && !prevState.musicalFeatures[feature]) {
        const featureNames = {
          notes: 'Musical Notes',
          chords: 'Chord Theory',
          progressions: 'Chord Progressions',
          circleOfFifths: 'Circle of Fifths',
          jazzSequences: 'Jazz Sequences',
        };
        
        addNews(`🎼 Musical feature unlocked: ${featureNames[feature]}!`);
        return {
          ...prevState,
          beats: prevState.beats - cost,
          musicalFeatures: {
            ...prevState.musicalFeatures,
            [feature]: true,
          },
        };
      }
      return prevState;
    });
  }, [addNews]);

  // AST Pattern System functions
  const updatePatternAST = useCallback((lineKey: 'line1' | 'line2' | 'line3' | 'line4', ast: import('../types/ast').ASTNode | null) => {
    setGameState(prevState => ({
      ...prevState,
      patternAST: {
        ...prevState.patternAST,
        [lineKey]: ast
      }
    }));
  }, []);

  const toggleInteractiveMode = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      interactiveMode: !prevState.interactiveMode
    }));
  }, []);

  const trackSampleUsage = useCallback((sampleName: string, duration: number) => {
    setGameState(prevState => {
      const currentStats = prevState.sampleUsageStats[sampleName] || {
        timesUsed: 0,
        totalPlayTimeSeconds: 0,
        lastUsed: 0
      };

      return {
        ...prevState,
        sampleUsageStats: {
          ...prevState.sampleUsageStats,
          [sampleName]: {
            timesUsed: currentStats.timesUsed + 1,
            totalPlayTimeSeconds: currentStats.totalPlayTimeSeconds + duration,
            lastUsed: Date.now()
          }
        }
      };
    });
  }, []);

  // Jazz Theory Progression functions
  const purchaseJazzProgression = useCallback((progressionId: string, cost: number) => {
    setGameState(prevState => {
      if (prevState.beats < cost) return prevState;
      if (prevState.jazzProgressions[progressionId]?.unlocked) return prevState;

      return {
        ...prevState,
        beats: prevState.beats - cost,
        jazzProgressions: {
          ...prevState.jazzProgressions,
          [progressionId]: {
            unlocked: true,
            purchaseDate: Date.now(),
            timesPlayed: 0
          }
        }
      };
    });
  }, []);

  const playJazzProgression = useCallback((progressionId: string) => {
    setGameState(prevState => {
      const progression = prevState.jazzProgressions[progressionId];
      if (!progression?.unlocked) return prevState;

      return {
        ...prevState,
        jazzProgressions: {
          ...prevState.jazzProgressions,
          [progressionId]: {
            ...progression,
            timesPlayed: progression.timesPlayed + 1
          }
        }
      };
    });
  }, []);

  const contextValue = useMemo(() => ({
    gameState,
    setGameState,
    addBeats,
    purchaseModule,
    purchaseHardware,
    addNews,
    // New progression system
    purchasePhase,
    purchaseFeature,
    // Code-o-matic
    purchaseCodeOMatic,
    toggleCodeOMatic,
    setCodeOMaticComplexity,
    // Sample banks
    purchaseSampleBank,
    purchaseSampleVariant,
    setActiveSample,
    toggleSampleEnabled,
    // Multi-line sound system
    unlockSoundLine,
    setSoundLineSample,
    unlockMelodicSample,
    unlockMusicalFeature,
    // BPM upgrades
    purchaseBPMUpgrade,
    purchaseBPMSlider,
    setBPM,
    // Debug functions
    resetPatternState,
    // AST Pattern System
    updatePatternAST,
    toggleInteractiveMode,
    trackSampleUsage,
    // Jazz Theory Progressions
    purchaseJazzProgression,
    playJazzProgression,
  }), [gameState, setGameState, addBeats, purchaseModule, purchaseHardware, addNews, purchasePhase, purchaseFeature, purchaseCodeOMatic, toggleCodeOMatic, setCodeOMaticComplexity, purchaseSampleBank, purchaseSampleVariant, setActiveSample, toggleSampleEnabled, unlockSoundLine, setSoundLineSample, unlockMelodicSample, unlockMusicalFeature, purchaseBPMUpgrade, purchaseBPMSlider, setBPM, resetPatternState, updatePatternAST, toggleInteractiveMode, trackSampleUsage, purchaseJazzProgression, playJazzProgression]);

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
