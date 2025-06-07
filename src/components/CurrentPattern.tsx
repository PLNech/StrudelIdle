// src/components/CurrentPattern.tsx - Prominent pattern display
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from './ui/button';
import { CodeGenerator } from '../utils/codeGenerator';
import { ALL_PHASES } from '../data/progression';

const CurrentPattern: React.FC = () => {
  const { gameState, setActiveSample } = useGame();
  const [showPatternLibrary, setShowPatternLibrary] = useState(false);

  // Sample patterns that could be unlocked
  const patternLibrary = [
    { id: 'basic_drums', pattern: 's("bd hh sd hh")', name: 'Basic Drums', unlocked: true },
    { id: 'kick_snare', pattern: 's("bd sd")', name: 'Kick Snare', unlocked: true },
    { id: 'four_four', pattern: 's("bd*4")', name: 'Four on Floor', unlocked: gameState.beats > 100 },
    { id: 'offbeat', pattern: 's("~ hh ~ hh")', name: 'Offbeat Hats', unlocked: gameState.beats > 200 },
    { id: 'complex', pattern: 's("bd [hh hh] sd hh")', name: 'Complex Beat', unlocked: gameState.beats > 500 },
  ].filter(pattern => pattern.unlocked);

  const handlePatternSelect = (pattern: string) => {
    setActiveSample(pattern);
    setShowPatternLibrary(false);
  };

  const handleRandomize = () => {
    if (!gameState.codeOMatic.purchased) return;
    
    const codeGenerator = new CodeGenerator();
    const unlockedFeatures = ALL_PHASES
      .flatMap(phase => phase.features)
      .filter(feature => gameState.unlockedFeatures.includes(feature.id));
    
    const generationContext = {
      unlockedFeatures,
      complexity: gameState.codeOMatic.complexity,
      unlockedBanks: gameState.sampleBanks.unlockedBanks,
      bankVariants: gameState.sampleBanks.bankVariants
    };
    
    const randomPattern = codeGenerator.generatePattern(generationContext);
    setActiveSample(randomPattern);
  };

  return (
    <div className="p-6" data-testid="current-pattern">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">Current Pattern</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPatternLibrary(!showPatternLibrary)}
            data-testid="pattern-library-toggle"
          >
            📚 Library
          </Button>
        </div>
      </div>

      {/* Pattern Library Dropdown */}
      {showPatternLibrary && (
        <div className="mb-4" data-testid="pattern-library">
          <select 
            className="w-full p-2 bg-card border border-border rounded-lg text-foreground"
            onChange={(e) => e.target.value && handlePatternSelect(e.target.value)}
            defaultValue=""
          >
            <option value="">Select a pattern...</option>
            {patternLibrary.map(pattern => (
              <option key={pattern.id} value={pattern.pattern}>
                {pattern.name} - {pattern.pattern}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Current Pattern Display */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg p-6">
        <div className="text-center">
          <div className="pattern-text text-xl lg:text-2xl font-mono bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            {gameState.strudelCode || 's("bd")'}
          </div>
          <div className="text-sm text-muted-foreground">
            Current Strudel Pattern • BPM: {gameState.strudelBPM}
          </div>
        </div>
      </div>

      {/* Randomize Button */}
      {gameState.codeOMatic.purchased && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomize}
            data-testid="randomize-button"
          >
            🎲 Randomize
          </Button>
        </div>
      )}
    </div>
  );
};

export default CurrentPattern;