// src/components/Settings.tsx
import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useSaveGame } from '../hooks/useSaveGame';
import { Button } from './ui/button';
import ThemeToggle from './ThemeToggle';

const Settings: React.FC = () => {
  const { gameState, setGameState } = useGame();
  const { saveGame, exportSave, importSave, resetGame } = useSaveGame(gameState, setGameState);
  const [isOpen, setIsOpen] = useState(false);
  const [manualVolume, setManualVolume] = useState(0.8);
  const [algoraveVolume, setAlgoraveVolume] = useState(0.6);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50"
        variant="outline"
        data-testid="settings-button"
      >
        ⚙️ Settings
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Game Settings</h2>
        
        {/* Game Stats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Statistics</h3>
          <div className="space-y-1 text-sm">
            <p>Total Playtime: {formatTime(gameState.gameTime)}</p>
            <p>Total Beats: {gameState.beats.toFixed(2)}</p>
            <p>Current BPS: {gameState.bps.toFixed(2)}</p>
            <p>Modules Owned: {Object.values(gameState.modules).reduce((sum, module) => sum + module.acquiredCount, 0)}</p>
          </div>
        </div>

        {/* Save/Load Controls */}
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold">Save & Load</h3>
          
          <Button onClick={saveGame} className="w-full">
            💾 Save Game
          </Button>
          
          <Button onClick={exportSave} className="w-full" variant="outline">
            📤 Export Save
          </Button>
          
          <Button onClick={handleImport} className="w-full" variant="outline">
            📥 Import Save
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          <Button onClick={resetGame} className="w-full" variant="destructive">
            🗑️ Reset Game
          </Button>
        </div>

        {/* Theme Settings */}
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold">Appearance</h3>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>
        </div>

        {/* Audio Settings */}
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold">Audio Settings</h3>
          
          {/* Manual Volume */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Manual Volume: {Math.round(manualVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={manualVolume}
              onChange={(e) => setManualVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* AlgoRave Volume */}
          <div>
            <label className="block text-sm font-medium mb-2">
              AlgoRave Volume: {Math.round(algoraveVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={algoraveVolume}
              onChange={(e) => setAlgoraveVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="text-sm text-muted-foreground pt-2">
            Current BPM: {gameState.strudelBPM} • Pattern: {gameState.strudelCode.length} chars
          </div>
        </div>

        <Button onClick={() => setIsOpen(false)} className="w-full">
          Close Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;