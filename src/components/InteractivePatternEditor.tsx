// src/components/InteractivePatternEditor.tsx
import React, { useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { ASTNode, PatternMutation } from '../types/ast';
import { patternBuilder, generateStrudelCode, findNodeById, generateMutations } from '../utils/ast';
import { Button } from './ui/button';

interface PatternElementProps {
  node: ASTNode;
  onNodeClick: (nodeId: string, mutations: PatternMutation[]) => void;
  isActive?: boolean;
}

const PatternElement: React.FC<PatternElementProps> = ({ node, onNodeClick, isActive }) => {
  const handleClick = useCallback(() => {
    if (!node.clickable) return;
    
    // Generate context-aware mutations
    const mutations = generateMutations(node, {
      enabledSamples: new Set(['bd', 'sd', 'hh', 'casio', 'jazz']), // TODO: Get from game state
      availableEffects: ['gain', 'lpf', 'hpf'],
      maxComplexity: 10,
      preferredStyle: 'minimal'
    });
    
    onNodeClick(node.id, mutations);
  }, [node, onNodeClick]);

  const getElementDisplay = (): string => {
    switch (node.type) {
      case 'sound':
        return node.sample || 'bd';
      case 'rest':
        return '~';
      case 'repeat':
        return `*${node.value}`;
      case 'euclidean':
        return `(${node.pulses},${node.steps})`;
      case 'effect':
        return `.${node.effectType}(${node.effectValue})`;
      case 'sequence':
        return '[ ]';
      case 'stack':
        return '{ }';
      default:
        return '?';
    }
  };

  const getElementStyle = (): string => {
    let baseClasses = 'inline-block px-2 py-1 m-1 rounded-md text-sm font-mono border transition-all duration-200';
    
    if (node.clickable) {
      baseClasses += ' cursor-pointer hover:shadow-md transform hover:scale-105';
    }
    
    if (isActive) {
      baseClasses += ' ring-2 ring-primary bg-primary/20';
    }
    
    switch (node.type) {
      case 'sound':
        return baseClasses + ' bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200';
      case 'rest':
        return baseClasses + ' bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200';
      case 'repeat':
        return baseClasses + ' bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
      case 'euclidean':
        return baseClasses + ' bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200';
      case 'effect':
        return baseClasses + ' bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200';
      case 'sequence':
      case 'stack':
        return baseClasses + ' bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200';
      default:
        return baseClasses + ' bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200';
    }
  };

  return (
    <span 
      className={getElementStyle()}
      onClick={handleClick}
      title={`${node.type}: ${getElementDisplay()}`}
    >
      {getElementDisplay()}
      {node.children && (
        <span className="ml-1">
          {node.children.map(child => (
            <PatternElement 
              key={child.id} 
              node={child} 
              onNodeClick={onNodeClick}
            />
          ))}
        </span>
      )}
    </span>
  );
};

interface MutationSelectorProps {
  mutations: PatternMutation[];
  onSelectMutation: (mutation: PatternMutation) => void;
  onClose: () => void;
}

const MutationSelector: React.FC<MutationSelectorProps> = ({ mutations, onSelectMutation, onClose }) => {
  const getMutationDescription = (mutation: PatternMutation): string => {
    switch (mutation.type) {
      case 'replace_sample':
        return `→ ${mutation.value}`;
      case 'add_repeat':
        return `Repeat ×${mutation.value}`;
      case 'add_effect':
        return `+ ${mutation.value.type}(${mutation.value.value})`;
      case 'euclideanify':
        return `Euclidean (${mutation.value.pulses},${mutation.value.steps})`;
      case 'subdivide':
        return `Subdivide ×${mutation.value}`;
      case 'add_rest':
        return `+ Rest`;
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-48">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-sm">Transform</h4>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {mutations.slice(0, 8).map((mutation, index) => (
          <button
            key={index}
            onClick={() => onSelectMutation(mutation)}
            className="w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors"
          >
            {getMutationDescription(mutation)}
          </button>
        ))}
      </div>
    </div>
  );
};

const InteractivePatternEditor: React.FC = () => {
  const { gameState, updatePatternAST, toggleInteractiveMode } = useGame();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [availableMutations, setAvailableMutations] = useState<PatternMutation[]>([]);
  const [mutationPosition, setMutationPosition] = useState<{ x: number; y: number } | null>(null);

  // Initialize basic patterns if none exist
  const initializeBasicPatterns = useCallback(() => {
    if (!gameState.patternAST.line1) {
      const basicKick = patternBuilder.sound('bd');
      const basicHat = patternBuilder.sound('hh');
      const basicPattern = patternBuilder.sequence(basicKick, basicHat);
      
      updatePatternAST('line1', basicPattern);
    }
  }, [gameState.patternAST.line1, updatePatternAST]);

  const handleNodeClick = useCallback((nodeId: string, mutations: PatternMutation[], event?: React.MouseEvent) => {
    setSelectedNodeId(nodeId);
    setAvailableMutations(mutations);
    
    if (event) {
      setMutationPosition({ x: event.clientX, y: event.clientY });
    }
  }, []);

  const applyMutation = useCallback((mutation: PatternMutation) => {
    // Find which line contains the target node and apply mutation
    Object.keys(gameState.patternAST).forEach(lineKey => {
      const line = gameState.patternAST[lineKey as keyof typeof gameState.patternAST];
      if (line && findNodeById(line, mutation.targetId)) {
        const mutatedAST = patternBuilder.mutate(line, mutation);
        updatePatternAST(lineKey as 'line1' | 'line2' | 'line3' | 'line4', mutatedAST);
      }
    });
    
    closeMutationSelector();
  }, [gameState.patternAST, updatePatternAST]);

  const closeMutationSelector = useCallback(() => {
    setSelectedNodeId(null);
    setAvailableMutations([]);
    setMutationPosition(null);
  }, []);

  const generateCodeFromAST = useCallback((): string => {
    const context = {
      enabledSamples: new Set(Object.keys(gameState.enabledSamples).filter(s => gameState.enabledSamples[s])),
      availableEffects: ['gain', 'lpf', 'hpf'],
      maxComplexity: 10,
      preferredStyle: 'minimal' as const
    };

    const lines: string[] = [];
    
    if (gameState.patternAST.line1) {
      lines.push(`d1 $ ${generateStrudelCode(gameState.patternAST.line1, context)}`);
    }
    if (gameState.patternAST.line2) {
      lines.push(`d2 $ ${generateStrudelCode(gameState.patternAST.line2, context)}`);
    }
    if (gameState.patternAST.line3) {
      lines.push(`d3 $ ${generateStrudelCode(gameState.patternAST.line3, context)}`);
    }
    if (gameState.patternAST.line4) {
      lines.push(`d4 $ ${generateStrudelCode(gameState.patternAST.line4, context)}`);
    }

    return lines.join('\n') || 'silence';
  }, [gameState.patternAST, gameState.enabledSamples]);

  // Auto-update Strudel code when AST changes
  React.useEffect(() => {
    if (gameState.interactiveMode) {
      const newCode = generateCodeFromAST();
      if (newCode !== gameState.strudelCode) {
        // We need to access setGameState via context, but since we're avoiding it,
        // let's handle this in the game loop instead
        console.log('AST generated new code:', newCode);
      }
    }
  }, [gameState.patternAST, gameState.interactiveMode, generateCodeFromAST, gameState.strudelCode]);

  if (!gameState.interactiveMode) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">🎹</span>
          Interactive Pattern Editor
          <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">🔒 Locked</span>
        </h2>
        
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Unlock interactive pattern editing to build complex rhythms by clicking on pattern elements.
          </p>
          <Button
            onClick={toggleInteractiveMode}
            disabled={gameState.beats < 5000}
          >
            Unlock Interactive Mode (5000 Beats)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">🎹</span>
        Interactive Pattern Editor
        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">✓ Active</span>
      </h2>

      <div className="space-y-4">
        {/* Line 1 - Always available */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Line 1 (Drums)</h3>
            <Button 
              size="sm" 
              variant="outline"
              onClick={initializeBasicPatterns}
            >
              Initialize Basic Pattern
            </Button>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md font-mono">
            {gameState.patternAST.line1 ? (
              <PatternElement 
                node={gameState.patternAST.line1}
                onNodeClick={handleNodeClick}
                isActive={selectedNodeId ? findNodeById(gameState.patternAST.line1, selectedNodeId) !== null : false}
              />
            ) : (
              <span className="text-gray-500">Click "Initialize Basic Pattern" to start</span>
            )}
          </div>
        </div>

        {/* Generated Code Preview */}
        <div className="border rounded-lg p-4 bg-primary/5">
          <h3 className="font-semibold mb-2">Generated Strudel Code:</h3>
          <pre className="bg-background p-3 rounded-md font-mono text-sm overflow-x-auto">
            {generateCodeFromAST()}
          </pre>
        </div>
      </div>

      {/* Mutation Selector */}
      {availableMutations.length > 0 && mutationPosition && (
        <div 
          style={{ 
            position: 'fixed', 
            left: mutationPosition.x, 
            top: mutationPosition.y,
            zIndex: 1000 
          }}
        >
          <MutationSelector
            mutations={availableMutations}
            onSelectMutation={applyMutation}
            onClose={closeMutationSelector}
          />
        </div>
      )}
    </div>
  );
};

export default InteractivePatternEditor;