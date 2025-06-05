// src/hooks/useAchievementNotifications.ts
import { useState, useEffect, useRef } from 'react';
import { Achievement } from '../types';

export const useAchievementNotifications = (achievements: { [id: string]: Achievement }) => {
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<Achievement[]>([]);
  const previousAchievements = useRef<{ [id: string]: boolean }>({});

  // Check for newly unlocked achievements
  useEffect(() => {
    const newlyUnlocked: Achievement[] = [];
    
    Object.values(achievements).forEach(achievement => {
      const wasUnlocked = previousAchievements.current[achievement.id];
      const isNowUnlocked = achievement.unlocked;
      
      if (!wasUnlocked && isNowUnlocked) {
        newlyUnlocked.push(achievement);
      }
      
      previousAchievements.current[achievement.id] = isNowUnlocked;
    });

    if (newlyUnlocked.length > 0) {
      setNotificationQueue(prev => [...prev, ...newlyUnlocked]);
    }
  }, [achievements]);

  // Show next notification in queue
  useEffect(() => {
    if (!currentNotification && notificationQueue.length > 0) {
      const [nextNotification, ...remainingQueue] = notificationQueue;
      setCurrentNotification(nextNotification);
      setNotificationQueue(remainingQueue);
    }
  }, [currentNotification, notificationQueue]);

  const closeCurrentNotification = () => {
    setCurrentNotification(null);
  };

  return {
    currentNotification,
    closeCurrentNotification,
  };
};