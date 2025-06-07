// src/components/SaveLoadMenu.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useSaveGame } from '../hooks/useSaveGame';
import { Button } from './ui/button';
import { INITIAL_GAME_STATE } from '../types';

const SaveLoadMenu: React.FC = () => {
  const { gameState, setGameState } = useGame();
  const { saveGame, exportSave, importSave } = useSaveGame(gameState, setGameState);
  const [isOpen, setIsOpen] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (gameState.saveSettings.autoSave) {
      const intervalMs = gameState.saveSettings.autoSaveInterval * 60 * 1000; // Convert minutes to ms
      
      autoSaveIntervalRef.current = setInterval(() => {
        try {
          saveGame();
          const now = Date.now();
          setGameState(prev => ({
            ...prev,
            saveSettings: {
              ...prev.saveSettings,
              lastAutoSave: now,
            },
          }));
          setAutoSaveStatus(`Auto-saved at ${new Date(now).toLocaleTimeString()}`);
          
          // Clear status after 3 seconds
          setTimeout(() => setAutoSaveStatus(''), 3000);
        } catch (error) {
          console.error('Auto-save failed:', error);
          setAutoSaveStatus('Auto-save failed');
          setTimeout(() => setAutoSaveStatus(''), 3000);
        }
      }, intervalMs);
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [gameState.saveSettings.autoSave, gameState.saveSettings.autoSaveInterval, saveGame, setGameState]);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importSave(file);
      setIsOpen(false);
    }
  };

  const handleToggleAutoSave = () => {
    setGameState(prev => ({
      ...prev,
      saveSettings: {
        ...prev.saveSettings,
        autoSave: !prev.saveSettings.autoSave,
      },
    }));
  };

  const handleAutoSaveIntervalChange = (interval: number) => {
    setGameState(prev => ({
      ...prev,
      saveSettings: {
        ...prev.saveSettings,
        autoSaveInterval: interval,
      },
    }));
  };

  const handleReset = () => {
    if (confirm('Reset game but keep achievements? This cannot be undone!')) {
      setGameState(prevState => ({
        ...INITIAL_GAME_STATE,
        // Keep achievements and save settings
        achievements: prevState.achievements,
        saveSettings: prevState.saveSettings,
      }));
      setIsOpen(false);
    }
  };

  const handleHardReset = () => {
    if (confirm('HARD RESET: Delete everything including achievements? This cannot be undone!')) {
      setGameState({
        ...INITIAL_GAME_STATE,
        saveSettings: {
          autoSave: true,
          autoSaveInterval: 1,
          lastAutoSave: Date.now(),
        },
      });
      setIsOpen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getTimeSinceAutoSave = () => {
    const timeDiff = (Date.now() - gameState.saveSettings.lastAutoSave) / 1000;
    if (timeDiff < 60) return `${Math.floor(timeDiff)}s ago`;
    if (timeDiff < 3600) return `${Math.floor(timeDiff / 60)}m ago`;
    return `${Math.floor(timeDiff / 3600)}h ago`;
  };

  if (!isOpen) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          data-testid="save-menu-button"
          className="bg-background/80 backdrop-blur-sm"
        >
          💾 Save/Load
        </Button>
        
        {/* Auto-save status indicator - positioned relative to button */}
        {autoSaveStatus && (
          <div className="absolute top-12 right-0 z-50 bg-green-100 border border-green-300 text-green-800 px-3 py-1 rounded-lg text-sm whitespace-nowrap">
            {autoSaveStatus}
          </div>
        )}
        
        {/* Auto-save indicator - positioned to the left of the button */}
        {gameState.saveSettings.autoSave && (
          <div className="absolute top-0 right-28 bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded text-xs whitespace-nowrap">
            Auto-save: {getTimeSinceAutoSave()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>💾</span>
          Save & Load Game
        </h2>
        
        {/* Game Stats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Statistics</h3>
          <div className="space-y-1 text-sm">
            <p>Total Playtime: {formatTime(gameState.gameTime)}</p>
            <p>Total Beats: {gameState.beats.toFixed(2)}</p>
            <p>Current BPS: {gameState.bps.toFixed(2)}</p>
            <p>Modules Owned: {Object.values(gameState.modules).reduce((sum, module) => sum + module.acquiredCount, 0)}</p>
            <p>Achievements: {Object.values(gameState.achievements).filter(a => a.unlocked).length}</p>
          </div>
        </div>

        {/* Auto-Save Settings */}
        <div className="mb-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">Auto-Save Settings</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Enable Auto-Save</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={gameState.saveSettings.autoSave}
                  onChange={handleToggleAutoSave}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            {gameState.saveSettings.autoSave && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Auto-Save Interval: {gameState.saveSettings.autoSaveInterval} minute(s)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 5, 10].map(interval => (
                    <Button
                      key={interval}
                      onClick={() => handleAutoSaveIntervalChange(interval)}
                      variant={gameState.saveSettings.autoSaveInterval === interval ? "default" : "outline"}
                      size="sm"
                    >
                      {interval}m
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last auto-save: {getTimeSinceAutoSave()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Save/Load Controls */}
        <div className="space-y-3 mb-6 border-t pt-4">
          <h3 className="text-lg font-semibold">Manual Save & Load</h3>
          
          <Button onClick={saveGame} className="w-full">
            💾 Save Game
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={exportSave} variant="outline" className="w-full">
              📤 Export JSON
            </Button>
            
            <Button onClick={handleImport} variant="outline" className="w-full">
              📥 Load JSON
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Reset Options */}
        <div className="space-y-3 mb-6 border-t pt-4">
          <h3 className="text-lg font-semibold text-orange-600">Reset Options</h3>
          
          <Button 
            onClick={handleReset} 
            variant="outline"
            className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            🔄 Reset (Keep Achievements)
          </Button>
          
          <Button 
            onClick={handleHardReset} 
            variant="destructive"
            className="w-full"
          >
            💀 Hard Reset (Delete Everything)
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Reset options cannot be undone. Make sure to export your save first!
          </p>
        </div>

        <Button onClick={() => setIsOpen(false)} className="w-full">
          Close
        </Button>
      </div>
    </div>
  );
};

export default SaveLoadMenu;