import { describe, expect, it } from 'bun:test'

import { defineTsconfig } from '../src/define'
import { base, buildBundler, composeAtoms, frameworkNextjs, runtimeBrowser, runtimeNode } from '../src/profiles/atoms'

const nextjsCompilerOptions = composeAtoms(base(), runtimeNode(), runtimeBrowser(), buildBundler(), frameworkNextjs())

/**
 * Walking skeleton: reproduce the tsconfig that starters/fullstack/apps/web/
 * would need under the new DSL. Check the shape matches reasonable expectations.
 */
describe('integration: nextjs profile produces reasonable tsconfig', () => {
  it('single-file Next.js app', () => {
    const result = defineTsconfig({
      profile: { compilerOptions: nextjsCompilerOptions },
      compilerOptions: {
        paths: {
          '@/*': ['./src/*'],
          '@workspace/ui/*': ['../../packages/ui/src/*'],
        },
        incremental: true,
      },
    })

    expect(result.files).toHaveLength(1)
    const tsconfig = result.files[0]!.content
    const co = tsconfig.compilerOptions

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
    expect(co.incremental).toBe(true)
  })

  it('app + test layers produce two tsconfigs', () => {
    const result = defineTsconfig({
      profile: { compilerOptions: nextjsCompilerOptions },
      compilerOptions: {
        paths: { '@/*': ['./src/*'] },
      },
      layers: {
        app: {
          include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
          exclude: ['node_modules', '__tests__', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
        },
        test: {
          extends: 'app',
          compilerOptions: {
            types: ['vitest/globals'],
          },
          include: ['__tests__/**/*', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
        },
      },
    })

    expect(result.files.map((f) => f.filename)).toEqual(['tsconfig.json', 'tsconfig.test.json'])

    // The original pain: types must be merged not replaced.
    const test = result.files.find((f) => f.filename === 'tsconfig.test.json')!
    expect(test.content.compilerOptions.types).toEqual(['node', 'vitest/globals'])
    // Paths from root user input propagate to both layers.
    expect(test.content.compilerOptions.paths).toEqual({ '@/*': ['./src/*'] })
    // Test layer's own include overrides app's include.
    expect(test.content.include).toEqual([
      '__tests__/**/*',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
    ])
  })
})
