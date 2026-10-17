import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-expect-error Runtime-only Vite plugin implemented as ESM JavaScript.
import { shadcnSpaceBridge } from './scripts/shadcnspace-bridge.mjs';

export default defineConfig({
  plugins: [react(), shadcnSpaceBridge()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
  build: {
    sourcemap: true,
  },
});
