// src/hooks/useSaveGame.ts
import { useEffect, useCallback } from 'react';
import { GameState, INITIAL_GAME_STATE } from '../types';

const SAVE_KEY = 'algorave-idle-save';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// Migration function to handle saves from older versions
const migrateSaveData = (savedData: any): GameState => {
  // Ensure all required fields exist, using INITIAL_GAME_STATE as defaults
  const migratedData: GameState = {
    ...INITIAL_GAME_STATE,
    ...savedData,
    // Ensure codeOMatic exists
    codeOMatic: {
      ...INITIAL_GAME_STATE.codeOMatic,
      ...savedData.codeOMatic,
    },
    // Ensure bpmUpgrades exists
    bpmUpgrades: {
      ...INITIAL_GAME_STATE.bpmUpgrades,
      ...savedData.bpmUpgrades,
    },
    // Ensure sampleBanks exists
    sampleBanks: {
      ...INITIAL_GAME_STATE.sampleBanks,
      ...savedData.sampleBanks,
    },
  };
  
  return migratedData;
};

export const useSaveGame = (gameState: GameState, setGameState: (state: GameState) => void) => {
  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveGame(gameState);
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [gameState]);

  // Load game on mount
  useEffect(() => {
    loadGame();
  }, []);

  const saveGame = useCallback((state: GameState) => {
    try {
      const saveData = {
        ...state,
        lastSaved: Date.now(),
        version: '1.0.0',
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      console.log('Game saved successfully');
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }, []);

  const loadGame = useCallback(() => {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Calculate offline progress
        const now = Date.now();
        const timeDiff = (now - parsedData.lastSaved) / 1000; // seconds offline
        const offlineBeats = parsedData.bps * timeDiff;
        
        // Apply offline progress (max 24 hours worth)
        const maxOfflineTime = 24 * 60 * 60; // 24 hours in seconds
        const cappedOfflineBeats = Math.min(offlineBeats, parsedData.bps * maxOfflineTime);
        
        // Migrate the data to ensure all fields exist
        const migratedData = migrateSaveData(parsedData);
        
        const loadedState = {
          ...migratedData,
          beats: migratedData.beats + cappedOfflineBeats,
          gameTime: migratedData.gameTime + Math.min(timeDiff, maxOfflineTime),
        };
        
        setGameState(loadedState);
        
        if (cappedOfflineBeats > 0) {
          console.log(`Welcome back! You earned ${cappedOfflineBeats.toFixed(2)} beats while away`);
        }
      }
    } catch (error) {
      console.error('Failed to load game:', error);
    }
  }, [setGameState]);

  const exportSave = useCallback(() => {
    const saveData = JSON.stringify(gameState, null, 2);
    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `algorave-idle-save-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [gameState]);

  const importSave = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const saveData = JSON.parse(e.target?.result as string);
        const migratedData = migrateSaveData(saveData);
        setGameState(migratedData);
        console.log('Save imported successfully');
      } catch (error) {
        console.error('Failed to import save:', error);
        alert('Invalid save file');
      }
    };
    reader.readAsText(file);
  }, [setGameState]);

  const resetGame = useCallback(() => {
    if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
      localStorage.removeItem(SAVE_KEY);
      window.location.reload();
    }
  }, []);

  return {
    saveGame: () => saveGame(gameState),
    loadGame,
    exportSave,
    importSave,
    resetGame,
  };
};