// src/data/progression.ts - Strudel.cc Workshop-based Progression System

export interface ProgressionPhase {
  id: string;
  name: string;
  description: string;
  unlockCost: number;
  requiredPhases?: string[];
  features: ProgressionFeature[];
}

export interface ProgressionFeature {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'sound' | 'notation' | 'effect' | 'pattern' | 'advanced';
  strudelSyntax: string;
  example?: string;
  unlocked?: boolean;
}

// Phase 1: First Sounds
export const PHASE_FIRST_SOUNDS: ProgressionPhase = {
  id: 'first_sounds',
  name: 'First Sounds',
  description: 'Learn basic sound playback with samples',
  unlockCost: 0, // Always unlocked
  features: [
    {
      id: 'basic_drums',
      name: 'Basic Drums',
      description: 'Play kick, snare, hihat samples',
      cost: 10,
      category: 'sound',
      strudelSyntax: 's("bd hh sd")',
      example: 's("bd hh sd hh")'
    },
    {
      id: 'sample_banks',
      name: 'Sample Banks',
      description: 'Access different sample collections',
      cost: 25,
      category: 'sound',
      strudelSyntax: 's("casio jazz metal")',
      example: 's("casio:1 jazz:2")'
    },
    {
      id: 'drum_machines',
      name: 'Drum Machine Banks',
      description: 'Use vintage drum machine sounds',
      cost: 50,
      category: 'sound',
      strudelSyntax: '.bank("RolandTR808")',
      example: 's("bd hh").bank("RolandTR909")'
    }
  ]
};

// Phase 2: Mini-Notation
export const PHASE_MINI_NOTATION: ProgressionPhase = {
  id: 'mini_notation',
  name: 'Mini-Notation',
  description: 'Master sequencing and timing patterns',
  unlockCost: 100,
  requiredPhases: ['first_sounds'],
  features: [
    {
      id: 'rests',
      name: 'Rests',
      description: 'Add silence with ~ or -',
      cost: 20,
      category: 'notation',
      strudelSyntax: 's("bd ~ hh ~")',
      example: 's("bd ~ sd hh")'
    },
    {
      id: 'speed_multiplier',
      name: 'Speed Multiplier',
      description: 'Make sounds faster with *',
      cost: 30,
      category: 'notation',
      strudelSyntax: 's("bd*2 hh")',
      example: 's("bd*4 ~ sd hh*2")'
    },
    {
      id: 'sub_sequences',
      name: 'Sub-sequences',
      description: 'Group sounds with square brackets',
      cost: 40,
      category: 'notation',
      strudelSyntax: 's("bd [hh hh] sd")',
      example: 's("bd [hh sd hh] sd")'
    },
    {
      id: 'parallel_patterns',
      name: 'Parallel Patterns',
      description: 'Layer multiple patterns with commas',
      cost: 60,
      category: 'notation',
      strudelSyntax: 's("bd*2, hh*4")',
      example: 's("bd sd, hh*4, ~ cp")'
    }
  ]
};

// Phase 3: First Notes
export const PHASE_FIRST_NOTES: ProgressionPhase = {
  id: 'first_notes',
  name: 'First Notes',
  description: 'Add melody and harmony with notes',
  unlockCost: 250,
  requiredPhases: ['mini_notation'],
  features: [
    {
      id: 'basic_notes',
      name: 'Basic Notes',
      description: 'Play notes with letter names',
      cost: 50,
      category: 'sound',
      strudelSyntax: 'note("c e g")',
      example: 'note("c e g b").s("piano")'
    },
    {
      id: 'octaves',
      name: 'Octave Control',
      description: 'Control pitch with octave numbers',
      cost: 75,
      category: 'sound',
      strudelSyntax: 'note("c2 e3 g4")',
      example: 'note("c2 e3 g4 b5").s("sawtooth")'
    },
    {
      id: 'scales',
      name: 'Scale System',
      description: 'Use scale degrees for melodies',
      cost: 100,
      category: 'sound',
      strudelSyntax: 'n("0 2 4").scale("C:major")',
      example: 'n("0 2 4 6").scale("A:minor").s("piano")'
    },
    {
      id: 'timing_control',
      name: 'Timing Control',
      description: 'Control note length and repetition',
      cost: 120,
      category: 'notation',
      strudelSyntax: 'note("c@3 e!2")',
      example: 'note("c@2 e g!3").s("bass")'
    }
  ]
};

// Phase 4: First Effects
export const PHASE_FIRST_EFFECTS: ProgressionPhase = {
  id: 'first_effects',
  name: 'First Effects',
  description: 'Process audio with filters and effects',
  unlockCost: 500,
  requiredPhases: ['first_notes'],
  features: [
    {
      id: 'filters',
      name: 'Filters',
      description: 'Shape sound with low/high-pass filters',
      cost: 100,
      category: 'effect',
      strudelSyntax: '.lpf(800).hpf(200)',
      example: 's("bd hh").lpf(1000)'
    },
    {
      id: 'envelope',
      name: 'Envelope (ADSR)',
      description: 'Control attack, decay, sustain, release',
      cost: 150,
      category: 'effect',
      strudelSyntax: '.adsr("0.1:0.1:0.5:0.2")',
      example: 'note("c e").adsr("0.05:0.2:0.3:0.5")'
    },
    {
      id: 'delay',
      name: 'Delay',
      description: 'Add echo effects',
      cost: 120,
      category: 'effect',
      strudelSyntax: '.delay(0.25)',
      example: 's("hh*4").delay("0.8:0.125:0.6")'
    },
    {
      id: 'reverb',
      name: 'Reverb',
      description: 'Add spatial depth',
      cost: 100,
      category: 'effect',
      strudelSyntax: '.room(0.5)',
      example: 'note("c e g").room(0.8)'
    },
    {
      id: 'panning',
      name: 'Stereo Panning',
      description: 'Position sounds in stereo field',
      cost: 80,
      category: 'effect',
      strudelSyntax: '.pan("0 0.5 1")',
      example: 's("bd hh sd").pan("0 0.5 1")'
    }
  ]
};

// Phase 5: Pattern Effects
export const PHASE_PATTERN_EFFECTS: ProgressionPhase = {
  id: 'pattern_effects',
  name: 'Pattern Effects',
  description: 'Advanced algorithmic pattern manipulation',
  unlockCost: 1000,
  requiredPhases: ['first_effects'],
  features: [
    {
      id: 'reverse',
      name: 'Reverse',
      description: 'Reverse pattern playback',
      cost: 150,
      category: 'pattern',
      strudelSyntax: '.rev()',
      example: 's("bd hh sd hh").rev()'
    },
    {
      id: 'jux',
      name: 'Jux (Stereo Split)',
      description: 'Apply effect to right channel only',
      cost: 200,
      category: 'pattern',
      strudelSyntax: '.jux(rev)',
      example: 's("bd hh sd").jux(x => x.speed(2))'
    },
    {
      id: 'euclidean',
      name: 'Euclidean Rhythms',
      description: 'Generate complex rhythms mathematically',
      cost: 300,
      category: 'pattern',
      strudelSyntax: '.euclid(3,8)',
      example: 's("bd").euclid(5,8)'
    },
    {
      id: 'cycling_patterns',
      name: 'Cycling Patterns',
      description: 'Cycle through different patterns',
      cost: 250,
      category: 'pattern',
      strudelSyntax: 's("<bd hh> <sd cp>")',
      example: 's("<bd sd> <hh*2 hh*4>")'
    },
    {
      id: 'polyrhythm',
      name: 'Polyrhythm',
      description: 'Layer patterns at different speeds',
      cost: 400,
      category: 'pattern',
      strudelSyntax: '.off(1/8, add(7))',
      example: 'note("c e g").off(1/16, x => x.add(7))'
    }
  ]
};

// Phase 6: Advanced Features
export const PHASE_ADVANCED: ProgressionPhase = {
  id: 'advanced',
  name: 'Advanced Features',
  description: 'Complex harmony and modulation',
  unlockCost: 2000,
  requiredPhases: ['pattern_effects'],
  features: [
    {
      id: 'chord_symbols',
      name: 'Chord Symbols',
      description: 'Jazz harmony with chord notation',
      cost: 500,
      category: 'advanced',
      strudelSyntax: 'chord("C^7 Am7 F^7 G7")',
      example: 'chord("<C^7 A7b13 Dm7 G7>").voicing()'
    },
    {
      id: 'modulation',
      name: 'Signal Modulation',
      description: 'Use waveforms to modulate parameters',
      cost: 600,
      category: 'advanced',
      strudelSyntax: '.lpf(sine.range(200,2000))',
      example: 's("hh*8").lpf(sine.slow(4).range(100,1000))'
    },
    {
      id: 'custom_samples',
      name: 'Custom Samples',
      description: 'Load your own audio samples',
      cost: 800,
      category: 'advanced',
      strudelSyntax: 'samples("github:user/repo")',
      example: 's("mysample").samples(customBank)'
    }
  ]
};

export const ALL_PHASES = [
  PHASE_FIRST_SOUNDS,
  PHASE_MINI_NOTATION,
  PHASE_FIRST_NOTES,
  PHASE_FIRST_EFFECTS,
  PHASE_PATTERN_EFFECTS,
  PHASE_ADVANCED
];

// Code-o-matic: Generative code system
export interface CodeOMaticState {
  enabled: boolean;
  purchased: boolean;
  cost: number;
  generationInterval: number; // seconds
  lastGeneration: number;
}

export const DEFAULT_CODE_O_MATIC: CodeOMaticState = {
  enabled: false,
  purchased: false,
  cost: 1000,
  generationInterval: 10,
  lastGeneration: 0
};