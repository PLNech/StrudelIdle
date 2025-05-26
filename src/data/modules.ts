// src/data/modules.ts
import { Module } from '../types';

export const ALL_MODULES: { [id: string]: Module } = {
  // --- Samples ---
  'bd': {
    id: 'bd',
    name: 'Kick Drum (bd)',
    type: 'sample',
    baseCost: 10,
    bpsPerUnit: 0.1,
    acquiredCount: 0,
    description: 'The foundational thud. Creates a solid pulse.',
    unlocked: true,
    variants: [1], // bd:1
    currentVariant: 1,
    consumption: { ram: 10, cpu: 0, dsp: 0, storage: 5 },
    outputBoosts: { excitement: 0.01, cohesion: 0.05 },
  },
  'sn': {
    id: 'sn',
    name: 'Snare (sn)',
    type: 'sample',
    baseCost: 50,
    bpsPerUnit: 0.3,
    acquiredCount: 0,
    description: 'Crisp and punchy. Essential for rhythm.',
    unlocked: false, // Unlocked later
    variants: [1],
    currentVariant: 1,
    consumption: { ram: 15, cpu: 0, dsp: 0, storage: 8 },
    outputBoosts: { excitement: 0.02, complexity: 0.01 },
  },
  'hh': {
    id: 'hh',
    name: 'Hi-Hat (hh)',
    type: 'sample',
    baseCost: 75,
    bpsPerUnit: 0.2,
    acquiredCount: 0,
    description: 'Adds a shimmer and drives the tempo.',
    unlocked: false,
    variants: [1],
    currentVariant: 1,
    consumption: { ram: 12, cpu: 0, dsp: 0, storage: 7 },
    outputBoosts: { excitement: 0.01, cohesion: 0.02 },
  },
  // TODO: Add more samples (clap, perc, arpy, etc.)
  // TODO: Add more variants (e.g., bd:2, bd:3 as separate unlockable upgrades on the module)

  // --- Synths ---
  'sine_synth': {
    id: 'sine_synth',
    name: 'Sine Synth',
    type: 'synth',
    baseCost: 200,
    bpsPerUnit: 1.0,
    acquiredCount: 0,
    description: 'A pure, clean waveform. Good for basslines or pads.',
    unlocked: false,
    consumption: { ram: 50, cpu: 0.1, dsp: 0, storage: 20 }, // Consumes CPU
    outputBoosts: { complexity: 0.05, cohesion: 0.03 },
  },
  // TODO: Add more synths (saw_synth, pluck_synth)

  // --- Effects ---
  'reverb_unit': {
    id: 'reverb_unit',
    name: 'Reverb Unit',
    type: 'effect',
    baseCost: 300,
    bpsPerUnit: 0, // Effects don't generate BPS directly
    acquiredCount: 0,
    description: 'Adds space and atmosphere to your sound.',
    unlocked: false,
    consumption: { ram: 30, cpu: 0.05, dsp: 0.1, storage: 15 }, // Consumes DSP
    outputBoosts: { excitement: 0.03, complexity: 0.02 },
  },
  // TODO: Add more effects (delay, distort, crush, limiter)

  // --- Refactoring Tools (Automation/Optimization) ---
  'auto_quantizer': {
    id: 'auto_quantizer',
    name: 'Auto-Quantizer',
    type: 'refactor',
    baseCost: 150,
    bpsPerUnit: 0.05, // Small passive BPS boost for efficiency
    acquiredCount: 0,
    description: 'Automatically corrects timing, making your loops tighter.',
    unlocked: false,
    consumption: { ram: 10, cpu: 0.02, dsp: 0, storage: 5 },
    outputBoosts: { cohesion: 0.1 },
  },
  // TODO: Add more refactoring tools (Pattern Expander, Auto-Mixer)
};

// Function to get the cost of a module, considering dynamic pricing (MVP: just base cost)
export const getModuleCost = (module: Module): number => {
  // TODO: Implement increasing costs based on acquiredCount, etc.
  return module.baseCost * (module.acquiredCount + 1); // Simple exponential increase
};

// Function to calculate a module's effective BPS, considering variants, etc.
export const getModuleEffectiveBPS = (module: Module): number => {
  let effectiveBPS = module.bpsPerUnit * module.acquiredCount;
  // TODO: Implement variant-specific BPS boosts (e.g., bd:2 is 1.5x bd:1)
  return effectiveBPS;
};
