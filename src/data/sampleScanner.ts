// src/data/sampleScanner.ts - Dynamic Dirt-Samples scanning system

export interface SampleBank {
  id: string;
  name: string;
  description: string;
  variantCount: number;
  category: 'drums' | 'synth' | 'fx' | 'vocal' | 'ambient' | 'electronic' | 'acoustic' | 'breaks';
  unlockCost: number;
  variants: SampleVariant[];
}

export interface SampleVariant {
  index: number;
  unlockCost: number;
  unlocked: boolean;
}

// Sample category classification based on folder names
export const categorizeSample = (foldername: string): SampleBank['category'] => {
  const name = foldername.toLowerCase();
  
  if (name.includes('bd') || name.includes('kick') || name.includes('sd') || name.includes('snare') || 
      name.includes('hh') || name.includes('hat') || name.includes('808') || name.includes('909') ||
      name.includes('drum') || name.includes('perc') || name.includes('cp') || name.includes('clap') ||
      name.includes('cr') || name.includes('cymbal') || name.includes('rim')) {
    return 'drums';
  }
  
  if (name.includes('bass') || name.includes('juno') || name.includes('synth') || name.includes('saw') ||
      name.includes('square') || name.includes('arp') || name.includes('pad')) {
    return 'synth';
  }
  
  if (name.includes('vocal') || name.includes('voice') || name.includes('speak') || name.includes('word')) {
    return 'vocal';
  }
  
  if (name.includes('fx') || name.includes('hit') || name.includes('zap') || name.includes('laser') ||
      name.includes('noise') || name.includes('glitch') || name.includes('crash')) {
    return 'fx';
  }
  
  if (name.includes('ambient') || name.includes('room') || name.includes('space') || name.includes('wind') ||
      name.includes('breath') || name.includes('air') || name.includes('natural')) {
    return 'ambient';
  }
  
  if (name.includes('breaks') || name.includes('break') || name.includes('amen') || name.includes('jungle')) {
    return 'breaks';
  }
  
  if (name.includes('techno')) {
    return 'drums'; // Techno is a drum kit
  }
  
  if (name.includes('electro') || name.includes('house') || name.includes('trance') ||
      name.includes('gabba') || name.includes('hardcore')) {
    return 'electronic';
  }
  
  // Default to acoustic for organic/traditional sounds
  return 'acoustic';
};

// Generate human-readable names from folder names
export const generateSampleName = (foldername: string): string => {
  // Handle special cases first
  const specialNames: { [key: string]: string } = {
    'bd': 'Bass Drum',
    'sd': 'Snare Drum', 
    'hh': 'Hi-Hat',
    'oh': 'Open Hi-Hat',
    'cp': 'Clap',
    'cr': 'Crash',
    'lt': 'Low Tom',
    'mt': 'Mid Tom', 
    'ht': 'High Tom',
    'rd': 'Ride',
    '808bd': '808 Bass Drum',
    '808sd': '808 Snare',
    '808hc': '808 Hi-Hat Closed',
    '808oh': '808 Open Hat',
    '909': 'TR-909 Sounds',
    'amencutup': 'Amen Break Cuts',
    'jungbass': 'Jungle Bass',
    'breakcore': 'Breakcore Breaks',
    'electro1': 'Electro Drums',
    'gretsch': 'Gretsch Kit',
    'drumtraks': 'Drum Traks',
    'alphabet': 'Letter Sounds',
    'numbers': 'Number Sounds',
  };
  
  if (specialNames[foldername]) {
    return specialNames[foldername];
  }
  
  // Convert camelCase/snake_case to Title Case
  return foldername
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Generate descriptions for sample banks
export const generateDescription = (category: SampleBank['category'], variantCount: number): string => {
  const baseDescriptions: { [key in SampleBank['category']]: string } = {
    drums: 'Percussive sounds for rhythm patterns',
    synth: 'Synthesized tones and electronic sounds',
    fx: 'Sound effects and audio textures',
    vocal: 'Voice samples and vocal textures',
    ambient: 'Atmospheric and environmental sounds',
    electronic: 'Electronic music elements',
    acoustic: 'Natural and acoustic instrument sounds',
    breaks: 'Breakbeat patterns and rhythmic loops'
  };
  
  const base = baseDescriptions[category];
  const variants = variantCount > 1 ? ` • ${variantCount} variants` : '';
  
  return `${base}${variants}`;
};

// Calculate unlock costs based on category and variants
export const calculateUnlockCost = (category: SampleBank['category'], variantCount: number): number => {
  const baseCosts: { [key in SampleBank['category']]: number } = {
    drums: 15,      // Drums are fundamental, cheaper
    synth: 30,      // Synths are more complex
    fx: 25,         // Effects are mid-tier
    vocal: 40,      // Vocals are unique/special
    ambient: 20,    // Ambient sounds are atmospheric
    electronic: 35, // Electronic sounds are advanced
    acoustic: 25,   // Acoustic sounds are mid-tier
    breaks: 45      // Breaks are advanced rhythmic patterns
  };
  
  const base = baseCosts[category];
  // More variants = higher cost (but not linear)
  const variantMultiplier = 1 + (Math.log(variantCount) * 0.2);
  
  return Math.round(base * variantMultiplier);
};

// Pragmatic sample banks based on Strudel's built-in samples
// These are samples that should work without external dependencies
export const SAMPLE_BANKS: { [key: string]: SampleBank } = {
  // Basic drums (always unlocked) - built into Strudel
  'bd': {
    id: 'bd',
    name: 'Bass Drum',
    description: 'Classic bass drum sounds • 16 variants',
    variantCount: 16,
    category: 'drums',
    unlockCost: 0, // Always unlocked
    variants: Array.from({length: 16}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 8 + i * 2, // First variant free, others cost more
      unlocked: i === 0 // Only first variant unlocked initially
    }))
  },
  
  'hh': {
    id: 'hh',
    name: 'Hi-Hat',
    description: 'Hi-hat variations for groove • 8 variants',
    variantCount: 8,
    category: 'drums',
    unlockCost: 25,
    variants: Array.from({length: 8}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 6 + i * 2,
      unlocked: false
    }))
  },
  
  'sd': {
    id: 'sd',
    name: 'Snare Drum',
    description: 'Snare drums for backbeat • 16 variants',
    variantCount: 16,
    category: 'drums',
    unlockCost: 35,
    variants: Array.from({length: 16}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 10 + i * 2,
      unlocked: false
    }))
  },
  
  'cp': {
    id: 'cp',
    name: 'Clap',
    description: 'Hand clap samples • 4 variants',
    variantCount: 4,
    category: 'drums',
    unlockCost: 40,
    variants: Array.from({length: 4}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 12 + i * 3,
      unlocked: false
    }))
  },
  
  'oh': {
    id: 'oh',
    name: 'Open Hi-Hat',
    description: 'Open hi-hat sounds • 8 variants',
    variantCount: 8,
    category: 'drums',
    unlockCost: 30,
    variants: Array.from({length: 8}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 8 + i * 2,
      unlocked: false
    }))
  },
  
  // 808 Series - TR-808 drum machine sounds
  'bd808': {
    id: 'bd808',
    name: '808 Bass Drum',
    description: 'Legendary TR-808 bass drums • 8 variants',
    variantCount: 8,
    category: 'drums',
    unlockCost: 60,
    variants: Array.from({length: 8}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 15 + i * 3,
      unlocked: false
    }))
  },
  
  'sd808': {
    id: 'sd808',
    name: '808 Snare',
    description: 'TR-808 snare variations • 8 variants',
    variantCount: 8,
    category: 'drums',
    unlockCost: 70,
    variants: Array.from({length: 8}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 18 + i * 3,
      unlocked: false
    }))
  },
  
  'hh808': {
    id: 'hh808',
    name: '808 Hi-Hat',
    description: 'TR-808 hi-hat sounds • 6 variants',
    variantCount: 6,
    category: 'drums',
    unlockCost: 50,
    variants: Array.from({length: 6}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 12 + i * 2,
      unlocked: false
    }))
  },
  
  // Synth/Electronic  
  'piano': {
    id: 'piano',
    name: 'Piano',
    description: 'Acoustic piano sounds • 8 variants',
    variantCount: 8,
    category: 'synth',
    unlockCost: 80,
    variants: Array.from({length: 8}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 15 + i * 3,
      unlocked: false
    }))
  },
  
  'bass': {
    id: 'bass',
    name: 'Bass',
    description: 'Bass sounds for low-end • 6 variants',
    variantCount: 6,
    category: 'synth',
    unlockCost: 60,
    variants: Array.from({length: 6}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 12 + i * 3,
      unlocked: false
    }))
  },
  
  'sawtooth': {
    id: 'sawtooth',
    name: 'Sawtooth Wave',
    description: 'Classic sawtooth synthesizer • 4 variants',
    variantCount: 4,
    category: 'synth',
    unlockCost: 90,
    variants: Array.from({length: 4}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 20 + i * 5,
      unlocked: false
    }))
  },
  
  // Breaks
  'breaks': {
    id: 'breaks',
    name: 'Breakbeats',
    description: 'Classic breakbeat patterns • 8 variants',
    variantCount: 8,
    category: 'breaks',
    unlockCost: 120,
    variants: Array.from({length: 8}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 25 + i * 5,
      unlocked: false
    }))
  },
  
  'dnb': {
    id: 'dnb',
    name: 'Drum & Bass',
    description: 'Jungle/drum & bass elements • 6 variants',
    variantCount: 6,
    category: 'breaks',
    unlockCost: 100,
    variants: Array.from({length: 6}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 20 + i * 4,
      unlocked: false
    }))
  },
  
  // Ambient/FX
  'noise': {
    id: 'noise',
    name: 'Noise',
    description: 'White and colored noise textures • 4 variants',
    variantCount: 4,
    category: 'fx',
    unlockCost: 70,
    variants: Array.from({length: 4}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 15 + i * 5,
      unlocked: false
    }))
  },
  
  'click': {
    id: 'click',
    name: 'Click Sounds',
    description: 'Percussive click samples • 4 variants',
    variantCount: 4,
    category: 'fx',
    unlockCost: 55,
    variants: Array.from({length: 4}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 10 + i * 3,
      unlocked: false
    }))
  },
  
  // Electronic
  'house': {
    id: 'house',
    name: 'House Kit',
    description: 'House music drum sounds • 8 variants',
    variantCount: 8,
    category: 'electronic',
    unlockCost: 110,
    variants: Array.from({length: 8}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 18 + i * 4,
      unlocked: false
    }))
  },
  
  'techno': {
    id: 'techno',
    name: 'Techno Kit',
    description: 'Hard techno drum sounds • 6 variants',
    variantCount: 6,
    category: 'drums', // Techno is drum kit based
    unlockCost: 130,
    variants: Array.from({length: 6}, (_, i) => ({
      index: i,
      unlockCost: i === 0 ? 0 : 22 + i * 5,
      unlocked: false
    }))
  }
};

// Get unlocked sample banks
export const getUnlockedSampleBanks = (unlockedBanks: string[]): SampleBank[] => {
  return Object.values(SAMPLE_BANKS).filter(bank => 
    unlockedBanks.includes(bank.id)
  );
};

// Get available samples for Code-o-matic generation
export const getAvailableSamples = (unlockedBanks: string[], bankVariants: { [bankId: string]: number[] }): string[] => {
  const samples: string[] = [];
  
  for (const bankId of unlockedBanks) {
    const bank = SAMPLE_BANKS[bankId];
    if (!bank) continue;
    
    const unlockedVariants = bankVariants[bankId] || [0];
    
    for (const variantIndex of unlockedVariants) {
      if (variantIndex === 0) {
        samples.push(bankId); // Base sample name
      } else {
        samples.push(`${bankId}:${variantIndex}`); // Variant syntax
      }
    }
  }
  
  return samples;
};

// Progressive unlock system for sample banks
export const getSampleUnlockProgression = (totalBeats: number): string[] => {
  const progressionThresholds = [
    { beats: 0, unlocks: ['bd'] },
    { beats: 50, unlocks: ['hh'] },
    { beats: 100, unlocks: ['sd'] },
    { beats: 150, unlocks: ['oh'] },
    { beats: 200, unlocks: ['cp'] },
    { beats: 300, unlocks: ['bd808'] },
    { beats: 400, unlocks: ['sd808'] },
    { beats: 500, unlocks: ['hh808'] },
    { beats: 750, unlocks: ['piano'] },
    { beats: 1000, unlocks: ['bass'] },
    { beats: 1250, unlocks: ['sawtooth'] },
    { beats: 1500, unlocks: ['click'] },
    { beats: 2000, unlocks: ['noise'] },
    { beats: 2500, unlocks: ['dnb'] },
    { beats: 3000, unlocks: ['house'] },
    { beats: 3500, unlocks: ['breaks'] },
    { beats: 4000, unlocks: ['techno'] },
  ];
  
  const unlockedBanks: string[] = [];
  
  for (const threshold of progressionThresholds) {
    if (totalBeats >= threshold.beats) {
      unlockedBanks.push(...threshold.unlocks);
    }
  }
  
  return unlockedBanks;
};