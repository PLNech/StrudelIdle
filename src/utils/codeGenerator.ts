// src/utils/codeGenerator.ts - Generative code system for Code-o-matic

import { ProgressionFeature } from '../data/progression';
import { getAvailableSamples } from '../data/sampleScanner';

export interface GenerationContext {
  unlockedFeatures: ProgressionFeature[];
  complexity: number; // 0-1, affects how many features to combine
  preferredCategory?: 'sound' | 'notation' | 'effect' | 'pattern' | 'advanced';
  // Sample bank context
  unlockedBanks: string[];
  bankVariants: { [bankId: string]: number[] };
}

// Basic sound samples available at the start
const BASIC_SAMPLES = ['bd', 'hh', 'sd', 'oh', 'cr', 'lt', 'mt', 'ht'];
const EXTENDED_SAMPLES = ['casio', 'jazz', 'metal', 'east', 'crow', 'insect'];
const DRUM_MACHINES = ['RolandTR808', 'RolandTR909', 'AkaiLinn', 'RhythmAce'];

// Note progressions and scales
const NOTES = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
const SCALE_TYPES = ['major', 'minor', 'dorian', 'mixolydian', 'pentatonic'];
// const CHORD_PROGRESSIONS = ['C^7 Am7 F^7 G7', 'Dm7 G7 C^7 A7', 'Am7 F^7 C^7 G7'];

// Pattern templates based on complexity
const SIMPLE_PATTERNS = [
  'bd hh sd hh',
  'bd bd sd',
  'hh*4',
  'bd ~ sd ~'
];

const COMPLEX_PATTERNS = [
  'bd [hh hh] sd hh',
  '<bd sd> hh*2',
  'bd*2, hh*4, ~ cp',
  '[bd bd] [~ sd]'
];

export class CodeGenerator {
  private random(): number {
    return Math.random();
  }

  private choose<T>(array: T[]): T {
    return array[Math.floor(this.random() * array.length)];
  }

  private shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // Check if a feature is unlocked
  private hasFeature(context: GenerationContext, featureId: string): boolean {
    return context.unlockedFeatures.some(f => f.id === featureId);
  }

  // Generate basic drum pattern
  private generateDrumPattern(context: GenerationContext): string {
    // Use available samples from unlocked sample banks
    let availableSamples = getAvailableSamples(context.unlockedBanks, context.bankVariants);
    
    // Fallback to basic samples if no sample banks unlocked
    if (availableSamples.length === 0) {
      availableSamples = [...BASIC_SAMPLES];
    }
    
    // Add extended samples if unlocked (legacy support)
    if (this.hasFeature(context, 'sample_banks')) {
      availableSamples.push(...EXTENDED_SAMPLES);
    }

    // Choose pattern complexity based on unlocked features
    let pattern: string;
    
    if (this.hasFeature(context, 'sub_sequences') && context.complexity > 0.6) {
      pattern = this.choose(COMPLEX_PATTERNS);
    } else {
      pattern = this.choose(SIMPLE_PATTERNS);
    }

    // Replace placeholder samples with actual samples
    const selectedSamples = this.shuffle(availableSamples).slice(0, 4);
    pattern = pattern.replace(/bd/g, selectedSamples[0] || 'bd');
    pattern = pattern.replace(/hh/g, selectedSamples[1] || 'hh');
    pattern = pattern.replace(/sd/g, selectedSamples[2] || 'sd');
    pattern = pattern.replace(/cp/g, selectedSamples[3] || 'cp');

    let result = `s("${pattern}")`;

    // Add drum machine bank if unlocked
    if (this.hasFeature(context, 'drum_machines') && this.random() > 0.7) {
      const bank = this.choose(DRUM_MACHINES);
      result += `.bank("${bank}")`;
    }

    return result;
  }

  // Generate note pattern
  private generateNotePattern(context: GenerationContext): string {
    if (!this.hasFeature(context, 'basic_notes')) {
      return this.generateDrumPattern(context);
    }

    const baseNotes = this.shuffle(NOTES).slice(0, 3 + Math.floor(this.random() * 3));
    
    let pattern: string;
    
    if (this.hasFeature(context, 'scales') && this.random() > 0.5) {
      // Use scale system
      const degrees = Array.from({length: 4}, () => Math.floor(this.random() * 7));
      const root = this.choose(NOTES).toUpperCase();
      const scaleType = this.choose(SCALE_TYPES);
      
      pattern = `n("${degrees.join(' ')}").scale("${root}:${scaleType}")`;
    } else {
      // Use direct note names
      pattern = `note("${baseNotes.join(' ')}")`;
      
      // Add octaves if unlocked
      if (this.hasFeature(context, 'octaves')) {
        const octaves = [2, 3, 4, 5];
        const notesWithOctaves = baseNotes.map(note => 
          `${note}${this.choose(octaves)}`
        );
        pattern = `note("${notesWithOctaves.join(' ')}")`;
      }
    }

    // Add sound source
    const synths = ['piano', 'sawtooth', 'square', 'triangle', 'sine'];
    pattern += `.s("${this.choose(synths)}")`;

    return pattern;
  }

  // Add effects to a pattern
  private addEffects(pattern: string, context: GenerationContext): string {
    let result = pattern;
    const effectsToAdd: string[] = [];

    // Add filters
    if (this.hasFeature(context, 'filters') && this.random() > 0.6) {
      const cutoff = 200 + Math.floor(this.random() * 1800);
      if (this.random() > 0.5) {
        effectsToAdd.push(`.lpf(${cutoff})`);
      } else {
        effectsToAdd.push(`.hpf(${cutoff})`);
      }
    }

    // Add reverb
    if (this.hasFeature(context, 'reverb') && this.random() > 0.7) {
      const room = (0.2 + this.random() * 0.6).toFixed(1);
      effectsToAdd.push(`.room(${room})`);
    }

    // Add delay
    if (this.hasFeature(context, 'delay') && this.random() > 0.8) {
      const delay = (0.125 + this.random() * 0.375).toFixed(3);
      effectsToAdd.push(`.delay(${delay})`);
    }

    // Add panning
    if (this.hasFeature(context, 'panning') && this.random() > 0.8) {
      const pan = this.random().toFixed(1);
      effectsToAdd.push(`.pan(${pan})`);
    }

    // Add envelope
    if (this.hasFeature(context, 'envelope') && this.random() > 0.9) {
      const attack = (0.01 + this.random() * 0.1).toFixed(2);
      const decay = (0.1 + this.random() * 0.3).toFixed(2);
      const sustain = (0.2 + this.random() * 0.6).toFixed(1);
      const release = (0.1 + this.random() * 0.5).toFixed(2);
      effectsToAdd.push(`.adsr("${attack}:${decay}:${sustain}:${release}")`);
    }

    return result + effectsToAdd.join('');
  }

  // Add pattern effects
  private addPatternEffects(pattern: string, context: GenerationContext): string {
    let result = pattern;

    // Add reverse
    if (this.hasFeature(context, 'reverse') && this.random() > 0.9) {
      result += '.rev()';
    }

    // Add euclidean rhythms
    if (this.hasFeature(context, 'euclidean') && this.random() > 0.8) {
      const hits = 3 + Math.floor(this.random() * 5);
      const steps = 8 + Math.floor(this.random() * 8);
      result += `.euclid(${hits},${steps})`;
    }

    // Add jux
    if (this.hasFeature(context, 'jux') && this.random() > 0.95) {
      result += '.jux(rev)';
    }

    return result;
  }

  // Generate a complete pattern
  public generatePattern(context: GenerationContext): string {
    let patterns: string[] = [];

    // Decide on the number of layers based on complexity
    const numLayers = Math.min(1 + Math.floor(context.complexity * 3), 3);

    for (let i = 0; i < numLayers; i++) {
      let pattern: string;

      // Choose pattern type based on available features and randomness
      if (this.hasFeature(context, 'basic_notes') && this.random() > 0.4) {
        pattern = this.generateNotePattern(context);
      } else {
        pattern = this.generateDrumPattern(context);
      }

      // Add effects
      pattern = this.addEffects(pattern, context);
      
      // Add pattern effects
      pattern = this.addPatternEffects(pattern, context);

      patterns.push(pattern);
    }

    // Combine patterns
    if (patterns.length === 1) {
      return patterns[0];
    } else if (this.hasFeature(context, 'parallel_patterns')) {
      // Use stack for parallel patterns
      return patterns[0] + '.stack(' + patterns.slice(1).join(', ') + ')';
    } else {
      // Just return the first pattern if parallel patterns aren't unlocked
      return patterns[0];
    }
  }

  // Generate based on specific feature categories
  public generateByCategory(context: GenerationContext, category: string): string {
    const categoryContext = { ...context, preferredCategory: category as any };
    
    switch (category) {
      case 'sound':
        return this.random() > 0.5 ? 
          this.generateDrumPattern(categoryContext) : 
          this.generateNotePattern(categoryContext);
      
      case 'notation':
        const base = this.generateDrumPattern(categoryContext);
        // Focus on mini-notation features
        return base;
      
      case 'effect':
        const pattern = this.generateDrumPattern(categoryContext);
        return this.addEffects(pattern, categoryContext);
      
      case 'pattern':
        const basePattern = this.generateNotePattern(categoryContext);
        return this.addPatternEffects(basePattern, categoryContext);
      
      default:
        return this.generatePattern(categoryContext);
    }
  }
}