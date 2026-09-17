import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

const sharedConfig = {
  plugins: [react()],
  resolve: viteConfig.resolve,
}

const sharedTestConfig = {
  globals: true,
  setupFiles: ['./__tests__/setup.ts'],
  environment: 'jsdom' as const,
  restoreMocks: true,
}

export default defineConfig({
  ...sharedConfig,
  test: {
    projects: [
      {
        ...sharedConfig,
        test: {
          ...sharedTestConfig,
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
        },
      },
      {
        ...sharedConfig,
        test: {
          ...sharedTestConfig,
          name: 'e2e',
          include: ['__tests__/e2e/**/*.test.{ts,tsx}'],
          testTimeout: 15_000,
        },
      },
    ],
  },
})
