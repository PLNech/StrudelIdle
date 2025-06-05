// src/types/PatternTypes.ts

export interface PatternElement {
  id: string;
  type: 'note' | 'chord' | 'scale' | 'rhythm' | 'structure';
  name: string;
  cost: number;
  unlocked: boolean;
  owned: boolean;
  strudelCode: string; // The Strudel code this element contributes
  description: string;
}

export interface PatternLine {
  id: string;
  name: string;
  elements: PatternElement[];
  isActive: boolean;
  cost: number;
  unlocked: boolean;
  owned: boolean;
}

export interface StructuredPattern {
  lines: PatternLine[];
  globalModifiers: PatternElement[];
  finalCode: string; // The complete compiled Strudel pattern
}

// Predefined pattern elements that users can purchase
export const PATTERN_ELEMENTS: { [id: string]: PatternElement } = {
  // Basic Notes
  'note_c': {
    id: 'note_c',
    type: 'note',
    name: 'Note C',
    cost: 20,
    unlocked: true,
    owned: false,
    strudelCode: '"c3"',
    description: 'The fundamental note C',
  },
  'note_e': {
    id: 'note_e',
    type: 'note',
    name: 'Note E',
    cost: 25,
    unlocked: false,
    owned: false,
    strudelCode: '"e3"',
    description: 'The major third note E',
  },
  'note_g': {
    id: 'note_g',
    type: 'note',
    name: 'Note G',
    cost: 30,
    unlocked: false,
    owned: false,
    strudelCode: '"g3"',
    description: 'The perfect fifth note G',
  },

  // Basic Chords (require multiple notes)
  'chord_c_major': {
    id: 'chord_c_major',
    type: 'chord',
    name: 'C Major Chord',
    cost: 100,
    unlocked: false,
    owned: false,
    strudelCode: '"c3 e3 g3"',
    description: 'The classic C major triad',
  },

  // Rhythm Patterns
  'rhythm_quarter': {
    id: 'rhythm_quarter',
    type: 'rhythm',
    name: 'Quarter Notes',
    cost: 40,
    unlocked: true,
    owned: false,
    strudelCode: '', // Applied as timing modifier
    description: 'Steady quarter note rhythm',
  },
  'rhythm_eighth': {
    id: 'rhythm_eighth',
    type: 'rhythm',
    name: 'Eighth Notes',
    cost: 60,
    unlocked: false,
    owned: false,
    strudelCode: '', // Applied as timing modifier
    description: 'Faster eighth note rhythm',
  },

  // Structural Elements
  'structure_loop': {
    id: 'structure_loop',
    type: 'structure',
    name: 'Loop Structure',
    cost: 80,
    unlocked: false,
    owned: false,
    strudelCode: '', // Applied as global modifier
    description: 'Enables pattern looping',
  },
  'structure_variation': {
    id: 'structure_variation',
    type: 'structure',
    name: 'Pattern Variation',
    cost: 150,
    unlocked: false,
    owned: false,
    strudelCode: '', // Applied as global modifier
    description: 'Adds subtle variations to patterns',
  },
};

export const PATTERN_LINES: { [id: string]: PatternLine } = {
  'line_melody': {
    id: 'line_melody',
    name: 'Melody Line',
    elements: [],
    isActive: false,
    cost: 50,
    unlocked: true,
    owned: false,
  },
  'line_bass': {
    id: 'line_bass',
    name: 'Bass Line',
    elements: [],
    isActive: false,
    cost: 80,
    unlocked: false,
    owned: false,
  },
  'line_harmony': {
    id: 'line_harmony',
    name: 'Harmony Line',
    elements: [],
    isActive: false,
    cost: 120,
    unlocked: false,
    owned: false,
  },
};