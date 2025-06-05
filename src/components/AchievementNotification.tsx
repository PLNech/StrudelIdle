// src/components/AchievementNotification.tsx
import React, { useState, useEffect } from 'react';
import { Achievement } from '../types';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 500); // Wait for fade out animation
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-4 rounded-lg shadow-lg border-2 border-yellow-300 max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="text-2xl animate-bounce">🏆</div>
          <div>
            <div className="font-bold text-sm uppercase tracking-wide">Achievement Unlocked!</div>
            <div className="font-semibold">{achievement.name}</div>
            <div className="text-sm opacity-90">{achievement.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;