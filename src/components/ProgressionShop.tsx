// src/components/ProgressionShop.tsx
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from './ui/button';
import { ALL_PHASES, ProgressionPhase, ProgressionFeature } from '../data/progression';
import SampleBankShop from './SampleBankShop';

const ProgressionShop: React.FC = () => {
  const { gameState, purchaseFeature, purchasePhase, setActiveSample } = useGame();
  const [selectedPhase, setSelectedPhase] = useState<string>('first_sounds');
  const [activeTab, setActiveTab] = useState<'upgrades' | 'samples'>('upgrades');
  const lastPlayTimeRef = React.useRef<number>(0);

  // Helper function for resource emojis
  const getResourceEmoji = (type: string) => {
    const emojis = {
      beats: '🎵',
      ram: '💾',
      cpu: '⚡',
      dsp: '🎛️',
      storage: '💿',
      sound: '🔊',
      notation: '📝',
      effect: '🎚️',
      pattern: '🎼',
      advanced: '🚀'
    };
    return emojis[type as keyof typeof emojis] || '⚡';
  };

  const getCurrentPhase = (): ProgressionPhase | undefined => {
    return ALL_PHASES.find(phase => phase.id === selectedPhase);
  };

  const isPhaseUnlocked = (phaseId: string): boolean => {
    return gameState.unlockedPhases.includes(phaseId);
  };

  const canUnlockPhase = (phase: ProgressionPhase): boolean => {
    if (isPhaseUnlocked(phase.id)) return false;
    if (!phase.requiredPhases) return true;
    
    return phase.requiredPhases.every(reqPhase => 
      gameState.unlockedPhases.includes(reqPhase)
    );
  };

  const isFeatureUnlocked = (featureId: string): boolean => {
    return gameState.unlockedFeatures.includes(featureId);
  };

  const canAffordFeature = (feature: ProgressionFeature): boolean => {
    return gameState.beats >= feature.cost;
  };

  const canAffordPhase = (phase: ProgressionPhase): boolean => {
    return gameState.beats >= phase.unlockCost;
  };

  const handlePurchasePhase = (phase: ProgressionPhase) => {
    if (canUnlockPhase(phase) && canAffordPhase(phase)) {
      purchasePhase(phase.id, phase.unlockCost);
    }
  };

  const handlePurchaseFeature = (feature: ProgressionFeature) => {
    if (canAffordFeature(feature) && !isFeatureUnlocked(feature.id)) {
      purchaseFeature(feature.id, feature.cost);
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'sound': return '🎵';
      case 'notation': return '🎼';
      case 'effect': return '🎛️';
      case 'pattern': return '🔄';
      case 'advanced': return '🧠';
      default: return '🎵';
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'sound': return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
      case 'notation': return 'from-green-500/20 to-green-600/20 border-green-500/30';
      case 'effect': return 'from-purple-500/20 to-purple-600/20 border-purple-500/30';
      case 'pattern': return 'from-orange-500/20 to-orange-600/20 border-orange-500/30';
      case 'advanced': return 'from-red-500/20 to-red-600/20 border-red-500/30';
      default: return 'from-primary/20 to-primary/30 border-primary/30';
    }
  };

  const handleSyntaxClick = (syntax: string) => {
    const now = Date.now();
    // Rate limit to maximum 1 sample play per 50ms (20Hz max)
    if (now - lastPlayTimeRef.current < 50) {
      return;
    }
    lastPlayTimeRef.current = now;
    setActiveSample(syntax);
  };

  const currentPhase = getCurrentPhase();

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">🎓</span>
        Learning & Samples
      </h2>

      {/* Main Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('upgrades')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'upgrades'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
          }`}
        >
          ⚡ Upgrades
        </button>
        <button
          onClick={() => setActiveTab('samples')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'samples'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
          }`}
        >
          🎵 Sample Banks
        </button>
      </div>

      {activeTab === 'upgrades' && (
        <div>
          {/* Phase Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {ALL_PHASES.map((phase) => (
              <button
                key={phase.id}
                onClick={() => setSelectedPhase(phase.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPhase === phase.id
                    ? 'bg-primary text-primary-foreground'
                    : isPhaseUnlocked(phase.id)
                    ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                    : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                }`}
                disabled={!isPhaseUnlocked(phase.id) && selectedPhase !== phase.id}
              >
                {phase.name}
                {!isPhaseUnlocked(phase.id) && (
                  <span className="ml-1 text-xs">🔒</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'samples' && (
        <SampleBankShop />
      )}

      {currentPhase && (
        <div className="space-y-4">
          {/* Phase Info */}
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{currentPhase.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{currentPhase.description}</p>
            
            {!isPhaseUnlocked(currentPhase.id) && (
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">Unlock Cost: </span>
                  <span className="font-semibold">{currentPhase.unlockCost} Beats</span>
                </div>
                <Button
                  onClick={() => handlePurchasePhase(currentPhase)}
                  disabled={!canUnlockPhase(currentPhase) || !canAffordPhase(currentPhase)}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  Unlock Phase
                </Button>
              </div>
            )}
          </div>

          {/* Features */}
          {isPhaseUnlocked(currentPhase.id) && (
            <div className="space-y-3">
              <h4 className="text-md font-semibold">Available Features:</h4>
              
              {currentPhase.features.map((feature) => (
                <div
                  key={feature.id}
                  className={`bg-gradient-to-r ${getCategoryColor(feature.category)} rounded-lg p-4 border`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{getCategoryIcon(feature.category)}</span>
                        <h5 className="font-semibold">{feature.name}</h5>
                        <span className="text-xs bg-background/50 px-2 py-1 rounded-full flex items-center gap-1">
                          {getResourceEmoji(feature.category)}
                          {feature.category}
                        </span>
                        {isFeatureUnlocked(feature.id) && (
                          <span className="text-green-400 text-sm">✓ Unlocked</span>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {feature.description}
                      </p>
                      
                      <button
                        onClick={() => isFeatureUnlocked(feature.id) && handleSyntaxClick(feature.strudelSyntax)}
                        disabled={!isFeatureUnlocked(feature.id)}
                        className={`bg-background/30 rounded px-3 py-2 font-mono text-xs w-full text-left transition-colors ${
                          isFeatureUnlocked(feature.id) 
                            ? 'hover:bg-background/50 cursor-pointer' 
                            : 'cursor-not-allowed opacity-50'
                        }`}
                        title={isFeatureUnlocked(feature.id) ? 'Click to set as current pattern' : 'Unlock this feature first'}
                      >
                        {feature.strudelSyntax}
                      </button>
                      
                      {feature.example && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className="font-medium">Example: </span>
                          <button
                            onClick={() => isFeatureUnlocked(feature.id) && handleSyntaxClick(feature.example!)}
                            disabled={!isFeatureUnlocked(feature.id)}
                            className={`bg-background/20 px-1 rounded font-mono transition-colors ${
                              isFeatureUnlocked(feature.id) 
                                ? 'hover:bg-background/40 cursor-pointer' 
                                : 'cursor-not-allowed opacity-50'
                            }`}
                            title={isFeatureUnlocked(feature.id) ? 'Click to set as current pattern' : 'Unlock this feature first'}
                          >
                            {feature.example}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div className="text-sm font-semibold mb-2 flex items-center gap-1">
                        {getResourceEmoji('beats')} {feature.cost}
                      </div>
                      <Button
                        onClick={() => handlePurchaseFeature(feature)}
                        disabled={isFeatureUnlocked(feature.id) || !canAffordFeature(feature)}
                        size="sm"
                        variant={isFeatureUnlocked(feature.id) ? "secondary" : "default"}
                      >
                        {isFeatureUnlocked(feature.id) ? 'Unlocked' : 'Learn'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isPhaseUnlocked(currentPhase.id) && (
            <div className="text-center py-8 text-muted-foreground">
              <p>🔒 Unlock this phase to see available features</p>
            </div>
          )} 

        </div>
      )}
  </div>
  )
};

export default ProgressionShop;