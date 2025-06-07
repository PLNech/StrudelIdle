// src/utils/ast.ts
// AST manipulation utilities for Strudel patterns

import { ASTNode, PatternBuilder, PatternMutation, PatternMetrics, CodeGenerationContext } from '../types/ast';

// Generate unique IDs for AST nodes
let nodeIdCounter = 0;
const generateNodeId = (): string => `node_${++nodeIdCounter}`;

// Core pattern builder implementation
export const patternBuilder: PatternBuilder = {
  sound(sample: string): ASTNode {
    return {
      id: generateNodeId(),
      type: 'sound',
      sample,
      editable: true,
      clickable: true,
      expandable: true
    };
  },

  sequence(...patterns: ASTNode[]): ASTNode {
    return {
      id: generateNodeId(),
      type: 'sequence',
      children: patterns,
      editable: false,
      clickable: true,
      expandable: true
    };
  },

  stack(...patterns: ASTNode[]): ASTNode {
    return {
      id: generateNodeId(),
      type: 'stack',
      children: patterns,
      editable: false,
      clickable: true,
      expandable: true
    };
  },

  rest(): ASTNode {
    return {
      id: generateNodeId(),
      type: 'rest',
      editable: false,
      clickable: true,
      expandable: true
    };
  },

  repeat(pattern: ASTNode, count: number): ASTNode {
    return {
      id: generateNodeId(),
      type: 'repeat',
      children: [pattern],
      value: count,
      editable: true,
      clickable: true,
      expandable: false
    };
  },

  euclidean(pattern: ASTNode, pulses: number, steps: number, rotation: number = 0): ASTNode {
    return {
      id: generateNodeId(),
      type: 'euclidean',
      children: [pattern],
      pulses,
      steps,
      rotation,
      editable: true,
      clickable: true,
      expandable: false
    };
  },

  addEffect(pattern: ASTNode, effectType: string, value: number): ASTNode {
    return {
      id: generateNodeId(),
      type: 'effect',
      children: [pattern],
      effectType: effectType as any,
      effectValue: value,
      editable: true,
      clickable: true,
      expandable: false
    };
  },

  mutate(node: ASTNode, mutation: PatternMutation): ASTNode {
    return applyMutation(node, mutation);
  },

  clone(node: ASTNode): ASTNode {
    return cloneNode(node);
  },

  simplify(node: ASTNode): ASTNode {
    return simplifyNode(node);
  }
};

// Deep clone an AST node
function cloneNode(node: ASTNode): ASTNode {
  const cloned: ASTNode = {
    ...node,
    id: generateNodeId(), // Generate new ID for clone
    children: node.children?.map(child => cloneNode(child))
  };
  return cloned;
}

// Apply mutation to AST
function applyMutation(node: ASTNode, mutation: PatternMutation): ASTNode {
  if (node.id === mutation.targetId) {
    switch (mutation.type) {
      case 'replace_sample':
        if (node.type === 'sound') {
          return { ...node, sample: mutation.value };
        }
        break;
      
      case 'add_repeat':
        return patternBuilder.repeat(node, mutation.value || 2);
      
      case 'add_effect':
        return patternBuilder.addEffect(node, mutation.value.type, mutation.value.value);
      
      case 'euclideanify':
        const { pulses = 3, steps = 8, rotation = 0 } = mutation.value || {};
        return patternBuilder.euclidean(node, pulses, steps, rotation);
      
      case 'subdivide':
        // Convert single sound into sequence with subdivisions
        if (node.type === 'sound') {
          const subdivisions = mutation.value || 4;
          const patterns = Array(subdivisions).fill(null).map(() => cloneNode(node));
          return patternBuilder.sequence(...patterns);
        }
        break;
      
      case 'add_rest':
        if (node.type === 'sound') {
          return patternBuilder.sequence(node, patternBuilder.rest());
        }
        break;
    }
  }

  // Recursively apply to children
  if (node.children) {
    const newChildren = node.children.map(child => applyMutation(child, mutation));
    return { ...node, children: newChildren };
  }

  return node;
}

// Simplify AST by removing redundant structures
function simplifyNode(node: ASTNode): ASTNode {
  if (node.children) {
    const simplifiedChildren = node.children.map(simplifyNode);
    
    // Flatten single-child containers
    if (simplifiedChildren.length === 1 && 
        (node.type === 'sequence' || node.type === 'stack')) {
      return simplifiedChildren[0];
    }
    
    return { ...node, children: simplifiedChildren };
  }
  
  return node;
}

// Calculate pattern complexity metrics
export function calculateMetrics(node: ASTNode): PatternMetrics {
  const metrics: PatternMetrics = {
    nodeCount: 0,
    depth: 0,
    rhythmicComplexity: 0,
    harmonicComplexity: 0,
    interactiveElements: 0
  };

  function traverse(n: ASTNode, depth: number = 0): void {
    metrics.nodeCount++;
    metrics.depth = Math.max(metrics.depth, depth);
    
    if (n.clickable || n.editable) {
      metrics.interactiveElements++;
    }
    
    // Calculate complexity based on node type
    switch (n.type) {
      case 'euclidean':
      case 'repeat':
        metrics.rhythmicComplexity += 2;
        break;
      case 'subdivision':
        metrics.rhythmicComplexity += 3;
        break;
      case 'effect':
        metrics.harmonicComplexity += 1;
        break;
      case 'stack':
        metrics.harmonicComplexity += n.children?.length || 0;
        break;
    }
    
    n.children?.forEach(child => traverse(child, depth + 1));
  }

  traverse(node);
  return metrics;
}

// Generate Strudel code from AST
export function generateStrudelCode(node: ASTNode, context: CodeGenerationContext): string {
  function nodeToCode(n: ASTNode): string {
    switch (n.type) {
      case 'sound':
        const sample = n.sample || 'bd';
        // Only use sample if it's enabled
        if (context.enabledSamples.has(sample)) {
          return `sound("${sample}")`;
        }
        return `sound("bd")`; // Fallback to basic kick
      
      case 'sequence':
        if (!n.children?.length) return 'silence';
        const seqPatterns = n.children.map(nodeToCode).join(' ');
        return `"${seqPatterns}"`;
      
      case 'stack':
        if (!n.children?.length) return 'silence';
        const stackPatterns = n.children.map(nodeToCode);
        return `[${stackPatterns.join(', ')}]`;
      
      case 'repeat':
        const pattern = n.children?.[0] ? nodeToCode(n.children[0]) : 'silence';
        return `${pattern}*${n.value || 1}`;
      
      case 'euclidean':
        const eucPattern = n.children?.[0] ? nodeToCode(n.children[0]) : 'silence';
        const rotation = n.rotation ? `,${n.rotation}` : '';
        return `${eucPattern}(${n.pulses},${n.steps}${rotation})`;
      
      case 'effect':
        const effectPattern = n.children?.[0] ? nodeToCode(n.children[0]) : 'silence';
        const effectName = n.effectType || 'gain';
        const effectValue = n.effectValue || 0.5;
        return `${effectPattern}.${effectName}(${effectValue})`;
      
      case 'rest':
        return '~';
      
      case 'pattern':
        return n.children?.map(nodeToCode).join(' ') || 'silence';
      
      default:
        return 'silence';
    }
  }

  return nodeToCode(node);
}

// Find node by ID in AST
export function findNodeById(root: ASTNode, targetId: string): ASTNode | null {
  if (root.id === targetId) {
    return root;
  }
  
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, targetId);
      if (found) return found;
    }
  }
  
  return null;
}

// Get all clickable nodes with their positions
export function getClickableNodes(root: ASTNode): Array<{node: ASTNode, path: number[]}> {
  const clickable: Array<{node: ASTNode, path: number[]}> = [];
  
  function traverse(node: ASTNode, path: number[] = []): void {
    if (node.clickable) {
      clickable.push({ node, path: [...path] });
    }
    
    node.children?.forEach((child, index) => {
      traverse(child, [...path, index]);
    });
  }
  
  traverse(root);
  return clickable;
}

// Generate intelligent mutations based on context
export function generateMutations(node: ASTNode, context: CodeGenerationContext): PatternMutation[] {
  const mutations: PatternMutation[] = [];
  
  if (node.type === 'sound' && node.sample) {
    // Suggest sample replacements from same category
    const availableSamples = Array.from(context.enabledSamples);
    availableSamples.forEach(sample => {
      if (sample !== node.sample) {
        mutations.push({
          type: 'replace_sample',
          targetId: node.id,
          value: sample
        });
      }
    });
    
    // Suggest rhythm mutations
    mutations.push(
      { type: 'add_repeat', targetId: node.id, value: 2 },
      { type: 'add_repeat', targetId: node.id, value: 4 },
      { type: 'euclideanify', targetId: node.id, value: { pulses: 3, steps: 8 } },
      { type: 'euclideanify', targetId: node.id, value: { pulses: 5, steps: 8 } },
      { type: 'subdivide', targetId: node.id, value: 4 },
      { type: 'add_rest', targetId: node.id }
    );
    
    // Suggest effect mutations
    context.availableEffects.forEach(effect => {
      mutations.push({
        type: 'add_effect',
        targetId: node.id,
        value: { type: effect, value: 0.5 }
      });
    });
  }
  
  return mutations.slice(0, 8); // Limit suggestions
}