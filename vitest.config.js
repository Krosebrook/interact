import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}',
        '**/main.jsx',
        'vite.config.js',
        'vitest.config.js',
        'eslint.config.js',
        'tailwind.config.js',
        'postcss.config.js',
      ],
      include: ['src/**/*.{js,jsx}'],
      all: true,
      lines: 30,
      functions: 30,
      branches: 30,
      statements: 30,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
