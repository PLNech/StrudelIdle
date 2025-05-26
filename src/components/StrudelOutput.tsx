// src/components/StrudelOutput.tsx
import React from 'react';
import { useGame } from '../context/GameContext';
import { useStrudelEngine } from '../hooks/useStrudelEngine';
import { Button } from './ui/button';

const StrudelOutput: React.FC = () => {
  const { gameState } = useGame();
  const { togglePlay, isPlaying, strudelReady } = useStrudelEngine(gameState.strudelCode, gameState.strudelBPM);

  return (
    <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md mb-4 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2">Live Strudel Feed</h2>
      <div className="w-full bg-primary/10 text-primary-foreground p-3 rounded-md font-mono text-sm overflow-auto max-h-40 mb-4">
        <pre>{gameState.strudelCode || 'd1 $ sound "bd"'}</pre>
      </div>
      <Button
        onClick={togglePlay}
        disabled={!strudelReady} // Disable until audio context is ready
        className="w-full"
      >
        {isPlaying ? 'Stop AlgoRave' : 'Start AlgoRave'}
      </Button>
      {!strudelReady && (
        <p className="text-sm text-muted-foreground mt-2">Click "Start AlgoRave" to enable audio.</p>
      )}
      {/* TODO: Add a visualizer or simple waveform display */}
      {/* TODO: Add BPM control */}
    </div>
  );
};

export default StrudelOutput;
