/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Relative base: GitHub Pages serves the app from a repository subpath
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  test: {
    include: ['tests/**/*.test.ts'],
    // No lib modules exist yet; removed together with the first test in stage 2
    passWithNoTests: true,
  },
});
