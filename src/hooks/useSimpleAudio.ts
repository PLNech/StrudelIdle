// src/hooks/useSimpleAudio.ts
import { useRef, useCallback } from 'react';

export const useSimpleAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const samplesRef = useRef<{ [key: string]: AudioBuffer }>({});
  const lastPlayTimeRef = useRef<number>(0);

  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
    }
    return audioContextRef.current;
  }, []);

  const loadSample = useCallback(async (sampleName: string, url: string) => {
    const audioContext = await initAudioContext();
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      samplesRef.current[sampleName] = audioBuffer;
      console.log(`Loaded sample: ${sampleName}`);
    } catch (error) {
      console.error(`Failed to load sample ${sampleName}:`, error);
    }
  }, [initAudioContext]);

  const playSample = useCallback(async (sampleName: string, volume: number = 0.5) => {
    const audioContext = await initAudioContext();
    const sample = samplesRef.current[sampleName];
    
    if (!sample) {
      console.warn(`Sample ${sampleName} not loaded`);
      return;
    }

    try {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = sample;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      source.start();
    } catch (error) {
      console.error(`Failed to play sample ${sampleName}:`, error);
    }
  }, [initAudioContext]);

  // Create a simple kick drum sound programmatically with rate limiting
  const playKick = useCallback(async (volume: number = 0.8) => {
    const now = Date.now();
    // Rate limit to maximum 1 play per 50ms (20Hz max)
    if (now - lastPlayTimeRef.current < 50) {
      return;
    }
    lastPlayTimeRef.current = now;
    
    const audioContext = await initAudioContext();
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();
      
      // Kick drum characteristics
      oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(100, audioContext.currentTime);
      
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Failed to play kick:', error);
    }
  }, [initAudioContext]);

  return {
    initAudioContext,
    loadSample,
    playSample,
    playKick,
  };
};