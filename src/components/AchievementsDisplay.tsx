// src/components/AchievementsDisplay.tsx
import React from 'react';
import { useGame } from '../context/GameContext';

const AchievementsDisplay: React.FC = () => {
  const { gameState } = useGame();
  const achievements = Object.values(gameState.achievements);

  const unlockedAchievements = achievements.filter(ach => ach.unlocked);
  const hiddenAchievements = achievements.filter(ach => !ach.unlocked && ach.hidden);
  const visibleLockedAchievements = achievements.filter(ach => !ach.unlocked && !ach.hidden);

  return (
    <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-bold mb-4">Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {unlockedAchievements.length > 0 && (
          <div className="col-span-full">
            <h3 className="font-semibold text-lg mb-2 text-green-400">Unlocked ({unlockedAchievements.length})</h3>
            <ul className="space-y-2">
              {unlockedAchievements.map(ach => (
                <li key={ach.id} className="bg-primary/20 p-2 rounded-md border border-green-600">
                  <p className="font-medium">{ach.name} <span className="text-green-500">✔</span></p>
                  <p className="text-xs text-muted-foreground">{ach.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {visibleLockedAchievements.length > 0 && (
          <div className="col-span-full">
            <h3 className="font-semibold text-lg mb-2 text-blue-400">Locked (Visible) ({visibleLockedAchievements.length})</h3>
            <ul className="space-y-2">
              {visibleLockedAchievements.map(ach => (
                <li key={ach.id} className="bg-muted p-2 rounded-md border border-blue-400">
                  <p className="font-medium">{ach.name}</p>
                  <p className="text-xs text-muted-foreground italic">{ach.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hiddenAchievements.length > 0 && (
          <div className="col-span-full">
            <h3 className="font-semibold text-lg mb-2 text-gray-400">Hidden ({hiddenAchievements.length})</h3>
            <p className="text-sm text-muted-foreground italic">
              (More achievements await discovery...)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsDisplay;
