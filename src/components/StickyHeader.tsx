// src/components/StickyHeader.tsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

const StickyHeader: React.FC = () => {
  const { gameState } = useGame();
  const [isVisible, setIsVisible] = useState(false);
  const [showPattern, setShowPattern] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const threshold = 200; // Show after scrolling 200px
      
      if (scrollTop > threshold && !isVisible) {
        setIsVisible(true);
        // Delay pattern appearance for animation
        setTimeout(() => setShowPattern(true), 300);
      } else if (scrollTop <= threshold && isVisible) {
        setShowPattern(false);
        // Delay header hiding for smooth transition
        setTimeout(() => setIsVisible(false), 200);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-lg transition-all duration-500 ease-in-out">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Animated title fade */}
          <div className={`transition-all duration-700 ease-in-out ${showPattern ? 'opacity-0 -translate-x-4' : 'opacity-100 translate-x-0'}`}>
            <h1 className="text-lg font-bold text-primary">
              🎵 StrudelIdle
            </h1>
          </div>
          
          {/* Animated pattern display */}
          <div className={`flex-1 mx-4 transition-all duration-700 ease-in-out ${
            showPattern 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}>
            {showPattern && (
              <div className="bg-primary/10 rounded-lg px-4 py-2 border border-primary/20">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-medium">Current Pattern:</span>
                  <div className="font-mono text-sm text-primary bg-background/50 px-2 py-1 rounded truncate max-w-md">
                    {gameState.strudelCode || 's("bd")'}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {gameState.strudelBPM} BPM
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Beats display */}
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">🎵</span>
              <span className="font-semibold">{Math.floor(gameState.beats)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyHeader;