import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  shims: true,
  dts: false,
  clean: true,
  outDir: 'dist',
  outExtensions: () => ({ js: '.js' }),
})
