// src/hooks/useStrudelEngine.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { initStrudel } from '@strudel/web';

// Global state for Strudel initialization
let strudelInitialized = false;

const initStrudelEngine = async () => {
  if (strudelInitialized) return;
  
  try {
    console.log('Initializing Strudel.cc...');
    // Initialize Strudel with optional sample preloading
    await initStrudel({
      prebake: () => (window as any).samples?.('github:tidalcycles/dirt-samples') || Promise.resolve(),
    });
    strudelInitialized = true;
    console.log('Strudel.cc initialized successfully!');
  } catch (error) {
    console.error('Error initializing Strudel.cc:', error);
    // Try basic initialization without samples
    try {
      await initStrudel();
      strudelInitialized = true;
      console.log('Strudel.cc initialized without samples');
    } catch (fallbackError) {
      console.error('Failed to initialize Strudel.cc:', fallbackError);
    }
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
    
    // Set BPM if available
    if ((window as any).setBpm) {
      (window as any).setBpm(bpm);
    }
    
    console.log(`Playing Strudel pattern: ${code} at ${bpm} BPM`);
    
    // Evaluate the pattern using global evaluate function
    if ((window as any).evaluate) {
      (window as any).evaluate(code);
    } else {
      console.warn('Strudel evaluate function not available');
    }
  } catch (error) {
    console.error('Error playing Strudel pattern:', error);
  }
};

const stopStrudel = () => {
  try {
    if ((window as any).hush) {
      (window as any).hush();
      console.log('Strudel.cc stopped.');
    } else {
      console.warn('Strudel hush function not available');
    }
  } catch (error) {
    console.error('Error stopping Strudel:', error);
  }
};

export const useStrudelEngine = (code: string, bpm: number, autoStart: boolean = false) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [strudelReady, setStrudelReady] = useState(false);
  
  // Effect to initialize Strudel on mount
  useEffect(() => {
    if (!strudelInitialized) {
      initStrudelEngine().then(() => {
        setStrudelReady(true);
      });
    } else {
      setStrudelReady(true);
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
