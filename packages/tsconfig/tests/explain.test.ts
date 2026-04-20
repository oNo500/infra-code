import { describe, expect, it } from 'bun:test'

import { explainTsconfig, renderExplain } from '../src/explain'
import { nextjs } from '../src/profiles/nextjs'

describe('explainTsconfig', () => {
  it('attributes scalar fields to their origin', () => {
    const result = explainTsconfig({
      profile: nextjs(),
      compilerOptions: { strict: false },
    })
    const strict = result.layers[0]!.compilerOptions['strict']!
    expect(strict.value).toBe(false)
    expect(strict.sources.map((s) => s.kind)).toEqual(['profile', 'root'])
  })

  it('tracks array item origins', () => {
    const result = explainTsconfig({
      profile: nextjs(),
      layers: {
        app: {},
        test: {
          extends: 'app',
          compilerOptions: { types: ['vitest/globals'] },
        },
      },
    })
    const testLayer = result.layers.find((l) => l.layerName === 'test')!
    const types = testLayer.compilerOptions['types']!
    expect(types.value).toEqual(['node', 'vitest/globals'])
    expect(types.itemSources).toEqual([
      { item: 'node', source: { kind: 'profile', name: 'nextjs' } },
      { item: 'vitest/globals', source: { kind: 'layer', name: 'test' } },
    ])
  })

  it('tracks merges separately', () => {
    const result = explainTsconfig({
      profile: nextjs(),
      compilerOptions: {
        lib: { merge: 'replace', value: ['esnext', 'DOM.Iterable'] },
      },
    })
    const lib = result.layers[0]!.compilerOptions['lib']!
    expect(lib.value).toEqual(['esnext', 'DOM.Iterable'])
  })
})

describe('renderExplain', () => {
  it('produces text output with source labels', () => {
    const explained = explainTsconfig({
      profile: nextjs(),
      compilerOptions: { paths: { '@/*': ['./src/*'] } },
    })
    const text = renderExplain(explained, { format: 'text' })
    expect(text).toContain('profile:nextjs')
    expect(text).toContain('root:root')
    expect(text).toContain('paths:')
  })

  it('filters by field name', () => {
    const explained = explainTsconfig({
      profile: nextjs(),
      compilerOptions: { paths: { '@/*': ['./src/*'] } },
    })
    const text = renderExplain(explained, { format: 'text', field: 'paths' })
    expect(text).toContain('paths')
    expect(text).not.toContain('strict:')
    expect(text).not.toContain('target:')
  })

  it('produces valid JSON output', () => {
    const explained = explainTsconfig({
      profile: nextjs(),
      compilerOptions: { paths: { '@/*': ['./src/*'] } },
    })
    const json = renderExplain(explained, { format: 'json' })
    const parsed = JSON.parse(json)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed[0].filename).toBe('tsconfig.json')
    expect(parsed[0].compilerOptions.paths.value).toEqual({ '@/*': ['./src/*'] })
  })

  it('shows hypothetical removals', () => {
    const explained = explainTsconfig({
      profile: nextjs(),
      layers: {
        app: {},
        test: {
          extends: 'app',
          compilerOptions: { types: ['vitest/globals'] },
        },
      },
    })
    const text = renderExplain(explained, {
      format: 'text',
      layer: 'test',
      field: 'types',
      hypothetical: true,
    })
    expect(text).toContain('if without layer:test')
  })

  it('throws on unknown layer', () => {
    const explained = explainTsconfig({
      profile: nextjs(),
      layers: { app: {} },
    })
    expect(() => renderExplain(explained, { layer: 'does-not-exist' })).toThrow(/not found/)
  })
})
