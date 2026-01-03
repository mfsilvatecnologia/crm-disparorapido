/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environmentMatchGlobs: [
      ['src/test/contract/**', 'node'],
      ['specs/**/contracts/**', 'node'],
      ['src/features/**/__tests__/**/*.contract.ts', 'node'],
      ['src/test/integration/**', 'jsdom'],
      ['src/features/**/__tests__/**/*.test.tsx', 'jsdom'],
      ['src/App.test.tsx', 'jsdom'],
    ],
    setupFiles: ['./src/test/setup.ts', './src/test/setup-node.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/build/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
