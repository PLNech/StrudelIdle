// src/components/EnhancedSampleBank.tsx
import React, { useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { SAMPLE_CATEGORIES, getSampleCategory } from '../data/sampleCategories';
import { Button } from './ui/button';

interface SampleCellProps {
  sampleName: string;
  isEnabled: boolean;
  isUnlocked: boolean;
  variantCount: number;
  activeVariant: number;
  onToggle: (sampleName: string, shiftKey: boolean) => void;
  onVariantSelect: (sampleName: string, variant: number) => void;
}

const SampleCell: React.FC<SampleCellProps> = ({
  sampleName,
  isEnabled,
  isUnlocked,
  variantCount,
  activeVariant,
  onToggle,
  onVariantSelect
}) => {
  const [showVariants, setShowVariants] = useState(false);
  const category = getSampleCategory(sampleName);
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isUnlocked) return;
    onToggle(sampleName, e.shiftKey);
  }, [sampleName, isUnlocked, onToggle]);

  const getCategoryColor = () => {
    if (!category) return 'bg-gray-100 text-gray-600';
    
    const colors = {
      'Bass Drums': 'bg-red-100 text-red-700 border-red-200',
      'Snares & Claps': 'bg-orange-100 text-orange-700 border-orange-200',
      'Hi-hats': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Cymbals & Crashes': 'bg-amber-100 text-amber-700 border-amber-200',
      'Percussion': 'bg-green-100 text-green-700 border-green-200',
      'Bass Sounds': 'bg-blue-100 text-blue-700 border-blue-200',
      'Melodic Instruments': 'bg-purple-100 text-purple-700 border-purple-200',
      'Synthesizers': 'bg-pink-100 text-pink-700 border-pink-200',
      'Breaks & Loops': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };
    
    return colors[category.name as keyof typeof colors] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <div className="relative">
      <div
        className={`
          border-2 rounded-lg p-2 text-xs font-mono cursor-pointer transition-all duration-200
          ${!isUnlocked ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' :
            isEnabled ? `${getCategoryColor()} shadow-md transform scale-105` :
            `${getCategoryColor()} opacity-70 hover:opacity-90 hover:shadow-sm`
          }
        `}
        onClick={handleClick}
        onMouseEnter={() => isUnlocked && variantCount > 1 && setShowVariants(true)}
        onMouseLeave={() => setShowVariants(false)}
        title={isUnlocked ? 
          `${sampleName} (${category?.name || 'Unknown'}) - ${isEnabled ? 'Enabled' : 'Disabled'}${variantCount > 1 ? ` - ${variantCount} variants` : ''}` :
          `${sampleName} - Locked`
        }
      >
        <div className="flex items-center justify-between">
          <span className="truncate flex-1">{sampleName}</span>
          {isEnabled && <span className="ml-1 text-green-600">●</span>}
        </div>
        
        {variantCount > 1 && isUnlocked && (
          <div className="text-xs text-center mt-1 opacity-70">
            {activeVariant + 1}/{variantCount}
          </div>
        )}
      </div>

      {/* Variant selector popup */}
      {showVariants && variantCount > 1 && isUnlocked && (
        <div className="absolute top-full left-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-2 min-w-full">
          <div className="text-xs font-medium mb-1">Variants:</div>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: variantCount }, (_, i) => (
              <button
                key={i}
                className={`
                  text-xs px-2 py-1 rounded border transition-colors
                  ${i === activeVariant ? 
                    'bg-primary text-primary-foreground border-primary' :
                    'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  onVariantSelect(sampleName, i);
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EnhancedSampleBank: React.FC = () => {
  const { gameState, toggleSampleEnabled } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get all unlocked samples from the game state
  const allUnlockedSamples = Object.keys(gameState.enabledSamples);
  
  // Group samples by category
  const samplesByCategory = SAMPLE_CATEGORIES.reduce((acc, category) => {
    const categorySamples = category.samples.filter(sample => 
      allUnlockedSamples.includes(sample)
    );
    if (categorySamples.length > 0) {
      acc[category.name] = categorySamples.sort();
    }
    return acc;
  }, {} as { [categoryName: string]: string[] });

  // Handle sample toggle with shift-click support
  const handleSampleToggle = useCallback((sampleName: string, shiftKey: boolean) => {
    if (shiftKey) {
      // Shift+click: toggle all samples in the same category
      const category = getSampleCategory(sampleName);
      if (category) {
        const allCategorySamples = category.samples.filter(sample => 
          allUnlockedSamples.includes(sample)
        );
        
        // Determine if we should enable or disable based on the clicked sample
        const shouldEnable = !gameState.enabledSamples[sampleName];
        
        allCategorySamples.forEach(sample => {
          if (gameState.enabledSamples[sample] !== shouldEnable) {
            toggleSampleEnabled(sample);
          }
        });
      }
    } else {
      // Regular click: toggle single sample
      toggleSampleEnabled(sampleName);
    }
  }, [gameState.enabledSamples, allUnlockedSamples, toggleSampleEnabled]);

  const handleVariantSelect = useCallback((sampleName: string, variant: number) => {
    // Update the loaded variant for this sample
    // This would need to be implemented in the game context
    console.log(`Selected variant ${variant} for sample ${sampleName}`);
  }, []);

  // Add sample to AST pattern (for future double-click functionality)
  // const addToPattern = useCallback((sampleName: string) => {
  //   const newNode = patternBuilder.sound(sampleName);
  //   
  //   // Add to the first available line
  //   if (!gameState.patternAST.line1) {
  //     updatePatternAST('line1', newNode);
  //   } else if (gameState.soundLines.line2.enabled && !gameState.patternAST.line2) {
  //     updatePatternAST('line2', newNode);
  //   } else if (gameState.soundLines.line3.enabled && !gameState.patternAST.line3) {
  //     updatePatternAST('line3', newNode);
  //   } else if (gameState.soundLines.line4.enabled && !gameState.patternAST.line4) {
  //     updatePatternAST('line4', newNode);
  //   }
  // }, [gameState.patternAST, gameState.soundLines, updatePatternAST]);

  const enabledCount = Object.values(gameState.enabledSamples).filter(Boolean).length;
  const totalCount = allUnlockedSamples.length;

  const filteredSamples = selectedCategory === 'all' ? 
    allUnlockedSamples.sort() : 
    (samplesByCategory[selectedCategory] || []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">🎵</span>
        Enhanced Sample Bank
        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
          {enabledCount}/{totalCount} enabled
        </span>
      </h2>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedCategory === 'all' ? 
              'bg-primary text-primary-foreground' : 
              'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            onClick={() => setSelectedCategory('all')}
          >
            All ({totalCount})
          </button>
          
          {Object.entries(samplesByCategory).map(([categoryName, samples]) => (
            <button
              key={categoryName}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === categoryName ? 
                'bg-primary text-primary-foreground' : 
                'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
              onClick={() => setSelectedCategory(categoryName)}
            >
              {categoryName} ({samples.length})
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <div className="font-medium mb-1">💡 Sample Bank Controls:</div>
        <ul className="text-blue-700 space-y-1">
          <li>• <strong>Click</strong> to enable/disable individual samples</li>
          <li>• <strong>Shift+Click</strong> to enable/disable all samples in the category</li>
          <li>• <strong>Hover</strong> over samples with multiple variants to select version</li>
          <li>• <strong>Double-click</strong> to add sample directly to pattern (coming soon)</li>
        </ul>
      </div>

      {/* Sample Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {filteredSamples.map(sampleName => {
          const isEnabled = gameState.enabledSamples[sampleName] || false;
          const variantCount = gameState.loadedSampleVariants[sampleName] || 1;
          const activeVariant = 0; // TODO: Track active variants
          
          return (
            <SampleCell
              key={sampleName}
              sampleName={sampleName}
              isEnabled={isEnabled}
              isUnlocked={true}
              variantCount={variantCount}
              activeVariant={activeVariant}
              onToggle={handleSampleToggle}
              onVariantSelect={handleVariantSelect}
            />
          );
        })}
      </div>

      {filteredSamples.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No samples available in this category yet.
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            allUnlockedSamples.forEach(sample => {
              if (!gameState.enabledSamples[sample]) {
                toggleSampleEnabled(sample);
              }
            });
          }}
        >
          Enable All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            allUnlockedSamples.forEach(sample => {
              if (gameState.enabledSamples[sample]) {
                toggleSampleEnabled(sample);
              }
            });
          }}
        >
          Disable All
        </Button>
      </div>
    </div>
  );
};

export default EnhancedSampleBank;