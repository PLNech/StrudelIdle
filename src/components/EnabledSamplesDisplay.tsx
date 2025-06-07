// src/components/EnabledSamplesDisplay.tsx
import React from 'react';
import { useGame } from '../context/GameContext';

const EnabledSamplesDisplay: React.FC = () => {
  const { gameState, toggleSampleEnabled } = useGame();

  // Get all available sample banks from unlocked banks and loaded variants
  const availableSamples = Object.keys({
    ...gameState.loadedSampleVariants,
    ...gameState.enabledSamples,
  }).sort();

  if (availableSamples.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium">Samples:</span>
      {availableSamples.map(bankId => {
        const isEnabled = gameState.enabledSamples[bankId];
        const variant = gameState.loadedSampleVariants[bankId] ?? 0;
        const displayText = variant > 0 ? `${bankId}:${variant}` : bankId;
        
        return (
          <button
            key={bankId}
            onClick={() => toggleSampleEnabled(bankId)}
            className={`px-2 py-1 text-xs rounded-full border transition-all duration-200 ${
              isEnabled
                ? 'bg-primary/20 border-primary/50 text-primary hover:bg-primary/30'
                : 'bg-muted/50 border-muted text-muted-foreground hover:bg-muted/70'
            }`}
            title={`Click to ${isEnabled ? 'disable' : 'enable'} ${displayText} in patterns`}
          >
            {displayText}
          </button>
        );
      })}
    </div>
  );
};

export default EnabledSamplesDisplay;