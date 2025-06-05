// src/App.tsx
import React from 'react';
import './App.css';
import { GameProvider } from './context/GameContext';
import BeatDisplay from './components/BeatDisplay';
import Clicker from './components/Clicker';
import ModuleShop from './components/ModuleShop';
import HardwareShop from './components/HardwareShop';
import NewsFeed from './components/NewsFeed';
import StrudelOutput from './components/StrudelOutput';
import AchievementsDisplay from './components/AchievementsDisplay';
import Settings from './components/Settings';
import AchievementNotification from './components/AchievementNotification';
import PatternBuilder from './components/PatternBuilder';
import { useGame } from './context/GameContext';
import { useAchievementNotifications } from './hooks/useAchievementNotifications';

const GameContent: React.FC = () => {
  const { gameState } = useGame();
  const { currentNotification, closeCurrentNotification } = useAchievementNotifications(gameState.achievements);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 flex flex-col items-center font-sans">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6 animate-fade-in-down">AlgoRave IDLE</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl">
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <Clicker />
          <BeatDisplay />
          <PatternBuilder />
          <StrudelOutput />
        </div>

        {/* Middle Column (Main Shop) */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <ModuleShop />
          <HardwareShop />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <NewsFeed />
          <AchievementsDisplay />
          {/* TODO: Add Prestige Button / Panel */}
          {/* TODO: Add Audience Metrics Display */}
          {/* TODO: Add Studio Rack Visualizer */}
        </div>
      </div>

      {/* Footer for general game info */}
      <footer className="mt-8 text-muted-foreground text-sm">
        <p>AlgoRave IDLE MVP - Powered by Strudel.cc & React</p>
        <p>Inspired by Cookie Clicker, Kitten Village, Factorio, Dwarf Fortress</p>
      </footer>
      
      {/* Settings Modal */}
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
