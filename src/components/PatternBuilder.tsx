// src/components/PatternBuilder.tsx
import React from 'react';
import { useGame } from '../context/GameContext';

const PatternBuilder: React.FC = () => {
  const { gameState } = useGame();

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">🎼</span>
        Pattern Structure
      </h2>
      
      {/* Current Pattern Display */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Current Pattern</h3>
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-4 rounded-lg font-mono text-sm">
          <pre className="whitespace-pre-wrap text-foreground">{gameState.strudelCode}</pre>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 px-1">
          <span>BPM: {gameState.strudelBPM}</span>
          <span>Looping: {gameState.hasLooping ? '🔄 ON' : '⏸️ OFF'}</span>
        </div>
      </div>

      {/* Pattern Elements Available for Purchase */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Pattern Elements</h3>
        
        {/* Notes Section */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Basic Notes (Coming Soon)</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted p-2 rounded text-xs text-center opacity-50">
              Note C<br/>
              <span className="text-xs">20 Beats</span>
            </div>
            <div className="bg-muted p-2 rounded text-xs text-center opacity-50">
              Note E<br/>
              <span className="text-xs">25 Beats</span>
            </div>
            <div className="bg-muted p-2 rounded text-xs text-center opacity-50">
              Note G<br/>
              <span className="text-xs">30 Beats</span>
            </div>
          </div>
        </div>

        {/* Chords Section */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Chord Progressions (Coming Soon)</h4>
          <div className="bg-muted p-2 rounded text-xs text-center opacity-50">
            C Major Chord<br/>
            <span className="text-xs">Requires: Note C, E, G</span><br/>
            <span className="text-xs">100 Beats</span>
          </div>
        </div>

        {/* Pattern Lines */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Pattern Lines (Coming Soon)</h4>
          <div className="space-y-1">
            <div className="bg-muted p-2 rounded text-xs opacity-50">
              Melody Line - 50 Beats
            </div>
            <div className="bg-muted p-2 rounded text-xs opacity-50">
              Bass Line - 80 Beats
            </div>
            <div className="bg-muted p-2 rounded text-xs opacity-50">
              Harmony Line - 120 Beats
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground italic">
        Advanced pattern building coming in future updates! For now, purchase modules to build your pattern automatically.
      </div>
    </div>
  );
};

export default PatternBuilder;