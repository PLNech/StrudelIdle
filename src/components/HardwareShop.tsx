// src/components/HardwareShop.tsx
import React from 'react';
import { useGame } from '../context/GameContext';
import { Button } from './ui/button';
import { ALL_HARDWARE, getHardwareCost } from '../data/hardware';
import { Hardware } from '../types';

const HardwareShop: React.FC = () => {
  const { gameState, purchaseHardware } = useGame();

  // Filter hardware based on unlocked types
  const availableHardware = Object.values(ALL_HARDWARE).filter(
    hw => gameState.unlockedHardwareTypes.includes(hw.type) && hw.baseCost <= gameState.beats // Simple unlock check
  );

  const getHardwareStatus = (hardware: Hardware) => {
    const cost = getHardwareCost(hardware);
    const canAfford = gameState.beats >= cost;
    return { canPurchase: canAfford, tooltip: !canAfford ? `Not enough beats (need ${cost.toFixed(0)}).` : '' };
  };

  return (
    <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-bold mb-4">Hardware Upgrades</h2>
      <div className="text-sm text-muted-foreground mb-4">
        <p>RAM: {gameState.hardware.ram.used.toFixed(0)}MB / {gameState.hardware.ram.total.toFixed(0)}MB</p>
        <p>CPU: {gameState.hardware.cpu.used.toFixed(1)} Cores / {gameState.hardware.cpu.total.toFixed(1)} Cores</p>
        <p>DSP: {gameState.hardware.dsp.used.toFixed(1)} Units / {gameState.hardware.dsp.total.toFixed(1)} Units</p>
        <p>Storage: {gameState.hardware.storage.used.toFixed(0)}GB / {gameState.hardware.storage.total.toFixed(0)}GB</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableHardware.length === 0 && (
          <p className="col-span-full text-muted-foreground text-center">
            No hardware upgrades available yet.
          </p>
        )}
        {availableHardware.map(hardware => {
          const cost = getHardwareCost(hardware);
          const { canPurchase, tooltip } = getHardwareStatus(hardware);
          const currentOwned = ALL_HARDWARE[hardware.id].acquiredCount; // Directly from ALL_HARDWARE for current owned count

          return (
            <div key={hardware.id} className="border border-border p-3 rounded-md flex flex-col">
              <h3 className="font-semibold text-lg">{hardware.name}</h3>
              <p className="text-sm text-muted-foreground">{hardware.description}</p>
              <p className="text-sm mt-1">Owned: {currentOwned}</p>
              <p className="text-sm">Adds: {hardware.capacity} {hardware.type.toUpperCase() === 'RAM' ? 'MB' : (hardware.type === 'cpu' ? 'Cores' : (hardware.type === 'dsp' ? 'Units' : 'GB'))}</p>
              <p className="text-sm text-yellow-500">Cost: {cost.toFixed(0)} Beats</p>
              <Button
                onClick={() => purchaseHardware(hardware.id)}
                disabled={!canPurchase}
                className="mt-3 w-full"
                title={tooltip}
              >
                Buy {hardware.name}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HardwareShop;
