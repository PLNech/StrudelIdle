// src/components/ModuleShop.tsx
import React from 'react';
import { useGame } from '../context/GameContext';
import { Button } from './ui/button';
import { getModuleCost, getModuleEffectiveBPS } from '../data/modules';
import { Module } from '../types';

const ModuleShop: React.FC = () => {
  const { gameState, purchaseModule } = useGame();

  const availableModules = Object.values(gameState.modules).filter(module => module.unlocked);

  const getModuleStatus = (module: Module) => {
    const cost = getModuleCost(module);
    const canAfford = gameState.beats >= cost;

    // Check hardware capacity for this module type
    const neededRam = module.consumption.ram;
    const neededCpu = module.consumption.cpu;
    const neededDsp = module.consumption.dsp;
    const neededStorage = module.consumption.storage;

    const hasRam = (gameState.hardware.ram.total - gameState.hardware.ram.used) >= neededRam;
    const hasCpu = (gameState.hardware.cpu.total - gameState.hardware.cpu.used) >= neededCpu;
    const hasDsp = (gameState.hardware.dsp.total - gameState.hardware.dsp.used) >= neededDsp;
    const hasStorage = (gameState.hardware.storage.total - gameState.hardware.storage.used) >= neededStorage;

    const canAccommodate = hasRam && hasCpu && hasDsp && hasStorage;

    let tooltip = '';
    if (!canAfford) tooltip += `Not enough beats (need ${cost.toFixed(0)}).\n`;
    if (!hasRam) tooltip += `Not enough RAM (need ${neededRam}MB).\n`;
    if (!hasCpu) tooltip += `Not enough CPU (need ${neededCpu} cores).\n`;
    if (!hasDsp && neededDsp > 0) tooltip += `Not enough DSP (need ${neededDsp} units).\n`;
    if (!hasStorage && neededStorage > 0) tooltip += `Not enough Storage (need ${neededStorage}GB).\n`;

    return { canPurchase: canAfford && canAccommodate, tooltip: tooltip.trim() };
  };

  return (
    <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-bold mb-4">Code Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableModules.length === 0 && (
          <p className="col-span-full text-muted-foreground text-center">
            No modules unlocked yet. Keep generating beats!
          </p>
        )}
        {availableModules.map(module => {
          const cost = getModuleCost(module);
          const { canPurchase, tooltip } = getModuleStatus(module);
          const currentBPS = getModuleEffectiveBPS(module);

          return (
            <div key={module.id} className="border border-border p-3 rounded-md flex flex-col">
              <h3 className="font-semibold text-lg">{module.name}</h3>
              <p className="text-sm text-muted-foreground">{module.description}</p>
              <p className="text-sm mt-1">Owned: {module.acquiredCount}</p>
              <p className="text-sm">Generates: {module.type === 'effect' ? 'N/A (Effect)' : `${currentBPS.toFixed(2)} BPS`}</p>
              <p className="text-sm text-yellow-500">Cost: {cost.toFixed(0)} Beats</p>
              <div className="text-xs text-muted-foreground mt-1">
                <p>RAM: {module.consumption.ram}MB</p>
                <p>CPU: {module.consumption.cpu} cores</p>
                {module.consumption.dsp > 0 && <p>DSP: {module.consumption.dsp} units</p>}
                {module.consumption.storage > 0 && <p>Storage: {module.consumption.storage}GB</p>}
              </div>
              <Button
                onClick={() => purchaseModule(module.id)}
                disabled={!canPurchase}
                className="mt-3 w-full"
                title={tooltip}
              >
                Buy {module.name}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModuleShop;
