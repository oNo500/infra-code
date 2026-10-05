import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm'],
  platform: 'node',
  deps: { alwaysBundle: ['@infra-x/tsconfig-presets'] },
  target: 'node20',
  dts: true,
  clean: true,
  outDir: 'dist',
})
