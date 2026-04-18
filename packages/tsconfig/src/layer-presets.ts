import type { LayerInput } from './types'

export interface LayerPreset {
  label: string
  hint: string
  build: (base: string) => LayerInput
}

/**
 * Single source of truth for well-known layer defaults. Consumed by:
 *  - the interactive prompt (label, hint)
 *  - runInit (build)
 *  - the template renderer (serializes the built LayerInput back to source)
 */
export const LAYER_PRESETS: Record<string, LayerPreset> = {
  app: {
    label: 'app',
    hint: 'development + IDE',
    build: () => ({}),
  },
  test: {
    label: 'test',
    hint: 'adds vitest/globals types',
    build: (base) => ({
      extends: base,
      compilerOptions: { types: ['vitest/globals'] },
      include: ['**/*.test.ts', '**/*.test.tsx', '__tests__/**'],
    }),
  },
  build: {
    label: 'build',
    hint: 'excludes test files',
    build: (base) => ({
      extends: base,
      exclude: ['**/*.test.ts', '**/*.test.tsx', '__tests__/**'],
    }),
  },
  ci: {
    label: 'ci',
    hint: 'adds declarationMap',
    build: (base) => ({
      extends: base,
      compilerOptions: { declarationMap: true, sourceMap: true },
    }),
  },
}

export function buildLayer(name: string, base: string | undefined): LayerInput {
  const preset = LAYER_PRESETS[name]
  if (!preset || !base || base === name) return {}
  return preset.build(base)
}
