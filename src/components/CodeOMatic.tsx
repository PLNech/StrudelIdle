// src/components/CodeOMatic.tsx
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from './ui/button';

const CodeOMatic: React.FC = () => {
  const { gameState, purchaseCodeOMatic, toggleCodeOMatic, setCodeOMaticComplexity } = useGame();
  const [localComplexity, setLocalComplexity] = useState(gameState.codeOMatic.complexity);

  const canAfford = gameState.beats >= gameState.codeOMatic.cost;
  const timeUntilNext = gameState.codeOMatic.generationInterval - 
    ((Date.now() - gameState.codeOMatic.lastGeneration) / 1000);

  const handleComplexityChange = (newComplexity: number) => {
    setLocalComplexity(newComplexity);
    setCodeOMaticComplexity(newComplexity);
  };

  const getComplexityLabel = (complexity: number): string => {
    if (complexity < 0.3) return 'Simple';
    if (complexity < 0.6) return 'Moderate';
    if (complexity < 0.8) return 'Complex';
    return 'Chaotic';
  };

  const getComplexityDescription = (complexity: number): string => {
    if (complexity < 0.3) return 'Basic patterns with few elements';
    if (complexity < 0.6) return 'Patterns with some effects and variations';
    if (complexity < 0.8) return 'Multi-layered patterns with advanced features';
    return 'Experimental patterns pushing boundaries';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          Code-o-matic
        </h2>
        {gameState.codeOMatic.purchased && (
          <div className="flex items-center gap-2">
            <span className={`text-sm px-2 py-1 rounded-full ${
              gameState.codeOMatic.enabled 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {gameState.codeOMatic.enabled ? '🟢 ACTIVE' : '🔴 OFFLINE'}
            </span>
          </div>
        )}
      </div>

      {!gameState.codeOMatic.purchased ? (
        /* Purchase Interface */
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">🎯 Generative Code Engine</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The Code-o-matic automatically generates new Strudel patterns using only your unlocked features.
              It creates random variations that evolve as you learn new techniques!
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <h4 className="font-medium text-primary mb-1">✨ Features:</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Auto-generates patterns</li>
                  <li>• Uses only unlocked features</li>
                  <li>• Complexity slider control</li>
                  <li>• Educational examples</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-primary mb-1">⚙️ How it works:</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Toggle on/off anytime</li>
                  <li>• New pattern every 10s</li>
                  <li>• Learn from generated code</li>
                  <li>• Evolves with progression</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">
                Cost: {gameState.codeOMatic.cost} Beats
              </div>
              <Button
                onClick={purchaseCodeOMatic}
                disabled={!canAfford}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {canAfford ? 'Purchase Code-o-matic' : 'Need More Beats'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Control Interface */
        <div className="space-y-4">
          {/* Status & Controls */}
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Generation Status</h3>
                <p className="text-sm text-muted-foreground">
                  {gameState.codeOMatic.enabled 
                    ? `Next pattern in ${Math.max(0, Math.ceil(timeUntilNext))}s`
                    : 'Generator is offline'
                  }
                </p>
              </div>
              <Button
                onClick={toggleCodeOMatic}
                variant={gameState.codeOMatic.enabled ? "destructive" : "default"}
                className={gameState.codeOMatic.enabled 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-green-500 hover:bg-green-600"
                }
              >
                {gameState.codeOMatic.enabled ? 'Stop Generator' : 'Start Generator'}
              </Button>
            </div>

            {/* Generation Stats */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-primary">{gameState.unlockedFeatures.length}</div>
                <div className="text-muted-foreground">Features Available</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-primary">{gameState.codeOMatic.generationInterval}s</div>
                <div className="text-muted-foreground">Generation Interval</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-primary">{getComplexityLabel(localComplexity)}</div>
                <div className="text-muted-foreground">Current Complexity</div>
              </div>
            </div>
          </div>

          {/* Complexity Control */}
          <div className="bg-secondary/30 border border-secondary/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">🎚️ Complexity Control</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Pattern Complexity:</label>
                <span className="text-sm font-semibold text-primary">
                  {getComplexityLabel(localComplexity)}
                </span>
              </div>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localComplexity}
                onChange={(e) => handleComplexityChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Simple</span>
                <span>Moderate</span>
                <span>Complex</span>
                <span>Chaotic</span>
              </div>
              
              <p className="text-xs text-muted-foreground italic">
                {getComplexityDescription(localComplexity)}
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-background/30 border border-border/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span>💡</span>
              How it Works
            </h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                The Code-o-matic uses your unlocked features to create educational patterns.
                Higher complexity adds more layers and advanced techniques.
              </p>
              <p>
                Generated patterns follow Strudel.cc best practices and showcase different
                ways to combine the features you've learned.
              </p>
              <p className="text-xs italic">
                💡 Tip: Try different complexity levels to discover new pattern ideas!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeOMatic;