// src/components/BeatDisplay.tsx
import React from 'react';
import { useGame } from '../context/GameContext';

const BeatDisplay: React.FC = () => {
  const { gameState } = useGame();

  return (
    <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md mb-4 text-center">
      <h2 className="text-xl font-bold">Beats: {gameState.beats.toFixed(2)}</h2>
      <p className="text-sm text-muted-foreground">BPS: {gameState.bps.toFixed(2)}</p>
      {/* TODO: Add display for Audience Excitement, Cohesion, Complexity */}
    </div>
  );
};

export default BeatDisplay;
