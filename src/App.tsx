// src/App.tsx
import React from 'react';
import './App.css';
import { GameProvider } from './context/GameContext';
import BeatDisplay from './components/BeatDisplay';
import Clicker from './components/Clicker';
import ModuleShop from './components/ModuleShop';
import HardwareShop from './components/HardwareShop';
import ProgressionShop from './components/ProgressionShop';
import CodeOMatic from './components/CodeOMatic';
import NewsFeed from './components/NewsFeed';
import StrudelOutput from './components/StrudelOutput';
import AchievementsDisplay from './components/AchievementsDisplay';
import Settings from './components/Settings';
import SaveLoadMenu from './components/SaveLoadMenu';
import AchievementNotification from './components/AchievementNotification';
import PatternBuilder from './components/PatternBuilder';
import CurrentPattern from './components/CurrentPattern';
import BPMUpgrades from './components/BPMUpgrades';
import StickyHeader from './components/StickyHeader';
import SoundLines from './components/SoundLines';
import InteractivePatternEditor from './components/InteractivePatternEditor';
import { useGame } from './context/GameContext';
import { useAchievementNotifications } from './hooks/useAchievementNotifications';

const GameContent: React.FC = () => {
  const { gameState } = useGame();
  const { currentNotification, closeCurrentNotification } = useAchievementNotifications(gameState.achievements);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 text-foreground">
      {/* Sticky Header for Scrolling */}
      <StickyHeader />
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative">
            {/* Save button in top right */}
            <div className="absolute top-0 right-0">
              <SaveLoadMenu />
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-4 mb-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">🎵</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  StrudelIdle
                </h1>
              </div>
              <div className="text-sm text-muted-foreground">
                Real-time live coding • Powered by Strudel.cc
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Current Pattern - Above the fold */}
      <div className="bg-gradient-to-br from-card to-card/80 border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <CurrentPattern />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-4 lg:gap-6 w-full max-w-[1400px] mx-auto">
          {/* Left Sidebar - Controls & Audio */}
          <div className="md:col-span-3 lg:col-span-3 xl:col-span-4 flex flex-col space-y-4 lg:space-y-6">
            {/* Essential Controls - Always Visible */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
                <Clicker />
              </div>
              <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
                <BeatDisplay />
              </div>
            </div>
            
            {/* Audio Controls */}
            <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
              <StrudelOutput />
            </div>
            
            {/* BPM & Pattern Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
                <BPMUpgrades />
              </div>
              <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm lg:hidden xl:block">
                <PatternBuilder />
              </div>
            </div>
          </div>

          {/* Center - Main Shops */}
          <div className="md:col-span-3 lg:col-span-3 xl:col-span-5 flex flex-col space-y-4 lg:space-y-6">
            <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
              <ProgressionShop />
            </div>
            <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
              <SoundLines />
            </div>
            {/* Interactive Pattern Editor - Prominent placement */}
            <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
              <InteractivePatternEditor />
            </div>
            <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
              <CodeOMatic />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
                <HardwareShop />
              </div>
              <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
                <ModuleShop />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Progress & Info */}
          <div className="md:col-span-6 lg:col-span-2 xl:col-span-3 flex flex-col space-y-4 lg:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
                <NewsFeed />
              </div>
              <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
                <AchievementsDisplay />
              </div>
            </div>
            
            {/* Pattern Builder - Hidden on small screens, visible on large */}
            <div className="hidden lg:block xl:hidden bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
              <PatternBuilder />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <span>🎮</span>
              <span>StrudelIdle</span>
              <span className="text-border">•</span>
              <span>Educational Music Game</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Inspired by live coding & idle games</span>
              <a 
                href="https://strudel.cc/learn/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                📖📀 Strudel Docs
              </a>
              <span className="text-border">•</span>
              <span>Made by <a href="https://me.nech.pl" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">PLN</a></span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Modals & Overlays */}
      <Settings />
      
      {/* Achievement Notifications */}
      <AchievementNotification 
        achievement={currentNotification}
        onClose={closeCurrentNotification}
      />
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
