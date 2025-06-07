// src/components/BeatDisplay.tsx
import React from 'react';
import { useGame } from '../context/GameContext';

const BeatDisplay: React.FC = () => {
  const { gameState, addBeats } = useGame();

  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <div className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg p-4 border border-accent/30">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {gameState.beats.toFixed(2)}
          </h2>
          <p className="text-sm text-muted-foreground">Beats Generated</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-secondary/30 rounded-lg p-3 border border-secondary/50">
            <div className="text-lg font-semibold">{gameState.bps.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Beats Per Second</div>
          </div>
        </div>
        
        {/* Debug Button */}
        <button
          onClick={() => addBeats(1000000000)}
          className="text-xs px-2 py-1 bg-red-500/20 border border-red-500/50 rounded text-red-200 hover:bg-red-500/30 transition-colors"
          title="Debug: Add 1 billion beats"
        >
          🐛 +1B
        </button>
      </div>
    </div>
  );
};

export default BeatDisplay;
