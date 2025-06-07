// src/components/CurrentPattern.tsx - Prominent pattern display
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from './ui/button';
import { CodeGenerator } from '../utils/codeGenerator';
import { ALL_PHASES } from '../data/progression';
import { generateStrudelCode } from '../utils/ast';

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

      {/* Multi-Line Pattern Display */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg p-6">
        <div className="space-y-3">
          {/* Line 1 - Drums */}
          {gameState.soundLines.line1.enabled && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium w-16 text-red-600">Line 1:</span>
              <div className="flex-1 font-mono text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
                {gameState.patternAST.line1 ? 
                  generateStrudelCode(gameState.patternAST.line1, { enabledSamples: new Set(['bd', 'sd', 'hh']), availableEffects: [], maxComplexity: 10, preferredStyle: 'minimal' }) :
                  `d1 $ s("${gameState.soundLines.line1.selectedSample || 'bd'}")`
                }
              </div>
            </div>
          )}
          
          {/* Line 2 - Melodic */}
          {gameState.soundLines.line2.enabled && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium w-16 text-blue-600">Line 2:</span>
              <div className="flex-1 font-mono text-sm bg-blue-50 border border-blue-200 rounded px-3 py-2">
                {gameState.patternAST.line2 ? 
                  generateStrudelCode(gameState.patternAST.line2, { enabledSamples: new Set(['piano', 'casio']), availableEffects: [], maxComplexity: 10, preferredStyle: 'minimal' }) :
                  gameState.soundLines.line2.selectedSample ? 
                    `d2 $ s("${gameState.soundLines.line2.selectedSample}")` :
                    'd2 $ silence'
                }
              </div>
            </div>
          )}
          
          {/* Line 3 - Jazz/Harmony */}
          {gameState.soundLines.line3.enabled && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium w-16 text-purple-600">Line 3:</span>
              <div className="flex-1 font-mono text-sm bg-purple-50 border border-purple-200 rounded px-3 py-2">
                {gameState.patternAST.line3 ? 
                  generateStrudelCode(gameState.patternAST.line3, { enabledSamples: new Set(['piano']), availableEffects: [], maxComplexity: 10, preferredStyle: 'minimal' }) :
                  gameState.soundLines.line3.selectedSample?.startsWith('jazz_') ? 
                    `d3 $ s("piano") # note "${gameState.soundLines.line3.selectedSample.replace('jazz_', '').replace('_', ' ')}"` :
                    gameState.soundLines.line3.selectedSample ? 
                      `d3 $ s("${gameState.soundLines.line3.selectedSample}")` :
                      'd3 $ silence'
                }
              </div>
            </div>
          )}
          
          {/* Line 4 - Bass */}
          {gameState.soundLines.line4.enabled && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium w-16 text-green-600">Line 4:</span>
              <div className="flex-1 font-mono text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
                {gameState.patternAST.line4 ? 
                  generateStrudelCode(gameState.patternAST.line4, { enabledSamples: new Set(['bass']), availableEffects: [], maxComplexity: 10, preferredStyle: 'minimal' }) :
                  gameState.soundLines.line4.selectedSample ? 
                    `d4 $ s("${gameState.soundLines.line4.selectedSample}")` :
                    'd4 $ silence'
                }
              </div>
            </div>
          )}
          
          {/* Combined Pattern Info */}
          <div className="text-center pt-3 border-t border-primary/20">
            <div className="text-sm text-muted-foreground">
              {Object.values(gameState.soundLines).filter(line => line.enabled).length} active lines • BPM: {gameState.strudelBPM}
            </div>
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