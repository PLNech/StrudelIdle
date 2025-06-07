// src/components/BPMVisualization.tsx
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useGame } from '../context/GameContext';

interface BPMDataPoint {
  time: number;
  bpm: number;
}

const BPMVisualization: React.FC = () => {
  const { gameState } = useGame();
  const [bpmHistory, setBpmHistory] = useState<BPMDataPoint[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize with current BPM if history is empty
    if (bpmHistory.length === 0) {
      const now = Date.now();
      setBpmHistory([{ time: now, bpm: gameState.strudelBPM }]);
    }

    // Record BPM every 200ms
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      setBpmHistory(prev => {
        const newHistory = [
          ...prev,
          { time: now, bpm: gameState.strudelBPM }
        ];
        
        // Keep only last 30 seconds of data (150 points at 200ms intervals)
        const thirtySecondsAgo = now - 30000;
        return newHistory.filter(point => point.time >= thirtySecondsAgo);
      });
    }, 200);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState.strudelBPM, bpmHistory.length]);

  // Format data for chart with relative time
  const chartData = bpmHistory.map((point, index) => ({
    time: index * 0.2, // Time in seconds (200ms intervals)
    bpm: point.bpm
  }));

  if (chartData.length < 1) {
    return (
      <div className="h-20 bg-muted/20 rounded-lg flex items-center justify-center text-sm text-muted-foreground">
        Building BPM history...
      </div>
    );
  }

  // If we only have one data point, duplicate it to show a flat line
  if (chartData.length === 1) {
    chartData.push({ time: chartData[0].time + 0.2, bpm: chartData[0].bpm });
  }

  return (
    <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-3 border border-primary/10">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-primary">🎵 BPM Timeline (30s)</h4>
        <span className="text-xs text-muted-foreground">
          Current: {gameState.strudelBPM} BPM
        </span>
      </div>
      
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="time" 
              type="number" 
              scale="linear" 
              domain={['dataMin', 'dataMax']}
              hide
            />
            <YAxis 
              domain={['dataMin - 10', 'dataMax + 10']} 
              hide
            />
            <Line
              type="monotone"
              dataKey="bpm"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              animationDuration={200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>-30s</span>
        <span>Now</span>
      </div>
    </div>
  );
};

export default BPMVisualization;