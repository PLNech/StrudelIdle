// src/components/StrudelOutput.tsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useStrudelEngine } from '../hooks/useStrudelEngine';
import { Button } from './ui/button';

const StrudelOutput: React.FC = () => {
  const { gameState } = useGame();
  const { togglePlay, isPlaying, strudelReady } = useStrudelEngine(gameState.strudelCode, gameState.strudelBPM);
  const [showDebug, setShowDebug] = useState(false);
  const [visualMode, setVisualMode] = useState<'code' | 'punchcard' | 'pianoroll'>('code');

  // Enhanced pattern with visual feedback
  const enhancedPattern = React.useMemo(() => {
    if (!gameState.strudelCode) return 's("bd")';
    
    // Add visual feedback to the pattern based on current mode
    let pattern = gameState.strudelCode;
    
    if (visualMode === 'punchcard') {
      // Add punchcard visualization
      pattern = `(${pattern}).punchcard()`;
    } else if (visualMode === 'pianoroll') {
      // Add pianoroll visualization  
      pattern = `(${pattern}).pianoroll()`;
    }
    
    return pattern;
  }, [gameState.strudelCode, visualMode]);

  // Update global pattern when enhanced pattern changes and playing
  useEffect(() => {
    if (isPlaying && strudelReady) {
      try {
        if ((window as any).evaluate) {
          (window as any).evaluate(enhancedPattern);
        }
      } catch (error) {
        console.error('Error updating enhanced pattern:', error);
      }
    }
  }, [enhancedPattern, isPlaying, strudelReady]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          Live Strudel Feed
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? 'Hide Debug' : 'Debug'}
          </Button>
          <select 
            value={visualMode} 
            onChange={(e) => setVisualMode(e.target.value as any)}
            className="text-sm bg-background border rounded px-2 py-1"
          >
            <option value="code">Code Only</option>
            <option value="punchcard">Punchcard</option>
            <option value="pianoroll">Piano Roll</option>
          </select>
        </div>
      </div>
      
      {/* Pattern Display */}
      <div 
        className="w-full bg-primary/10 text-primary-foreground p-3 rounded-md font-mono text-sm overflow-auto mb-4"
        style={{ maxHeight: showDebug ? '200px' : '120px' }}
        data-testid="strudel-output"
      >
        <pre>{enhancedPattern}</pre>
      </div>

      {/* Debug Information */}
      {showDebug && (
        <div className="bg-secondary/50 p-3 rounded-md mb-4 text-sm">
          <h3 className="font-bold mb-2">Debug Info</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <strong>Status:</strong> {isPlaying ? 'Playing' : 'Stopped'}
            </div>
            <div>
              <strong>BPM:</strong> {gameState.strudelBPM}
            </div>
            <div>
              <strong>Ready:</strong> {strudelReady ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Pattern Length:</strong> {gameState.strudelCode?.length || 0}
            </div>
          </div>
          <div className="mt-2">
            <strong>Active Modules:</strong> {gameState.modules.filter(m => m.count > 0).length}
          </div>
          <div className="mt-1">
            <strong>Raw Pattern:</strong>
            <pre className="text-xs mt-1 bg-background/50 p-2 rounded">
              {gameState.strudelCode || 'sound("bd")'}
            </pre>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={togglePlay}
          disabled={!strudelReady}
          className="flex-1"
        >
          {isPlaying ? 'Stop AlgoRave' : 'Start AlgoRave'}
        </Button>
        <Button
          variant="outline"
          disabled={!isPlaying}
          onClick={() => {
            if ((window as any).hush) {
              (window as any).hush();
            }
          }}
        >
          Hush
        </Button>
      </div>
      
      {!strudelReady && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Click "Start AlgoRave" to enable audio.
        </p>
      )}
      
      {/* BPM Control */}
      <div className="mt-3 flex items-center gap-2">
        <label className="text-sm font-medium">BPM:</label>
        <input
          type="range"
          min="60"
          max="180"
          value={gameState.strudelBPM}
          onChange={(e) => {
            // We'll need to add this to the game context
            if ((window as any).setBpm) {
              (window as any).setBpm(parseInt(e.target.value));
            }
          }}
          className="flex-1"
        />
        <span className="text-sm w-8">{gameState.strudelBPM}</span>
      </div>
    </div>
  );
};

export default StrudelOutput;
