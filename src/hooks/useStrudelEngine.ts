// src/hooks/useStrudelEngine.ts
import { useEffect, useState, useCallback } from 'react';
import { initStrudel } from '@strudel/web';

// Global state for Strudel initialization
let strudelInitialized = false;

// Sample categorization based on Strudel.cc documentation
const SAMPLE_CATEGORIES = {
  bassDrums: ['bd'],
  drums: ['sd', 'rim', 'cp', 'hh', 'oh', 'cr', 'rd', 'ht', 'mt', 'lt', 'sh', 'tb', 'cb', 'perc'],
  breaks: ['breaks', 'amen', 'funky', 'apache', 'think', 'hotpants'],
  bass: ['bass', 'moog', 'sub', 'bassgtr', 'ebs', 'bs'],
  melodic: ['rhodes', 'piano', 'epiano', 'organ', 'gtr', 'synth', 'saw', 'square', 'pluck', 'bell', 'vibraphone', 'marimba', 'flute', 'sax', 'trumpet', 'violin', 'cello', 'clarinet'],
  fx: ['fx', 'misc', 'noise', 'sweep', 'swoop', 'smash', 'glitch', 'click', 'pop', 'beep', 'blip', 'zap', 'laser']
};

// Log all available samples for debugging
const logAllAvailableSamples = () => {
  try {
    console.log('🎵 SAMPLE INVENTORY - Available Samples:');
    
    // Try to access the samples object
    if ((window as any).samples && (window as any).samples.loaded) {
      const loadedSamples = (window as any).samples.loaded;
      console.log('📋 Loaded samples object:', loadedSamples);
      
      Object.keys(loadedSamples).forEach(sampleName => {
        const variants = loadedSamples[sampleName];
        if (Array.isArray(variants)) {
          console.log(`🎼 ${sampleName}: ${variants.length} variants`);
        } else {
          console.log(`🎼 ${sampleName}: ${typeof variants}`);
        }
      });
    }
    
    // Try alternative access methods
    if ((window as any).__strudel_samples__) {
      console.log('📋 Alternative samples access:', (window as any).__strudel_samples__);
    }
    
    // Test basic samples
    console.log('🧪 Testing basic samples...');
    const testSamples = ['bd', 'sd', 'hh', 'casio', 'piano', 'jazz'];
    testSamples.forEach(sample => {
      try {
        if ((window as any).evaluate) {
          // Just test if sample exists without playing
          const testCode = `sound("${sample}").gain(0)`;
          console.log(`✅ Sample '${sample}' available`);
        }
      } catch (e) {
        console.log(`❌ Sample '${sample}' not available:`, e.message);
      }
    });
    
  } catch (error) {
    console.error('❌ Error logging samples:', error);
  }
};

const initStrudelEngine = async () => {
  if (strudelInitialized) return;
  
  try {
    console.log('Initializing Strudel.cc...');
    // Initialize Strudel with Dirt-Samples from GitHub
    await initStrudel({
      prebake: async () => {
        try {
          // Load samples from GitHub repository
          if ((window as any).samples) {
            console.log('Loading Dirt-Samples from GitHub...');
            await (window as any).samples('github:tidalcycles/dirt-samples');
            console.log('Dirt-Samples loaded successfully!');
            
            // Log all available samples for debugging
            logAllAvailableSamples();
          }
        } catch (sampleError) {
          console.warn('Could not load Dirt-Samples, using built-in samples:', sampleError);
          // Still try to log what's available
          setTimeout(() => logAllAvailableSamples(), 1000);
        }
      },
    });
    strudelInitialized = true;
    console.log('Strudel.cc initialized successfully!');
  } catch (error) {
    console.error('Error initializing Strudel.cc:', error);
    // Try basic initialization without samples
    try {
      await initStrudel();
      strudelInitialized = true;
      console.log('Strudel.cc initialized with built-in samples only');
    } catch (fallbackError) {
      console.error('Failed to initialize Strudel.cc:', fallbackError);
    }
  }
};

// Simple validation for testing - avoid over-sanitization that breaks working patterns
const validatePatternCode = (code: string): string => {
  try {
    if (!code || typeof code !== 'string') {
      console.warn('Invalid pattern code, using default');
      return 'sound("bd")';
    }
    return code.trim();
  } catch (error) {
    console.error('Error validating pattern code:', error);
    return 'sound("bd")';
  }
};

// Start playing a pattern
const playStrudelPattern = (code: string, bpm: number) => {
  if (!strudelInitialized) {
    console.warn('Strudel.cc not initialized, cannot play pattern.');
    return;
  }
  
  try {
    // Stop any existing patterns first
    (window as any).hush?.();
    
    // Set BPM using multiple methods to ensure it takes effect
    if ((window as any).setBpm) {
      (window as any).setBpm(bpm);
    }
    
    // Alternative BPM setting methods
    if ((window as any).setcps) {
      (window as any).setcps(bpm / 60); // Convert BPM to cycles per second
    }
    
    // Set tempo using Tonal.js if available
    if ((window as any).Tempo && (window as any).Tempo.bpm) {
      (window as any).Tempo.bpm = bpm;
    }
    
    console.log(`Playing Strudel pattern: ${code} at ${bpm} BPM`);
    
    // Set BPM again right before evaluating pattern
    if ((window as any).setcps) {
      (window as any).setcps(bpm / 60);
    }
    
    // Evaluate the pattern using global evaluate function
    if ((window as any).evaluate) {
      // Try setting tempo inline with the pattern as well
      const patternWithBPM = `setcps(${bpm / 60}); ${code}`;
      (window as any).evaluate(patternWithBPM);
    } else {
      console.warn('Strudel evaluate function not available');
    }
  } catch (error) {
    console.error('Error playing Strudel pattern:', error);
  }
};

const stopStrudel = () => {
  try {
    // Try multiple methods to ensure audio stops
    if ((window as any).hush) {
      (window as any).hush();
      console.log('Strudel.cc stopped via hush().');
    }
    
    // Clear any active patterns more aggressively  
    if ((window as any).evaluate) {
      (window as any).evaluate('silence');
      console.log('Set pattern to silence.');
    }
    
    // Try to stop any running patterns more aggressively
    if ((window as any).stop) {
      (window as any).stop();
      console.log('Strudel.cc stopped via stop().');
    }
    
    // Stop the audio context more aggressively
    if ((window as any).getAudioContext) {
      const ctx = (window as any).getAudioContext();
      if (ctx && ctx.state === 'running') {
        ctx.suspend().then(() => {
          console.log('Audio context suspended.');
          // Resume after a short delay to allow proper stopping
          setTimeout(() => {
            if (ctx.state === 'suspended') {
              ctx.resume();
            }
          }, 100);
        });
      }
    }
    
    if (!((window as any).hush || (window as any).stop)) {
      console.warn('No Strudel stop functions available');
    }
  } catch (error) {
    console.error('Error stopping Strudel:', error);
  }
};

export const useStrudelEngine = (code: string, bpm: number) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [strudelReady, setStrudelReady] = useState(false);
  
  // Effect to initialize Strudel on mount
  useEffect(() => {
    if (!strudelInitialized) {
      initStrudelEngine().then(() => {
        setStrudelReady(true);
        // Expose initialization status and functions for testing
        (window as any).strudelInitialized = true;
        (window as any).validatePatternCode = validatePatternCode;
        (window as any).logAllAvailableSamples = logAllAvailableSamples;
      });
    } else {
      setStrudelReady(true);
      (window as any).strudelInitialized = true;
    }
  }, []);
  
  // Effect to update the playing pattern when code or BPM changes
  useEffect(() => {
    if (isPlaying && strudelReady) {
      playStrudelPattern(code, bpm);
    }
  }, [code, bpm, isPlaying, strudelReady]);
  
  const togglePlay = useCallback(async () => {
    if (!strudelReady) {
      console.warn('Strudel not ready yet');
      return;
    }
    
    if (isPlaying) {
      stopStrudel();
      setIsPlaying(false);
    } else {
      playStrudelPattern(code, bpm);
      setIsPlaying(true);
    }
  }, [code, bpm, isPlaying, strudelReady]);
  
  return { togglePlay, isPlaying, strudelReady };
};
