import { describe, expect, it } from 'bun:test'

import { mergeCompilerOptions } from '../src/merge'

describe('mergeCompilerOptions', () => {
  it('merges scalar fields with user override winning', () => {
    const result = mergeCompilerOptions({ strict: true }, { strict: false })
    expect(result.strict).toBe(false)
  })

  it('appends and dedupes string arrays by default', () => {
    const result = mergeCompilerOptions({ types: ['node'] }, { types: ['vitest/globals', 'node'] })
    expect(result.types).toEqual(['node', 'vitest/globals'])
  })

  it('deep-merges paths', () => {
    const result = mergeCompilerOptions(
      { paths: { '@/*': ['./src/*'] } },
      { paths: { '@ui/*': ['./ui/*'] } },
    )
    expect(result.paths).toEqual({
      '@/*': ['./src/*'],
      '@ui/*': ['./ui/*'],
    })
  })

  it('$set replaces entirely', () => {
    const result = mergeCompilerOptions(
      { types: ['node', 'react'] },
      { types: { $set: ['vitest/globals'] } },
    )
    expect(result.types).toEqual(['vitest/globals'])
  })

  it('$remove drops specific items', () => {
    const result = mergeCompilerOptions(
      { lib: ['esnext', 'DOM', 'DOM.Iterable'] },
      { lib: { $remove: ['DOM', 'DOM.Iterable'] } },
    )
    expect(result.lib).toEqual(['esnext'])
  })

  it('$prepend inserts at head', () => {
    const result = mergeCompilerOptions(
      { plugins: [{ name: 'next' }] },
      { plugins: { $prepend: [{ name: 'foo' }] } },
    )
    expect(result.plugins).toEqual([{ name: 'foo' }, { name: 'next' }])
  })

  it('handles empty base with user input only', () => {
    const result = mergeCompilerOptions(undefined, { types: ['node'] })
    expect(result.types).toEqual(['node'])
  })

  it('handles empty user input with base only', () => {
    const result = mergeCompilerOptions({ types: ['node'] }, undefined)
    expect(result.types).toEqual(['node'])
  })

  it('dedupes object arrays by deep equality', () => {
    const result = mergeCompilerOptions(
      { plugins: [{ name: 'next' }] },
      { plugins: [{ name: 'next' }, { name: 'graphql' }] },
    )
    expect(result.plugins).toEqual([{ name: 'next' }, { name: 'graphql' }])
  })
})
