// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3004,
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    css: false,
    include: ['src/tests/**/*.test.{js,jsx}'],
    server: {
      deps: {
        inline: [/@mui/],
      },
    },
  },
});
