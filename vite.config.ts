import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base: GitHub Pages serves the app from a repository subpath (02-tech-architecture.md, section 8)
export default defineConfig({
  base: './',
  plugins: [react()],
});
