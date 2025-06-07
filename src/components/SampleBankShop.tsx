// src/components/SampleBankShop.tsx - Sample bank management interface
import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { SAMPLE_BANKS, getAvailableSamples } from '../data/sampleScanner';

const SampleBankShop: React.FC = () => {
  const { gameState, purchaseSampleBank, purchaseSampleVariant, setActiveSample } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const lastPlayTimeRef = useRef<number>(0);

  const categories = ['all', 'drums', 'synth', 'fx', 'vocal', 'ambient', 'electronic', 'acoustic', 'breaks'];

  const filteredBanks = Object.values(SAMPLE_BANKS).filter(bank => 
    selectedCategory === 'all' || bank.category === selectedCategory
  );

  const availableSamples = getAvailableSamples(
    gameState.sampleBanks.unlockedBanks,
    gameState.sampleBanks.bankVariants
  );

  const getCategoryIcon = (category: string) => {
    const icons = {
      drums: '🥁',
      synth: '🎹',
      fx: '🎛️',
      vocal: '🎤',
      ambient: '🌿',
      electronic: '⚡',
      acoustic: '🎸',
      breaks: '💥',
      all: '🎵'
    };
    return icons[category as keyof typeof icons] || '🎵';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      drums: 'bg-red-500/20 border-red-500/50 text-red-200',
      synth: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
      fx: 'bg-purple-500/20 border-purple-500/50 text-purple-200',
      vocal: 'bg-green-500/20 border-green-500/50 text-green-200',
      ambient: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200',
      electronic: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200',
      acoustic: 'bg-orange-500/20 border-orange-500/50 text-orange-200',
      breaks: 'bg-pink-500/20 border-pink-500/50 text-pink-200',
    };
    return colors[category as keyof typeof colors] || 'bg-muted/20 border-border text-muted-foreground';
  };

  const handleSampleSelect = (sample: string) => {
    const now = Date.now();
    // Rate limit to maximum 1 sample play per 50ms (20Hz max)
    if (now - lastPlayTimeRef.current < 50) {
      return;
    }
    lastPlayTimeRef.current = now;
    setActiveSample(sample);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sample Banks</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {gameState.sampleBanks.totalSamplesUnlocked} samples unlocked • {availableSamples.length} available
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-primary">{gameState.beats} beats</div>
        </div>
      </div>

      {/* Quick Sample Selector */}
      {availableSamples.length > 0 && (
        <div className="p-4 bg-card/50 rounded-lg border border-border/50">
          <h3 className="text-lg font-semibold mb-3 text-foreground">Quick Play</h3>
          <div className="flex flex-wrap gap-2">
            {availableSamples.slice(0, 12).map((sample) => (
              <button
                key={sample}
                onClick={() => handleSampleSelect(sample)}
                className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                  gameState.strudelCode.includes(sample)
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-muted/20 border-border text-muted-foreground hover:bg-muted/40'
                }`}
              >
                {sample}
              </button>
            ))}
            {availableSamples.length > 12 && (
              <span className="px-3 py-1 text-sm text-muted-foreground">
                +{availableSamples.length - 12} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center gap-2 ${
              selectedCategory === category
                ? 'bg-primary/20 border-primary text-primary'
                : 'bg-muted/20 border-border text-muted-foreground hover:bg-muted/40'
            }`}
          >
            <span>{getCategoryIcon(category)}</span>
            <span className="capitalize">{category}</span>
          </button>
        ))}
      </div>

      {/* Sample Banks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBanks.map((bank) => {
          const isUnlocked = gameState.sampleBanks.unlockedBanks.includes(bank.id);
          const unlockedVariants = gameState.sampleBanks.bankVariants[bank.id] || [];
          const canAfford = gameState.beats >= bank.unlockCost;

          return (
            <div
              key={bank.id}
              className={`p-4 rounded-lg border transition-all ${
                isUnlocked
                  ? 'bg-card/50 border-border/50'
                  : 'bg-muted/20 border-border/30 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs border ${getCategoryColor(bank.category)}`}>
                    {getCategoryIcon(bank.category)} {bank.category}
                  </span>
                </div>
                <div className="text-right">
                  {isUnlocked ? (
                    <span className="text-green-400 text-sm">✓ Unlocked</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">{bank.unlockCost} beats</span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-1">{bank.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{bank.description}</p>

              {/* Variants */}
              {isUnlocked && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">
                      Variants ({unlockedVariants.length}/{bank.variantCount})
                    </h4>
                    {/* Show current variant */}
                    {(() => {
                      const currentMatch = gameState.strudelCode.match(new RegExp(`${bank.id}(?::(\\d+))?`));
                      if (currentMatch) {
                        const currentVariant = currentMatch[1] ? parseInt(currentMatch[1]) : 0;
                        return (
                          <span className="text-xs text-primary font-medium">
                            Current: {currentVariant}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {bank.variants.slice(0, 12).map((variant) => {
                      const isVariantUnlocked = unlockedVariants.includes(variant.index);
                      const canAffordVariant = gameState.beats >= variant.unlockCost;

                      return (
                        <button
                          key={variant.index}
                          onClick={() => 
                            isVariantUnlocked 
                              ? handleSampleSelect(variant.index === 0 ? bank.id : `${bank.id}:${variant.index}`)
                              : canAffordVariant && purchaseSampleVariant(bank.id, variant.index)
                          }
                          disabled={!isVariantUnlocked && !canAffordVariant}
                          className={`w-8 h-8 text-xs rounded border transition-colors ${
                            isVariantUnlocked
                              ? (gameState.strudelCode.includes(variant.index === 0 ? bank.id : `${bank.id}:${variant.index}`))
                                ? 'bg-primary border-primary text-primary-foreground font-bold' // Currently active
                                : 'bg-green-500/20 border-green-500/50 text-green-200 hover:bg-green-500/30'
                              : canAffordVariant
                              ? 'bg-muted/20 border-border hover:bg-muted/40 text-muted-foreground'
                              : 'bg-muted/10 border-muted/30 text-muted/50 cursor-not-allowed'
                          }`}
                          title={
                            isVariantUnlocked
                              ? `Play ${bank.id}:${variant.index}`
                              : `Unlock for ${variant.unlockCost} beats`
                          }
                        >
                          {variant.index}
                        </button>
                      );
                    })}
                    {bank.variantCount > 12 && (
                      <div className="w-8 h-8 text-xs rounded border border-border/30 flex items-center justify-center text-muted-foreground">
                        ...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Purchase Button */}
              {!isUnlocked && (
                <button
                  onClick={() => canAfford && purchaseSampleBank(bank.id)}
                  disabled={!canAfford}
                  className={`w-full mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    canAfford
                      ? 'bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30'
                      : 'bg-muted/20 border border-muted/30 text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {canAfford ? `Unlock for ${bank.unlockCost} beats` : 'Insufficient beats'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {filteredBanks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No sample banks in this category yet.</p>
        </div>
      )}
    </div>
  );
};

export default SampleBankShop;