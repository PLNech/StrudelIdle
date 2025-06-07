// src/components/JazzTheoryProgression.tsx
import React, { useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from './ui/button';
import { patternBuilder } from '../utils/ast';

interface ChordProgression {
  id: string;
  name: string;
  description: string;
  cost: number;
  chords: string[];
  rootNotes: string[];
  unlocked: boolean;
  requires?: string[];
  category: 'basic' | 'intermediate' | 'advanced';
}

const CHORD_PROGRESSIONS: ChordProgression[] = [
  {
    id: 'basic_triad',
    name: 'Basic Triad',
    description: 'Learn major triads: Root, Third, Fifth',
    cost: 300,
    chords: ['C', 'F', 'G'],
    rootNotes: ['c3', 'f3', 'g3'],
    unlocked: false,
    category: 'basic'
  },
  {
    id: 'simple_progression',
    name: 'I-V-vi-IV',
    description: 'Classic pop progression in C major',
    cost: 600,
    chords: ['C', 'G', 'Am', 'F'],
    rootNotes: ['c3', 'g3', 'a3', 'f3'],
    unlocked: false,
    requires: ['basic_triad'],
    category: 'basic'
  },
  {
    id: 'jazz_ii_v_i',
    name: 'ii-V-I',
    description: 'The foundation of jazz harmony',
    cost: 1000,
    chords: ['Dm7', 'G7', 'Cmaj7'],
    rootNotes: ['d3', 'g3', 'c4'],
    unlocked: false,
    requires: ['simple_progression'],
    category: 'intermediate'
  },
  {
    id: 'circle_of_fifths',
    name: 'Circle of Fifths',
    description: 'Navigate the complete circle: C-G-D-A-E-B-F#-C#-Ab-Eb-Bb-F-C',
    cost: 2000,
    chords: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'Ab', 'Eb', 'Bb', 'F'],
    rootNotes: ['c3', 'g3', 'd4', 'a4', 'e4', 'b4', 'fs4', 'cs5', 'gs4', 'ds4', 'as3', 'f3'],
    unlocked: false,
    requires: ['jazz_ii_v_i'],
    category: 'intermediate'
  },
  {
    id: 'giant_steps',
    name: 'Giant Steps',
    description: 'Coltrane\'s masterpiece: rapid key changes every 2 beats',
    cost: 5000,
    chords: ['Bmaj7', 'D7', 'Gmaj7', 'Bb7', 'Ebmaj7', 'Am7', 'D7', 'Gmaj7', 'Em7', 'A7', 'Dmaj7', 'Cmaj7'],
    rootNotes: ['b3', 'd4', 'g4', 'as3', 'ds4', 'a3', 'd4', 'g4', 'e4', 'a4', 'd5', 'c5'],
    unlocked: false,
    requires: ['circle_of_fifths'],
    category: 'advanced'
  }
];

interface TheoryExplanationProps {
  progression: ChordProgression;
}

const TheoryExplanation: React.FC<TheoryExplanationProps> = ({ progression }) => {
  const getExplanation = () => {
    switch (progression.id) {
      case 'basic_triad':
        return (
          <div className="text-sm space-y-2">
            <p><strong>Music Theory:</strong> A triad is the most basic chord, consisting of three notes:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>Root:</strong> The fundamental note (C in C major)</li>
              <li><strong>Third:</strong> Creates the major/minor quality (E in C major)</li>
              <li><strong>Fifth:</strong> Provides stability (G in C major)</li>
            </ul>
            <p className="text-xs italic">Try playing C-E-G together to hear the rich harmonic sound!</p>
          </div>
        );
      
      case 'simple_progression':
        return (
          <div className="text-sm space-y-2">
            <p><strong>I-V-vi-IV Progression:</strong> The most popular chord sequence in Western music.</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>I (C):</strong> Home/tonic - feels stable and resolved</li>
              <li><strong>V (G):</strong> Dominant - creates tension, wants to resolve</li>
              <li><strong>vi (Am):</strong> Relative minor - adds emotional color</li>
              <li><strong>IV (F):</strong> Subdominant - provides contrast before returning home</li>
            </ul>
          </div>
        );
      
      case 'jazz_ii_v_i':
        return (
          <div className="text-sm space-y-2">
            <p><strong>ii-V-I:</strong> The cornerstone of jazz harmony, creating smooth voice leading.</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>ii (Dm7):</strong> Minor 7th - sets up the dominant</li>
              <li><strong>V (G7):</strong> Dominant 7th - strong pull to resolve</li>
              <li><strong>I (Cmaj7):</strong> Major 7th - sophisticated resolution</li>
            </ul>
            <p className="text-xs italic">This progression appears in countless jazz standards!</p>
          </div>
        );
      
      case 'circle_of_fifths':
        return (
          <div className="text-sm space-y-2">
            <p><strong>Circle of Fifths:</strong> Shows the relationship between all 12 keys.</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Moving clockwise: each key has one more sharp</li>
              <li>Moving counter-clockwise: each key has one more flat</li>
              <li>Adjacent keys share 6 of 7 notes (closely related)</li>
              <li>Opposite keys share the fewest notes (distant keys)</li>
            </ul>
          </div>
        );
      
      case 'giant_steps':
        return (
          <div className="text-sm space-y-2">
            <p><strong>Giant Steps:</strong> John Coltrane's revolutionary composition using major thirds.</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Key centers move in major thirds: B → G → Eb</li>
              <li>Each key center uses ii-V-I progressions</li>
              <li>Extremely fast harmonic rhythm (2 chords per measure)</li>
              <li>Considered one of the most challenging songs in jazz</li>
            </ul>
            <p className="text-xs italic">Master this and you've conquered advanced jazz harmony!</p>
          </div>
        );
      
      default:
        return <p className="text-sm">Unlock to learn more about this progression!</p>;
    }
  };

  return (
    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      {getExplanation()}
    </div>
  );
};

const JazzTheoryProgression: React.FC = () => {
  const { gameState, updatePatternAST, purchaseJazzProgression, playJazzProgression } = useGame();
  const [selectedProgression, setSelectedProgression] = useState<string | null>(null);
  const [activeChordIndex, setActiveChordIndex] = useState<number>(0);

  // Check if progression is unlocked
  const isProgressionUnlocked = useCallback((progression: ChordProgression) => {
    const isAlreadyUnlocked = gameState.jazzProgressions[progression.id]?.unlocked || false;
    if (isAlreadyUnlocked) return true;
    
    if (!progression.requires) return gameState.beats >= progression.cost;
    
    // Check if all required progressions are unlocked
    const hasRequirements = progression.requires.every(reqId => 
      gameState.jazzProgressions[reqId]?.unlocked || false
    );
    
    return hasRequirements && gameState.beats >= progression.cost;
  }, [gameState.beats, gameState.jazzProgressions]);

  // Purchase progression
  const purchaseProgression = useCallback((progression: ChordProgression) => {
    if (!isProgressionUnlocked(progression)) return;
    
    purchaseJazzProgression(progression.id, progression.cost);
    
    // Add chord progression to third line if available
    if (gameState.soundLines.line3.enabled) {
      const chordPatterns = progression.rootNotes.map(() => 
        patternBuilder.sound('piano') // TODO: expand to include specific notes
      );
      const sequence = patternBuilder.sequence(...chordPatterns);
      updatePatternAST('line3', sequence);
    }
  }, [isProgressionUnlocked, purchaseJazzProgression, gameState.soundLines.line3.enabled, updatePatternAST]);

  // Play progression preview
  const playProgressionPreview = useCallback((progression: ChordProgression) => {
    const isUnlocked = gameState.jazzProgressions[progression.id]?.unlocked;
    if (!isUnlocked) return;
    
    playJazzProgression(progression.id);
    
    // Cycle through chords in the progression
    setActiveChordIndex(prev => (prev + 1) % progression.chords.length);
  }, [gameState.jazzProgressions, playJazzProgression]);

  // Get progressions organized by category
  const progressionsByCategory = CHORD_PROGRESSIONS.reduce((acc, prog) => {
    if (!acc[prog.category]) acc[prog.category] = [];
    acc[prog.category].push(prog);
    return acc;
  }, {} as Record<string, ChordProgression[]>);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">🎹</span>
        Jazz Theory & Piano Lines
        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          Requires Line 3
        </span>
      </h2>

      {/* Requirement Check */}
      {!gameState.soundLines.line3.enabled && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">🔒 Third Sound Line Required</h3>
          <p className="text-sm text-yellow-700">
            Unlock the third sound line to start learning jazz piano progressions. 
            The third line will be dedicated to harmonic accompaniment while lines 1-2 handle rhythm.
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Cost: 1,500 beats (available in Sound Lines section)
          </p>
        </div>
      )}

      {/* Basic Info */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
        <h3 className="font-medium text-purple-800 mb-2">🎼 Musical Journey</h3>
        <p className="text-sm text-purple-700 mb-2">
          Learn jazz harmony step by step, from basic triads to Coltrane's "Giant Steps". 
          Each progression unlocks new theoretical understanding and musical possibilities.
        </p>
        <div className="text-xs text-purple-600">
          <strong>Theory Focus:</strong> Root notes, harmonic function, voice leading, and jazz standards
        </div>
      </div>

      {/* Progression Categories */}
      {Object.entries(progressionsByCategory).map(([category, progressions]) => (
        <div key={category} className="mb-6">
          <h3 className="text-lg font-semibold mb-3 capitalize">
            {category} Progressions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progressions.map(progression => {
              const isUnlocked = isProgressionUnlocked(progression);
              const canAfford = gameState.beats >= progression.cost;
              const isOwned = gameState.jazzProgressions[progression.id]?.unlocked || false;
              
              return (
                <div 
                  key={progression.id}
                  className={`
                    border rounded-lg p-4 transition-all duration-200
                    ${isOwned ? 
                      'bg-green-50 border-green-200' : 
                      isUnlocked ? 
                        'bg-white border-gray-200 hover:shadow-md' :
                        'bg-gray-50 border-gray-200 opacity-60'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{progression.name}</h4>
                      <p className="text-sm text-muted-foreground">{progression.description}</p>
                    </div>
                    {isOwned && (
                      <span className="text-green-600 text-sm">✓</span>
                    )}
                  </div>

                  {/* Chord Display */}
                  <div className="mb-3">
                    <div className="text-xs font-medium mb-1">Progression:</div>
                    <div className="flex flex-wrap gap-1">
                      {progression.chords.map((chord, index) => (
                        <span 
                          key={index}
                          className={`
                            px-2 py-1 text-xs rounded border font-mono
                            ${index === activeChordIndex && selectedProgression === progression.id ?
                              'bg-primary text-primary-foreground border-primary' :
                              'bg-gray-100 text-gray-700 border-gray-200'
                            }
                          `}
                        >
                          {chord}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!isOwned ? (
                      <Button
                        onClick={() => purchaseProgression(progression)}
                        disabled={!isUnlocked || !canAfford}
                        size="sm"
                        className="flex-1"
                      >
                        {!canAfford ? 
                          `Need ${progression.cost} Beats` : 
                          `Unlock (${progression.cost} Beats)`
                        }
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedProgression(progression.id);
                          playProgressionPreview(progression);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Preview (Played {gameState.jazzProgressions[progression.id]?.timesPlayed || 0}x)
                      </Button>
                    )}
                  </div>

                  {/* Theory Explanation */}
                  {(isOwned || selectedProgression === progression.id) && (
                    <TheoryExplanation progression={progression} />
                  )}

                  {/* Requirements */}
                  {progression.requires && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Requires: {progression.requires.join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Bass Line Theory */}
      {gameState.soundLines.line4.enabled && (
        <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">🎸 Bass Line Theory (Line 4)</h3>
          <p className="text-sm text-green-700 mb-3">
            With the fourth line unlocked, you can now add bass accompaniment to create full arrangements:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium text-green-800">Root Notes</h4>
              <p className="text-xs text-green-600 mt-1">
                Play the root of each chord on beat 1. Foundation of the harmony.
              </p>
            </div>
            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium text-blue-800">Walking Bass</h4>
              <p className="text-xs text-blue-600 mt-1">
                Connect chords with passing tones. Creates smooth melodic movement.
              </p>
            </div>
            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium text-purple-800">Fifth & Sixth</h4>
              <p className="text-xs text-purple-600 mt-1">
                Add the fifth and sixth degrees for richer harmonic texture.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JazzTheoryProgression;