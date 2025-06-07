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
    <div className="p-6">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        <span className="text-2xl">🥁</span>
        Tap Beat
      </h2>
      <p className="text-sm text-muted-foreground mb-4">Click to generate beats!</p>
      <Button
        onClick={handleClick}
        className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
        data-testid="clicker"
      >
        Play `bd` (1 Beat)
      </Button>
    </div>
  );
};

export default Clicker;
