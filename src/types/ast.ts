// src/types/ast.ts
// Abstract Syntax Tree types for Strudel pattern representation

export type ASTNodeType = 
  | 'sound'           // Basic sound: sound("bd")
  | 'sequence'        // Sequential patterns: "bd sd hh"
  | 'stack'           // Parallel patterns: ["bd", "sd"]
  | 'repeat'          // Repetition: "bd*4"
  | 'subdivision'     // Time subdivision: "bd*[2 3 2]"
  | 'rest'            // Silence: ~
  | 'euclidean'       // Euclidean rhythm: "bd(3,8)"
  | 'polyrhythm'      // Polyrhythmic: "bd(3,8,2)"
  | 'effect'          // Effect chain: .gain(0.5)
  | 'variable'        // Variable reference: $kick
  | 'pattern';        // Root pattern container

export interface ASTNode {
  id: string;                    // Unique identifier for click targeting
  type: ASTNodeType;
  children?: ASTNode[];
  
  // Common properties
  sample?: string;               // Sample name for sound nodes
  value?: string | number;       // Generic value (for effects, repeats, etc.)
  
  // Specific properties
  steps?: number;                // For euclidean rhythms
  pulses?: number;               // For euclidean rhythms
  rotation?: number;             // For euclidean rhythms
  
  // Effect properties
  effectType?: 'gain' | 'lpf' | 'hpf' | 'delay' | 'reverb' | 'distortion' | 'crush';
  effectValue?: number;
  
  // Metadata for UI
  editable?: boolean;            // Can this node be edited?
  clickable?: boolean;           // Can this node be clicked?
  expandable?: boolean;          // Can this node be expanded into more complex patterns?
  
  // Position in source (for rendering)
  startPos?: number;
  endPos?: number;
}

// Pattern building utilities
export interface PatternBuilder {
  // Core pattern construction
  sound(sample: string): ASTNode;
  sequence(...patterns: ASTNode[]): ASTNode;
  stack(...patterns: ASTNode[]): ASTNode;
  rest(): ASTNode;
  
  // Rhythm operations
  repeat(pattern: ASTNode, count: number): ASTNode;
  euclidean(pattern: ASTNode, pulses: number, steps: number, rotation?: number): ASTNode;
  
  // Effects
  addEffect(pattern: ASTNode, effectType: string, value: number): ASTNode;
  
  // Pattern manipulation
  mutate(node: ASTNode, mutation: PatternMutation): ASTNode;
  clone(node: ASTNode): ASTNode;
  simplify(node: ASTNode): ASTNode;
}

export interface PatternMutation {
  type: 'replace_sample' | 'add_repeat' | 'add_effect' | 'euclideanify' | 'subdivide' | 'add_rest';
  targetId: string;
  value?: any;
}

// Sample categorization for intelligent mutations
export interface SampleCategory {
  name: string;
  samples: string[];
  mutationWeight: number;       // How likely to be suggested in mutations
}

// Pattern complexity metrics
export interface PatternMetrics {
  nodeCount: number;
  depth: number;
  rhythmicComplexity: number;   // Based on euclidean patterns, subdivisions
  harmonicComplexity: number;   // Based on melodic elements, effects
  interactiveElements: number;  // Count of clickable/editable elements
}

// Code generation context
export interface CodeGenerationContext {
  enabledSamples: Set<string>;
  availableEffects: string[];
  maxComplexity: number;
  preferredStyle: 'minimal' | 'complex' | 'rhythmic' | 'melodic';
}