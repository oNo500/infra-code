import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/lint.ts', 'src/format.ts'],
  format: ['esm'],
  exports: true,
  dts: { eager: true },
})
