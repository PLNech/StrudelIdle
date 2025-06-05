// src/components/Clicker.tsx
import React from 'react';
import { Button } from './ui/button';
import { useGame } from '../context/GameContext';
import { useSimpleAudio } from '../hooks/useSimpleAudio';

const Clicker: React.FC = () => {
  const { addBeats } = useGame();
  const { playKick } = useSimpleAudio();

  const handleClick = async () => {
    addBeats(1);
    await playKick(); // Play immediate kick sound
  };

  return (
    <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md mb-4 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2">Tap Beat</h2>
      <p className="text-sm text-muted-foreground mb-4">Click to generate beats!</p>
      <Button
        onClick={handleClick}
        className="w-full py-4 text-lg font-semibold"
      >
        Play `bd` (1 Beat)
      </Button>
    </div>
  );
};

export default Clicker;
