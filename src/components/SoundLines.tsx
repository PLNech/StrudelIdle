// src/components/SoundLines.tsx
import React from 'react';
import { useGame } from '../context/GameContext';
import { Button } from './ui/button';

const SoundLines: React.FC = () => {
  const { gameState, unlockSoundLine, setSoundLineSample, unlockMelodicSample } = useGame();

  // Available melodic samples
  const melodicSamples = ['casio', 'jazz', 'piano', 'rhodes', 'strings', 'brass'];
  
  // Check if user can afford second line
  const secondLineCost = 500;
  const thirdLineCost = 1500;
  const fourthLineCost = 3000;

  const canAffordSecondLine = gameState.beats >= secondLineCost;
  const canAffordThirdLine = gameState.beats >= thirdLineCost;
  const canAffordFourthLine = gameState.beats >= fourthLineCost;

  const handleUnlockLine = (lineNumber: 2 | 3 | 4) => {
    unlockSoundLine(lineNumber);
  };

  const renderSoundLine = (lineKey: 'line1' | 'line2' | 'line3' | 'line4', lineNumber: number) => {
    const line = gameState.soundLines[lineKey];
    const isLocked = !line.enabled;
    
    return (
      <div key={lineKey} className={`bg-card border rounded-lg p-4 ${isLocked ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold flex items-center gap-2">
            <span className="text-lg">🎵</span>
            Sound Line {lineNumber}
            {isLocked && <span className="text-xs text-muted-foreground">🔒</span>}
          </h4>
          
          {line.type === 'melodic' && line.enabled && (
            <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
              Melodic
            </span>
          )}
          {line.type === 'drums' && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              Drums
            </span>
          )}
        </div>

        {line.enabled ? (
          <div className="space-y-3">
            {line.type === 'melodic' ? (
              <div>
                <label className="text-sm font-medium mb-2 block">Select Melodic Sample:</label>
                <select 
                  value={line.selectedSample || ''}
                  onChange={(e) => setSoundLineSample(lineKey, e.target.value)}
                  className="w-full bg-background border rounded px-3 py-2 text-sm"
                  disabled={gameState.unlockedMelodicSamples.length === 0}
                >
                  <option value="">Select sample...</option>
                  {gameState.unlockedMelodicSamples.map(sample => (
                    <option key={sample} value={sample}>
                      {sample.charAt(0).toUpperCase() + sample.slice(1)}
                    </option>
                  ))}
                </select>
                
                {gameState.unlockedMelodicSamples.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Unlock melodic samples first
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">
                  Drum line using: {line.selectedSample || 'bd'}
                </p>
              </div>
            )}

            {/* Musical Features */}
            {line.type === 'melodic' && line.enabled && (
              <div className="border-t pt-3 mt-3">
                <h5 className="text-sm font-medium mb-2">Musical Features:</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 rounded ${gameState.musicalFeatures.notes ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                    {gameState.musicalFeatures.notes ? '✓' : '🔒'} Notes
                  </div>
                  <div className={`p-2 rounded ${gameState.musicalFeatures.chords ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                    {gameState.musicalFeatures.chords ? '✓' : '🔒'} Chords
                  </div>
                  <div className={`p-2 rounded ${gameState.musicalFeatures.progressions ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                    {gameState.musicalFeatures.progressions ? '✓' : '🔒'} Progressions
                  </div>
                  <div className={`p-2 rounded ${gameState.musicalFeatures.circleOfFifths ? 'bg-blue-100 text-blue-800' : 'bg-muted text-muted-foreground'}`}>
                    {gameState.musicalFeatures.circleOfFifths ? '✓' : '🔒'} Circle of 5ths
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              {lineNumber === 2 ? 'Add melodic elements to your track' :
               lineNumber === 3 ? 'Layer additional harmonies' :
               'Create complex multi-layered compositions'}
            </p>
            <Button
              onClick={() => handleUnlockLine(lineNumber as 2 | 3 | 4)}
              disabled={
                lineNumber === 2 ? !canAffordSecondLine :
                lineNumber === 3 ? !canAffordThirdLine || !gameState.soundLines.line2.enabled :
                !canAffordFourthLine || !gameState.soundLines.line3.enabled
              }
              size="sm"
            >
              Unlock for {
                lineNumber === 2 ? secondLineCost :
                lineNumber === 3 ? thirdLineCost :
                fourthLineCost
              } Beats
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">🎼</span>
        Sound Lines & Melody
      </h2>

      <div className="space-y-4">
        {renderSoundLine('line1', 1)}
        {renderSoundLine('line2', 2)}
        {renderSoundLine('line3', 3)}
        {renderSoundLine('line4', 4)}
      </div>

      {/* Melodic Sample Unlocks */}
      {gameState.soundLines.line2.enabled && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">🎹 Melodic Sample Unlocks</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {melodicSamples.map(sample => {
              const isUnlocked = gameState.unlockedMelodicSamples.includes(sample);
              const cost = sample === 'casio' ? 200 : 
                          sample === 'jazz' ? 400 :
                          sample === 'piano' ? 600 :
                          sample === 'rhodes' ? 800 :
                          sample === 'strings' ? 1000 : 1200;
              
              return (
                <div key={sample} className={`border rounded-lg p-3 ${isUnlocked ? 'bg-green-50 border-green-200' : 'bg-card'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{sample}</span>
                    {isUnlocked && <span className="text-green-600 text-sm">✓</span>}
                  </div>
                  
                  {!isUnlocked ? (
                    <Button
                      onClick={() => unlockMelodicSample(sample)}
                      disabled={gameState.beats < cost}
                      size="sm"
                      className="w-full"
                    >
                      {cost} Beats
                    </Button>
                  ) : (
                    <p className="text-sm text-green-600">Available</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundLines;