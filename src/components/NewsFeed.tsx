// src/components/NewsFeed.tsx
import React, { useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';

const NewsFeed: React.FC = () => {
  const { gameState } = useGame();
  const newsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new news items if needed, or implement rolling/marquee
    if (newsRef.current) {
      newsRef.current.scrollTop = newsRef.current.scrollHeight;
    }
  }, [gameState.newsFeed]);

  return (
    <div className="bg-card text-card-foreground p-3 rounded-lg shadow-md mb-4 h-24 overflow-hidden relative">
      <h2 className="text-lg font-bold mb-2">News Feed</h2>
      <div ref={newsRef} className="absolute inset-0 top-10 overflow-y-auto px-3 pb-2 custom-scrollbar">
        {gameState.newsFeed.length === 0 ? (
          <p className="text-muted-foreground text-sm">No news yet...</p>
        ) : (
          <ul className="space-y-1">
            {gameState.newsFeed.map((item) => (
              <li key={item.id} className="text-sm text-left">
                <span className="text-blue-400">NEWS:</span> {item.message}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* TODO: Implement a smooth, rolling marquee effect for the news feed */}
    </div>
  );
};

export default NewsFeed;
