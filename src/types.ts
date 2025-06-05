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
}

// Initial game state for a new game
export const INITIAL_GAME_STATE: GameState = {
  beats: 0,
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
};
