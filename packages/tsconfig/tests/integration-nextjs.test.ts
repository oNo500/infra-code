import { describe, expect, it } from 'bun:test'

import {
  base,
  buildBundler,
  composeAtoms,
  frameworkNextjs,
  runtimeBrowser,
  runtimeNode,
} from '../src/atoms'
import { renderConfig } from '../src/render'

const nextjsOptions = composeAtoms(
  base(),
  runtimeNode(),
  runtimeBrowser(),
  buildBundler(),
  frameworkNextjs(),
)

describe('integration: nextjs produces correct tsconfig', () => {
  it('single-file Next.js app', () => {
    const result = renderConfig({
      compilerOptions: {
        ...nextjsOptions,
        paths: {
          '@/*': ['./src/*'],
          '@workspace/ui/*': ['../../packages/ui/src/*'],
        },
      },
    })

    expect(result.files).toHaveLength(1)
    const co = result.files[0]!.content.compilerOptions

    expect(co.strict).toBe(true)
    expect(co.jsx).toBe('react-jsx')
    expect(co.module).toBe('preserve')
    expect(co.moduleResolution).toBe('bundler')
    expect(co.types).toEqual(['node'])
    expect(co.lib).toEqual(['esnext', 'DOM', 'DOM.Iterable'])
    expect(co.paths).toEqual({
      '@/*': ['./src/*'],
      '@workspace/ui/*': ['../../packages/ui/src/*'],
    })
  })

  it('app + test views produce two tsconfigs', () => {
    const result = renderConfig({
      compilerOptions: { ...nextjsOptions, paths: { '@/*': ['./src/*'] } },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules', '__tests__', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
      views: [
        {
          name: 'test',
          compilerOptions: { types: ['vitest/globals'] },
          include: ['__tests__/**/*', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
        },
      ],
    })

    expect(result.files.map((f) => f.filename)).toEqual(['tsconfig.json', 'tsconfig.test.json'])

    const test = result.files.find((f) => f.filename === 'tsconfig.test.json')!
    // The original pain: types must be merged, not replaced
    expect(test.content.compilerOptions.types).toEqual(['node', 'vitest/globals'])
    // paths from primary propagate to views
    expect(test.content.compilerOptions.paths).toEqual({ '@/*': ['./src/*'] })
    // view include overrides primary include
    expect(test.content.include).toEqual([
      '__tests__/**/*',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
    ])
  })
})
