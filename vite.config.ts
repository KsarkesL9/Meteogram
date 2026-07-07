/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Relative base: GitHub Pages serves the app from a repository subpath
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // Vite pre-bundling breaks the import.meta.url-relative .wasm path of the om-file reader
  optimizeDeps: {
    exclude: ['@openmeteo/weather-map-layer', '@openmeteo/file-reader'],
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
