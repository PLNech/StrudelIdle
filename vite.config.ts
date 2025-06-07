import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills'; 

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/StrudelIdle/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  optimizeDeps: {
    // Exclude Strudel packages from pre-bundling to resolve import issues
    exclude: [
      '@strudel/core',
      '@strudel/mini',
      '@strudel/transpiler',
      '@strudel/webaudio',
    ],
  },
  define: {
    global: 'globalThis',
  },
  server: {
    fs: {
      strict: false
    }
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
    }
  }
});
