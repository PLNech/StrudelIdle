// src/data/achievements.ts
import { Achievement, GameState } from '../types';

export const ALL_ACHIEVEMENTS: { [id: string]: Achievement } = {
  'first_beat': {
    id: 'first_beat',
    name: 'First Beat!',
    description: 'Generate your very first beat.',
    unlocked: false,
    hidden: false,
    condition: (state: GameState) => state.beats > 0,
  },
  'loop_starter': {
    id: 'loop_starter',
    name: 'Loop Starter',
    description: 'Acquire your first automated drum loop.',
    unlocked: false,
    hidden: false,
    condition: (state: GameState) => (state.modules['bd']?.acquiredCount || 0) > 0,
  },
  'drum_machine': {
    id: 'drum_machine',
    name: 'Drum Machine',
    description: 'Unlock all basic drum samples (bd, sn, hh).',
    unlocked: false,
    hidden: false,
    condition: (state: GameState) =>
      (state.modules['bd']?.acquiredCount || 0) > 0 &&
      (state.modules['sn']?.acquiredCount || 0) > 0 &&
      (state.modules['hh']?.acquiredCount || 0) > 0,
  },
  'first_synth': {
    id: 'first_synth',
    name: 'Synth Initiate',
    description: 'Purchase your first synth module.',
    unlocked: false,
    hidden: false,
    condition: (state: GameState) => (state.modules['sine_synth']?.acquiredCount || 0) > 0,
  },
  'ram_hungry': {
    id: 'ram_hungry',
    name: 'RAM Hungry',
    description: 'Use over 500MB of RAM.',
    unlocked: false,
    hidden: false,
    condition: (state: GameState) => state.hardware.ram.used > 500,
  },
  'cpu_addict': {
    id: 'cpu_addict',
    name: 'CPU Addict',
    description: 'Use over 1.5 CPU Cores.',
    unlocked: false,
    hidden: true, // Hidden until achieved
    condition: (state: GameState) => state.hardware.cpu.used > 1.5,
  },
  // Example of a more complex, state-sequence based achievement (TODO: Requires tracking more state)
  'panic_and_recover': {
    id: 'panic_and_recover',
    name: 'Panic & Recover',
    description: 'Experience your BPS drop by 90% then recover to 200% of its previous peak.',
    unlocked: false,
    hidden: true,
    condition: (state: GameState) => {
      // This achievement needs a way to track BPS history and peaks/troughs.
      // For MVP, we'll mark this as a TODO and just return false.
      // TODO: Implement BPS history tracking in GameState or a dedicated hook.
      return false;
    },
  },
  'billion_percussive_beats': {
    id: 'billion_percussive_beats',
    name: 'Are you Daft Punk?',
    description: 'Produce one billion beats from percussive samples (bd, sn, hh).',
    unlocked: false,
    hidden: true,
    condition: (state: GameState) => {
      // TODO: Requires tracking cumulative beats per module type.
      return false;
    },
  },
};

// Function to initialize achievements into game state
export const initializeAchievements = (): { [id: string]: Achievement } => {
  const initialized: { [id: string]: Achievement } = {};
  for (const id in ALL_ACHIEVEMENTS) {
    initialized[id] = { ...ALL_ACHIEVEMENTS[id] }; // Deep copy
  }
  return initialized;
};

// Function to check and update achievement status
export const checkAchievements = (gameState: GameState, currentAchievements: { [id: string]: Achievement }): { [id: string]: Achievement } => {
  let updatedAchievements = { ...currentAchievements };
  let newAchievementsUnlocked: string[] = [];

  for (const id in ALL_ACHIEVEMENTS) {
    const achievement = updatedAchievements[id];
    if (!achievement.unlocked) {
      if (ALL_ACHIEVEMENTS[id].condition(gameState)) {
        updatedAchievements = {
          ...updatedAchievements,
          [id]: { ...achievement, unlocked: true },
        };
        newAchievementsUnlocked.push(achievement.name);
      }
    }
  }

  if (newAchievementsUnlocked.length > 0) {
    // This is where you might trigger a notification in the UI/News Feed
    // For MVP, we'll just log it.
    console.log('New Achievements Unlocked:', newAchievementsUnlocked);
  }
  return updatedAchievements;
};
