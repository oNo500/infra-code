import { describe, expect, it } from 'bun:test'

import { defineTsconfig } from '../src/define'
import { nextjs } from '../src/profiles/nextjs'

describe('defineTsconfig', () => {
  it('produces a single tsconfig.json when no layers', () => {
    const result = defineTsconfig({
      profile: nextjs(),
      compilerOptions: { paths: { '@/*': ['./src/*'] } },
    })
    expect(result.files).toHaveLength(1)
    expect(result.files[0]!.filename).toBe('tsconfig.json')
    expect(result.files[0]!.content.compilerOptions.strict).toBe(true)
    expect(result.files[0]!.content.compilerOptions.paths).toEqual({
      '@/*': ['./src/*'],
    })
  })

  it('produces one file per layer, with primary as tsconfig.json', () => {
    const result = defineTsconfig({
      profile: nextjs(),
      layers: {
        app: { include: ['src/**/*'] },
        test: {
          extends: 'app',
          compilerOptions: { types: ['vitest/globals'] },
          include: ['**/*.test.ts'],
        },
      },
    })
    expect(result.files.map((f) => f.filename)).toEqual(['tsconfig.json', 'tsconfig.test.json'])
  })

  it('layer types is appended to profile types (the original pain point)', () => {
    const result = defineTsconfig({
      profile: nextjs(),
      layers: {
        app: {},
        test: {
          extends: 'app',
          compilerOptions: { types: ['vitest/globals'] },
        },
      },
    })
    const testFile = result.files.find((f) => f.filename === 'tsconfig.test.json')!
    expect(testFile.content.compilerOptions.types).toEqual(['node', 'vitest/globals'])
  })

  it('honors explicit primary layer', () => {
    const result = defineTsconfig({
      profile: nextjs(),
      primary: 'build',
      layers: {
        build: { include: ['src/**/*'] },
        test: { include: ['**/*.test.ts'] },
      },
    })
    expect(result.files.map((f) => f.filename).toSorted()).toEqual(
      ['tsconfig.json', 'tsconfig.test.json'].toSorted(),
    )
  })

  it('detects circular layer extends', () => {
    expect(() =>
      defineTsconfig({
        profile: nextjs(),
        layers: {
          a: { extends: 'b' },
          b: { extends: 'a' },
        },
      }),
    ).toThrow(/Circular/)
  })

  it('auto-excludes tsconfig.config.* without user effort', () => {
    const result = defineTsconfig({
      profile: nextjs(),
      exclude: ['node_modules'],
    })
    expect(result.files[0]!.content.exclude).toContain('tsconfig.config.ts')
    expect(result.files[0]!.content.exclude).toContain('node_modules')
  })

  it('does not duplicate tsconfig.config.ts if user already excluded it', () => {
    const result = defineTsconfig({
      profile: nextjs(),
      exclude: ['node_modules', 'tsconfig.config.ts'],
    })
    const excludes = result.files[0]!.content.exclude
    const tsCount = excludes?.filter((x) => x === 'tsconfig.config.ts').length ?? 0
    expect(tsCount).toBe(1)
  })

  it('allows layers without a profile', () => {
    const result = defineTsconfig({
      compilerOptions: { strict: true },
      layers: {
        app: { include: ['src/**/*'] },
      },
    })
    expect(result.files[0]!.content.compilerOptions.strict).toBe(true)
  })
})
