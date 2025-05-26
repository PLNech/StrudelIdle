// src/hooks/useStrudelEngine.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { core } from '@strudel/core';
import { mini } from '@strudel/mini';
import { transpiler } from '@strudel/transpiler';
import { webaudio } from '@strudel/webaudio';

// Initialize Strudel.cc engine outside the component to avoid re-initialization
let strudelInitialized = false;
let tidal: ReturnType<typeof core> | null = null;
let currentPatternId: number | null = null;

const initStrudel = async () => {
  if (strudelInitialized) return;
  
  // Attempt to initialize WebAudio output first to get user gesture
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  await audioContext.resume(); // Resume if suspended by browser policy
  console.log('AudioContext state:', audioContext.state);

  try {
    tidal = core({
      _scheduler: {
        scheduler: webaudio.scheduler(audioContext),
      },
      _plugins: [mini, transpiler],
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
  (tidal as any)._scheduler.setBPM(bpm); // Direct access for MVP, might need to be exposed better by strudel

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
    if (autoStart && !audioInitializedRef.current) {
      initStrudel().then(() => {
        audioInitializedRef.current = true;
        // Automatically start playing if autoStart is true and it's the first time
        if (code && isPlaying) { // Only play if already "playing" (e.g., loaded from save)
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
      // Prompt user gesture on first play attempt
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
