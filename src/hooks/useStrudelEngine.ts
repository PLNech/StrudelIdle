// src/hooks/useStrudelEngine.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { repl } from '@strudel/core';
import { mini } from '@strudel/mini';
// import { transpiler } from '@strudel/transpiler'; // Temporarily disabled due to escodegen issue
import { webaudio } from '@strudel/webaudio';

// Initialize Strudel.cc engine outside the component to avoid re-initialization
let strudelInitialized = false;
let tidal: ReturnType<typeof repl> | null = null;
let currentPatternId: number | null = null;

const initStrudel = async () => {
  if (strudelInitialized) return;
  
  // Attempt to initialize WebAudio output first to get user gesture
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  // Request user gesture if AudioContext is suspended
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  console.log('AudioContext state:', audioContext.state);
  
  try {
    tidal = repl({
      scheduler: webaudio.scheduler(audioContext),
      plugins: [mini], // Removed transpiler temporarily
    });
    console.log('Strudel.cc initialized:', tidal);
    strudelInitialized = true;
  } catch (error) {
    console.error('Error initializing Strudel.cc:', error);
    // Fallback or display error message to user
  }
};

// Start playing a pattern
const playStrudelPattern = (code: string, bpm: number) => {
  if (!tidal) {
    console.warn('Strudel.cc not initialized, cannot play pattern.');
    return;
  }
  
  // Clear previous pattern
  if (currentPatternId !== null) {
    tidal.stop(currentPatternId);
  }
  
  // Set BPM
  // For repl, we might need to use a different method to set BPM
  try {
    (tidal as any).setBPM?.(bpm) || ((tidal as any).scheduler?.setBPM?.(bpm));
  } catch (e) {
    console.warn('Could not set BPM:', e);
  }
  
  try {
    // Evaluate the new pattern
    currentPatternId = tidal.eval(code);
    console.log(`Strudel.cc playing: ${code} at ${bpm} BPM (Pattern ID: ${currentPatternId})`);
  } catch (error) {
    console.error('Error evaluating Strudel.cc code:', error);
    // Display error in news feed or UI
  }
};

const stopStrudel = () => {
  if (tidal && currentPatternId !== null) {
    tidal.stop(currentPatternId);
    currentPatternId = null;
    console.log('Strudel.cc stopped.');
  }
};

export const useStrudelEngine = (code: string, bpm: number, autoStart: boolean = false) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioInitializedRef = useRef(false);
  
  // Effect to initialize Strudel on first interaction or mount
  useEffect(() => {
    // We want to initialize only once and preferably after a user gesture.
    // The togglePlay button handles the user gesture.
    // If autoStart is true (e.g., for testing or if save loads a playing state),
    // we'll try to initialize immediately, but still need user gesture for audio.
    if (autoStart && !audioInitializedRef.current) {
      initStrudel().then(() => {
        audioInitializedRef.current = true;
        // If the game was saved in a playing state, attempt to resume playback.
        if (code && isPlaying) {
          playStrudelPattern(code, bpm);
        }
      });
    }
  }, [autoStart, code, bpm, isPlaying]);
  
  // Effect to update the playing pattern when code or BPM changes
  useEffect(() => {
    if (isPlaying && audioInitializedRef.current) {
      playStrudelPattern(code, bpm);
    }
  }, [code, bpm, isPlaying]);
  
  const togglePlay = useCallback(async () => {
    if (!audioInitializedRef.current) {
      // Ensure audio context is resumed by user gesture on first play attempt
      await initStrudel();
      audioInitializedRef.current = true;
    }
    
    
    if (isPlaying) {
      stopStrudel();
      setIsPlaying(false);
    } else {
      playStrudelPattern(code, bpm);
      setIsPlaying(true);
    }
    
    
  }, [code, bpm, isPlaying]);
  
  return { togglePlay, isPlaying, strudelReady: audioInitializedRef.current };
};
