import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), 
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
});
