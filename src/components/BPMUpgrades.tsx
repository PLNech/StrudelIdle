// src/components/BPMUpgrades.tsx
import React from 'react';
import { useGame } from '../context/GameContext';
import { Button } from './ui/button';

const BPMUpgrades: React.FC = () => {
  const { gameState, purchaseBPMUpgrade, purchaseBPMSlider, setBPM } = useGame();
  
  // Available BPM upgrades to unlock
  const availableBPMs = [70, 80, 90, 100, 120, 140, 160, 180];
  
  const getBPMCost = (bpm: number) => {
    const baseCost = 100;
    const bpmCostMultiplier = Math.pow(1.5, Math.floor((bpm - 60) / 10));
    return Math.floor(baseCost * bpmCostMultiplier);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">🎛️</span>
        BPM Control
      </h2>

      {/* Current BPM Display */}
      <div className="mb-4">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">
            {gameState.strudelBPM} BPM
          </div>
          <div className="text-sm text-muted-foreground">
            Current Tempo
          </div>
        </div>
      </div>

      {/* BPM Selection */}
      {!gameState.bpmUpgrades.hasSlider && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Available Tempos</h3>
          <div className="grid grid-cols-4 gap-2">
            {gameState.bpmUpgrades.unlockedBPMs.map(bpm => (
              <Button
                key={bpm}
                variant={gameState.strudelBPM === bpm ? "default" : "outline"}
                size="sm"
                onClick={() => setBPM(bpm)}
                className="text-xs"
              >
                {bpm}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* BPM Upgrades to Purchase */}
      {!gameState.bpmUpgrades.hasSlider && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Unlock New Tempos</h3>
          <div className="space-y-2">
            {availableBPMs
              .filter(bpm => !gameState.bpmUpgrades.unlockedBPMs.includes(bpm))
              .slice(0, 3) // Show next 3 available upgrades
              .map(bpm => {
                const cost = getBPMCost(bpm);
                const canAfford = gameState.beats >= cost;
                
                return (
                  <div key={bpm} className="flex items-center justify-between bg-card p-3 rounded border">
                    <div>
                      <div className="font-medium">BPM {bpm}</div>
                      <div className="text-sm text-muted-foreground">
                        {bpm <= 100 ? 'Steady groove' : 
                         bpm <= 140 ? 'Energetic beat' : 
                         'High energy'}
                      </div>
                    </div>
                    <Button
                      onClick={() => purchaseBPMUpgrade(bpm)}
                      disabled={!canAfford}
                      size="sm"
                      data-testid={`bpm-upgrade-${bpm}`}
                    >
                      {cost} Beats
                    </Button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* BPM Slider Upgrade */}
      {!gameState.bpmUpgrades.hasSlider && gameState.bpmUpgrades.unlockedBPMs.length >= 5 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Ultimate Tempo Control</h3>
          <div className="bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-accent">BPM Slider</div>
                <div className="text-sm text-muted-foreground">
                  Fine tempo control from 60-180 BPM
                </div>
              </div>
              <Button
                onClick={purchaseBPMSlider}
                disabled={gameState.beats < gameState.bpmUpgrades.sliderCost}
                className="bg-accent hover:bg-accent/90"
                data-testid="bpm-slider-upgrade"
              >
                {gameState.bpmUpgrades.sliderCost} Beats
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* BPM Slider Control */}
      {gameState.bpmUpgrades.hasSlider && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Fine Tempo Control</h3>
          <div className="bg-card border p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium min-w-[3rem]">60</span>
              <input
                type="range"
                min="60"
                max="180"
                value={gameState.strudelBPM}
                onChange={(e) => setBPM(parseInt(e.target.value))}
                className="flex-1"
                data-testid="bpm-slider"
              />
              <span className="text-sm font-medium min-w-[3rem]">180</span>
            </div>
            <div className="text-center mt-2 text-sm text-muted-foreground">
              Drag to set any BPM between 60-180
            </div>
          </div>
        </div>
      )}

      {gameState.bpmUpgrades.unlockedBPMs.length === 1 && (
        <div className="text-xs text-muted-foreground italic">
          Unlock more BPM options to control your track's energy level!
        </div>
      )}
    </div>
  );
};

export default BPMUpgrades;