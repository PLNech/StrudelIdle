// src/data/hardware.ts
import { Hardware } from '../types';

export const ALL_HARDWARE: { [id: string]: Hardware } = {
  // --- RAM ---
  'ram_stick_1gb': {
    id: 'ram_stick_1gb',
    name: '1GB RAM Stick',
    type: 'ram',
    baseCost: 20,
    capacity: 1024, // 1GB in MB
    acquiredCount: 0,
    description: 'Adds 1GB of volatile memory for more complex modules.',
    unlocked: true,
  },
  'ram_stick_4gb': {
    id: 'ram_stick_4gb',
    name: '4GB RAM Stick',
    type: 'ram',
    baseCost: 150,
    capacity: 4096, // 4GB in MB
    acquiredCount: 0,
    description: 'Significant memory boost for advanced synth patches.',
    unlocked: false,
  },
  // TODO: Add 8GB, 16GB, 32GB RAM sticks

  // --- CPU ---
  'cpu_core_1': {
    id: 'cpu_core_1',
    name: '1 Core CPU Unit',
    type: 'cpu',
    baseCost: 30,
    capacity: 1, // 1 virtual core
    acquiredCount: 0,
    description: 'A basic processing unit for running synth algorithms.',
    unlocked: true,
  },
  'cpu_core_4': {
    id: 'cpu_core_4',
    name: '4 Core CPU Unit',
    type: 'cpu',
    baseCost: 200,
    capacity: 4, // 4 virtual cores
    acquiredCount: 0,
    description: 'Quad-core power for parallel synth processing.',
    unlocked: false,
  },
  // TODO: Add 8-core, 16-core, etc. CPU units

  // --- DSP ---
  'dsp_chip_low': {
    id: 'dsp_chip_low',
    name: 'Low-Power DSP Chip',
    type: 'dsp',
    baseCost: 200,
    capacity: 1, // 1 DSP unit capacity
    acquiredCount: 0,
    description: 'A dedicated chip for processing audio effects.',
    unlocked: true, // Make DSP available early
  },
  'dsp_chip_mid': {
    id: 'dsp_chip_mid',
    name: 'Mid-Range DSP Chip',
    type: 'dsp',
    baseCost: 800,
    capacity: 4, // 4 DSP units capacity
    acquiredCount: 0,
    description: 'More powerful DSP for complex effect chains.',
    unlocked: false,
  },
  // TODO: Add more powerful DSP chips

  // --- Storage ---
  'ssd_100gb': {
    id: 'ssd_100gb',
    name: '100GB SSD',
    type: 'storage',
    baseCost: 100,
    capacity: 100, // 100GB
    acquiredCount: 0,
    description: 'Fast storage for your growing sample library.',
    unlocked: false,
  },
  // TODO: Add larger SSDs, NVMe drives
};

// Function to get the cost of a hardware item
export const getHardwareCost = (hardware: Hardware): number => {
  // TODO: Implement increasing costs based on acquiredCount, etc.
  return hardware.baseCost * (hardware.acquiredCount + 1); // Simple exponential increase
};
