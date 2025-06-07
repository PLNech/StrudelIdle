// src/types.ts

export type ModuleType = 'sample' | 'synth' | 'effect' | 'refactor';

export interface Module {
  id: string;
  name: string;
  type: ModuleType;
  baseCost: number; // In Beats
  bpsPerUnit: number; // Beats per Second generated per unit of this module
  acquiredCount: number; // How many units of this module are owned
  description: string;
  unlocked: boolean; // Is this module available for purchase
  variants?: number[]; // For samples like bd:1, bd:2. Represents max variant unlocked.
  currentVariant?: number; // The currently active variant, if applicable
  consumption: { // Resources consumed per unit of this module
    ram: number;
    cpu: number;
    dsp: number;
    storage: number;
  };
  outputBoosts?: { // How this module boosts other systems (e.g., Audience Engagement)
    excitement?: number; // % increase in excitement
    cohesion?: number; // % increase in cohesion
    complexity?: number; // % increase in complexity
  };
}

export type HardwareType = 'ram' | 'cpu' | 'dsp' | 'storage';

export interface Hardware {
  id: string;
  name: string;
  type: HardwareType;
  baseCost: number; // In Beats
  capacity: number; // Amount of resource provided (MB RAM, GHz CPU, GFLOPs DSP, GB Storage)
  acquiredCount: number; // How many units of this hardware are owned
  description: string;
  unlocked: boolean;
}

export interface HardwareCapacity {
  total: number;
  used: number;
}

export interface NewsItem {
  id: string;
  message: string;
  timestamp: number;
}

export type AchievementCondition = (gameState: GameState) => boolean;

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  hidden: boolean; // If true, only visible after unlocking
  condition: AchievementCondition; // Function to check if unlocked
}

export interface GameState {
  beats: number;
  bps: number; // Calculated BPS
  modules: { [id: string]: Module }; // Modules by their ID
  hardware: {
    ram: HardwareCapacity;
    cpu: HardwareCapacity;
    dsp: HardwareCapacity;
    storage: HardwareCapacity;
  };
  unlockedHardwareTypes: HardwareType[]; // Types of hardware available to buy
  newsFeed: NewsItem[];
  achievements: { [id: string]: Achievement };
  algorithmicInsightPoints: number; // AIP for prestige
  gameTime: number; // Total seconds played (for idle progress calculation)
  // Audience metrics
  audienceExcitement: number; // 0-100 scale, boosts BPS
  audienceCohesion: number; // 0-100 scale, reduces costs
  audienceComplexity: number; // 0-100 scale, unlocks special modules
  // Strudel.cc related
  strudelCode: string; // The current Strudel.cc code being played
  strudelBPM: number; // The current BPM for Strudel.cc (visible to user)
  hasLooping: boolean; // Whether looping is enabled
  // Sample state management
  loadedSampleVariants: { [bankId: string]: number }; // Currently loaded variant per sample bank (e.g., {bd: 1, sn: 3})
  enabledSamples: { [bankId: string]: boolean }; // Which samples are enabled for pattern generation (e.g., {bd: true, sn: false})
  manualPatternOverride: string | null; // User-set pattern that overrides auto-generation
  // Multi-line sound system
  soundLines: {
    line1: { enabled: boolean; type: 'drums' | 'melodic'; selectedSample?: string; }; // Main drums line
    line2: { enabled: boolean; type: 'drums' | 'melodic'; selectedSample?: string; }; // Second line (melodic)
    line3: { enabled: boolean; type: 'drums' | 'melodic'; selectedSample?: string; }; // Third line
    line4: { enabled: boolean; type: 'drums' | 'melodic'; selectedSample?: string; }; // Fourth line
  };
  // Musical progression system
  unlockedMelodicSamples: string[]; // Available melodic samples (casio, jazz, etc.)
  musicalFeatures: {
    notes: boolean;
    chords: boolean;
    progressions: boolean;
    circleOfFifths: boolean;
    jazzSequences: boolean;
  };
  // New progression system
  unlockedPhases: string[];
  unlockedFeatures: string[];
  codeOMatic: {
    enabled: boolean;
    purchased: boolean;
    cost: number;
    generationInterval: number;
    lastGeneration: number;
    complexity: number; // 0-1
    pausedUntil?: number; // Timestamp when auto-generation should resume
  };
  // Sample banks system
  sampleBanks: {
    unlockedBanks: string[]; // List of unlocked sample bank IDs
    bankVariants: { [bankId: string]: number[] }; // Unlocked variant indices per bank
    totalSamplesUnlocked: number; // Progress metric
  };
  // BPM upgrade system
  bpmUpgrades: {
    unlockedBPMs: number[]; // Available discrete BPM values
    hasSlider: boolean; // Whether fine slider control is unlocked
    sliderCost: number; // Cost for slider upgrade
  };
  // Save system
  saveSettings: {
    autoSave: boolean; // Whether auto-save is enabled
    autoSaveInterval: number; // Auto-save interval in minutes
    lastAutoSave: number; // Timestamp of last auto-save
  };
}

// Initial game state for a new game
export const INITIAL_GAME_STATE: GameState = {
  beats: 15, // Start with enough beats to buy the first module
  bps: 0,
  modules: {},
  hardware: {
    ram: { total: 1024, used: 0 }, // Starting with a basic virtual laptop
    cpu: { total: 2, used: 0 },
    dsp: { total: 0, used: 0 },
    storage: { total: 500, used: 0 },
  },
  unlockedHardwareTypes: ['ram', 'cpu'], // Initially only basic RAM/CPU upgrades available
  newsFeed: [{ id: 'intro-0', message: 'Welcome, budding livecoder! Tap the beat to begin your algorithmic journey.', timestamp: Date.now() }],
  achievements: {}, // Will be populated from achievements.ts
  algorithmicInsightPoints: 0,
  gameTime: 0,
  audienceExcitement: 10, // Small starting audience
  audienceCohesion: 50,
  audienceComplexity: 0,
  strudelCode: 's("bd")', // Initial sound
  strudelBPM: 60, // Very slow at first
  hasLooping: false, // No looping initially
  // Sample state management
  loadedSampleVariants: { bd: 0 }, // Initially bd:0 is loaded
  enabledSamples: { bd: true }, // Initially only bd is enabled
  manualPatternOverride: null, // No manual override initially
  // Multi-line sound system
  soundLines: {
    line1: { enabled: true, type: 'drums', selectedSample: 'bd' }, // Main drums line always enabled
    line2: { enabled: false, type: 'melodic' }, // Second line locked initially
    line3: { enabled: false, type: 'melodic' }, // Third line locked initially
    line4: { enabled: false, type: 'melodic' }, // Fourth line locked initially
  },
  // Musical progression system
  unlockedMelodicSamples: [], // No melodic samples initially
  musicalFeatures: {
    notes: false,
    chords: false,
    progressions: false,
    circleOfFifths: false,
    jazzSequences: false,
  },
  // New progression system
  unlockedPhases: ['first_sounds'], // First phase always unlocked
  unlockedFeatures: ['basic_drums'], // Basic drums always available
  codeOMatic: {
    enabled: false,
    purchased: false,
    cost: 1000,
    generationInterval: 10,
    lastGeneration: 0,
    complexity: 0.3 // Start with moderate complexity
  },
  // Sample banks system
  sampleBanks: {
    unlockedBanks: ['bd'], // Start with basic bass drum
    bankVariants: {
      'bd': [0] // Only first variant of bd unlocked
    },
    totalSamplesUnlocked: 1
  },
  // BPM upgrade system
  bpmUpgrades: {
    unlockedBPMs: [60], // Start with only 60 BPM
    hasSlider: false, // No slider control initially
    sliderCost: 2000 // Expensive slider upgrade
  },
  // Save system
  saveSettings: {
    autoSave: true, // Auto-save enabled by default
    autoSaveInterval: 1, // Auto-save every minute
    lastAutoSave: Date.now(), // Initialize with current time
  },
};
