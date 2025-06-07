// src/data/sampleCategories.ts
// Comprehensive sample categorization based on Dirt-Samples repository

import { SampleCategory } from '../types/ast';

export const SAMPLE_CATEGORIES: SampleCategory[] = [
  {
    name: 'Bass Drums',
    samples: ['bd', 'bassdm', 'clubkick', 'hardkick'],
    mutationWeight: 10
  },
  {
    name: 'Snares & Claps',
    samples: ['sd', 'cp', 'hand', 'rim'],
    mutationWeight: 9
  },
  {
    name: 'Hi-hats',
    samples: ['hh', 'hc', 'ho', 'oh'],
    mutationWeight: 8
  },
  {
    name: 'Cymbals & Crashes',
    samples: ['cr', 'cc', 'rd'],
    mutationWeight: 6
  },
  {
    name: 'Toms',
    samples: ['ht', 'mt', 'lt'],
    mutationWeight: 5
  },
  {
    name: 'Percussion',
    samples: ['perc', 'cb', 'co', 'tb', 'sh', 'chin', 'click'],
    mutationWeight: 7
  },
  {
    name: 'Breaks & Loops',
    samples: ['breaks125', 'breaks152', 'breaks157', 'breaks165', 'amen', 'amencutup', 'foo'],
    mutationWeight: 4
  },
  {
    name: 'Bass Sounds',
    samples: ['bass', 'bass0', 'bass1', 'bass2', 'bass3', 'bassfoo', 'jvbass'],
    mutationWeight: 8
  },
  {
    name: 'Melodic Instruments',
    samples: ['casio', 'jazz', 'piano', 'rhodes', 'strings', 'brass', 'gtr', 'juno'],
    mutationWeight: 6
  },
  {
    name: 'Synthesizers',
    samples: ['arp', 'arpy', 'hoover', 'saw', 'square', 'pluck'],
    mutationWeight: 5
  },
  {
    name: 'Vocal & Speech',
    samples: ['alphabet', 'blue', 'diphone', 'diphone2', 'gab'],
    mutationWeight: 3
  },
  {
    name: 'Electronic & Digital',
    samples: ['glitch', 'glitch2', 'bleep', 'blip', 'electro1', 'em2'],
    mutationWeight: 4
  },
  {
    name: 'Organic & Foley',
    samples: ['birds', 'birds3', 'breath', 'bubble', 'can', 'crow', 'fire', 'insect'],
    mutationWeight: 2
  },
  {
    name: 'Vintage Drums',
    samples: ['dr', 'dr2', 'dr55', 'dr_few', 'drumtraks', 'gretsch'],
    mutationWeight: 7
  },
  {
    name: 'Experimental',
    samples: ['noise', 'random', 'silence', 'sine', 'saw', 'square', 'triangle'],
    mutationWeight: 1
  },
  {
    name: 'World & Ethnic',
    samples: ['east', 'tabla', 'sitar', 'gamelan'],
    mutationWeight: 3
  },
  {
    name: 'Effects & Textures',
    samples: ['hit', 'sweep', 'whoosh', 'zap', 'laser', 'space'],
    mutationWeight: 2
  }
];

// Get category for a sample
export function getSampleCategory(sample: string): SampleCategory | null {
  return SAMPLE_CATEGORIES.find(category => 
    category.samples.includes(sample)
  ) || null;
}

// Get related samples from same category
export function getRelatedSamples(sample: string, maxCount: number = 5): string[] {
  const category = getSampleCategory(sample);
  if (!category) return [];
  
  return category.samples
    .filter(s => s !== sample)
    .slice(0, maxCount);
}

// Get samples by category name
export function getSamplesByCategory(categoryName: string): string[] {
  const category = SAMPLE_CATEGORIES.find(cat => cat.name === categoryName);
  return category?.samples || [];
}

// Get weighted random sample for mutations
export function getWeightedRandomSample(excludeSample?: string): string {
  const weightedSamples: string[] = [];
  
  SAMPLE_CATEGORIES.forEach(category => {
    const count = Math.ceil(category.mutationWeight / 2);
    for (let i = 0; i < count; i++) {
      weightedSamples.push(...category.samples);
    }
  });
  
  const filtered = excludeSample 
    ? weightedSamples.filter(s => s !== excludeSample)
    : weightedSamples;
  
  return filtered[Math.floor(Math.random() * filtered.length)] || 'bd';
}

// Check if sample exists in any category
export function isValidSample(sample: string): boolean {
  return SAMPLE_CATEGORIES.some(category => 
    category.samples.includes(sample)
  );
}