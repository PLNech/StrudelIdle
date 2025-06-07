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
      // Add punchcard visualization with draw
      pattern = `(${pattern}).punchcard().draw()`;
    } else if (visualMode === 'pianoroll') {
      // Add pianoroll visualization with draw
      pattern = `(${pattern}).pianoroll().draw()`;
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

  // Clear draw effects when switching to code-only mode
  useEffect(() => {
    if (visualMode === 'code' && isPlaying && strudelReady) {
      try {
        // Clear any existing draw visualizations
        if ((window as any).clearDraws) {
          (window as any).clearDraws();
        }
      } catch (error) {
        console.error('Error clearing draws:', error);
      }
    }
  }, [visualMode, isPlaying, strudelReady]);

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
          {/* Only show visualization controls if unlocked */}
          {(gameState.unlockedFeatures.includes('visualization') || gameState.beats > 2000) && (
            <select 
              value={visualMode} 
              onChange={(e) => setVisualMode(e.target.value as any)}
              className="text-sm bg-background border rounded px-2 py-1"
            >
              <option value="code">Code Only</option>
              <option value="punchcard">Punchcard</option>
              <option value="pianoroll">Piano Roll</option>
            </select>
          )}
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
            <strong>Active Modules:</strong> {Object.values(gameState.modules).filter(m => m.acquiredCount > 0).length}
          </div>
          <div className="mt-1">
            <strong>Raw Pattern:</strong>
            <pre className="text-xs mt-1 bg-background/50 p-2 rounded">
              {gameState.strudelCode || 'sound("bd")'}
            </pre>
          </div>
          <div className="mt-1">
            <strong>Manual Override:</strong>
            <pre className="text-xs mt-1 bg-background/50 p-2 rounded">
              {gameState.manualPatternOverride || 'None'}
            </pre>
          </div>
          <div className="mt-1">
            <strong>Loaded Variants:</strong>
            <pre className="text-xs mt-1 bg-background/50 p-2 rounded">
              {JSON.stringify(gameState.loadedSampleVariants, null, 2)}
            </pre>
          </div>
          <div className="mt-1">
            <strong>Code-o-matic:</strong>
            <div className="text-xs mt-1 bg-background/50 p-2 rounded">
              <div>Enabled: {gameState.codeOMatic?.enabled ? 'Yes' : 'No'}</div>
              <div>Paused: {gameState.codeOMatic?.pausedUntil && Date.now() < gameState.codeOMatic.pausedUntil ? 'Yes' : 'No'}</div>
              {gameState.codeOMatic?.pausedUntil && Date.now() < gameState.codeOMatic.pausedUntil && (
                <div>Pause ends: {Math.ceil((gameState.codeOMatic.pausedUntil - Date.now()) / 1000)}s</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Volume Controls */}
      <div className="mb-4 bg-secondary/20 rounded-lg p-3 border border-secondary/30">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <span>🔊</span>
          Volume Controls
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium w-16">Master</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1"
              defaultValue="0.7"
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              onChange={(e) => {
                const volume = parseFloat(e.target.value);
                if ((window as any).getAudioContext) {
                  const ctx = (window as any).getAudioContext();
                  if (ctx.destination.gain) {
                    ctx.destination.gain.value = volume;
                  }
                }
              }}
            />
            <span className="text-xs w-8 text-muted-foreground">70%</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium w-16">Drums</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1"
              defaultValue="0.8"
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs w-8 text-muted-foreground">80%</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium w-16">Melodic</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1"
              defaultValue="0.6"
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs w-8 text-muted-foreground">60%</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={togglePlay}
          disabled={!strudelReady}
          className="flex-1"
        >
          {isPlaying ? 'Stop AlgoRave' : 'Start AlgoRave'}
        </Button>
      </div>
      
      {!strudelReady && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Click "Start AlgoRave" to enable audio.
        </p>
      )}
    </div>
  );
};

export default StrudelOutput;
