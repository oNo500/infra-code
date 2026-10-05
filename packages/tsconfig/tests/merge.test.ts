import { describe, expect, it } from 'bun:test'

import { mergeCompilerOptions, normalizeCompilerOptions } from '@/merge'

import type { CompilerOptions } from '@/types'

describe('mergeCompilerOptions', () => {
  it('scalar: user wins', () => {
    expect(mergeCompilerOptions({ strict: true }, { strict: false }).strict).toBe(false)
  })

  it('array shorthand: appends and dedupes', () => {
    const r = mergeCompilerOptions({ types: ['node'] }, { types: ['vitest/globals', 'node'] })
    expect(r.types).toEqual(['node', 'vitest/globals'])
  })

  it("array shorthand 'none': clears to []", () => {
    const r = mergeCompilerOptions({ types: ['node'] }, { types: 'none' })
    expect(r.types).toEqual([])
  })

  it('ArrayControl append: same as shorthand', () => {
    const r = mergeCompilerOptions(
      { types: ['node'] },
      { types: { merge: 'append', value: ['vitest/globals'] } },
    )
    expect(r.types).toEqual(['node', 'vitest/globals'])
  })

  it('ArrayControl replace: replaces entirely', () => {
    const r = mergeCompilerOptions(
      { types: ['node', 'react'] },
      { types: { merge: 'replace', value: ['vitest/globals'] } },
    )
    expect(r.types).toEqual(['vitest/globals'])
  })

  it('ArrayControl none: clears to []', () => {
    const r = mergeCompilerOptions({ types: ['node'] }, { types: { merge: 'none' } })
    expect(r.types).toEqual([])
  })

  it('paths: deep-merges', () => {
    const r = mergeCompilerOptions(
      { paths: { '@/*': ['./src/*'] } },
      { paths: { '@ui/*': ['./ui/*'] } },
    )
    expect(r.paths).toEqual({ '@/*': ['./src/*'], '@ui/*': ['./ui/*'] })
  })

  it('lib: append dedupes', () => {
    const r = mergeCompilerOptions({ lib: ['esnext', 'DOM'] }, { lib: ['DOM', 'DOM.Iterable'] })
    expect(r.lib).toEqual(['esnext', 'DOM', 'DOM.Iterable'])
  })

  it('plugins: append dedupes by deep equality', () => {
    const r = mergeCompilerOptions(
      { plugins: [{ name: 'next' }] },
      { plugins: [{ name: 'next' }, { name: 'graphql' }] },
    )
    expect(r.plugins).toEqual([{ name: 'next' }, { name: 'graphql' }])
  })

  it('handles undefined base', () => {
    expect(mergeCompilerOptions(undefined, { types: ['node'] }).types).toEqual(['node'])
  })

  it('handles undefined over', () => {
    expect(mergeCompilerOptions({ types: ['node'] }, undefined).types).toEqual(['node'])
  })

  it('handles both undefined', () => {
    expect(mergeCompilerOptions(undefined, undefined)).toEqual({})
  })

  it('ArrayControl append with no value: appends nothing', () => {
    const r = mergeCompilerOptions({ types: ['node'] }, { types: { merge: 'append' } })
    expect(r.types).toEqual(['node'])
  })
})

describe('normalizeCompilerOptions', () => {
  it.each<CompilerOptions>([
    { types: [] },
    { types: 'none' },
    { types: { merge: 'none' } },
    { types: { merge: 'replace', value: [] } },
  ])('preserves explicit empty types instead of restoring implicit global types: %j', (opts) => {
    expect(normalizeCompilerOptions(opts)).toEqual({ types: [] })
  })

  it('does not introduce a types restriction when the caller omitted it', () => {
    expect(normalizeCompilerOptions({ strict: true })).toEqual({ strict: true })
  })

  it('preserves explicit clearing after merging a Node configuration', () => {
    const opts = mergeCompilerOptions({ types: ['node'] }, { types: 'none' })
    expect(normalizeCompilerOptions(opts)).toEqual({ types: [] })
  })
})
