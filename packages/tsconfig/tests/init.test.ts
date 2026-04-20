import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { generate, parsePathsArg } from '../src/init'

function tmp() {
  return mkdtempSync(join(tmpdir(), 'tsconfig-gen-'))
}

function stripHeader(content: string): string {
  const idx = content.indexOf('{')
  return idx >= 0 ? content.slice(idx) : content
}

describe('parsePathsArg', () => {
  it('parses single alias', () => {
    expect(parsePathsArg('@/*=./src/*')).toEqual({ '@/*': ['./src/*'] })
  })
  it('parses multiple aliases', () => {
    expect(parsePathsArg('@/*=./src/*,@ui/*=../ui/src/*')).toEqual({
      '@/*': ['./src/*'],
      '@ui/*': ['../ui/src/*'],
    })
  })
  it('ignores malformed entries', () => {
    expect(parsePathsArg('@/*=./src/*,broken,@ok/*=./ok/*')).toEqual({
      '@/*': ['./src/*'],
      '@ok/*': ['./ok/*'],
    })
  })
  it('handles empty input', () => {
    expect(parsePathsArg('')).toEqual({})
  })
})

describe('generate', () => {
  it('writes tsconfig.json for a profile with no layers', async () => {
    const cwd = tmp()
    const result = await generate({ cwd, profile: 'nextjs', layers: [] })
    expect(result.written).toContain('tsconfig.json')
  })

  it('writes one file per layer', async () => {
    const cwd = tmp()
    const result = await generate({ cwd, profile: 'nextjs', layers: ['app', 'test'] })
    expect(result.written).toContain('tsconfig.json')
    expect(result.written).toContain('tsconfig.test.json')
  })

  it('merges types across layers correctly', async () => {
    const cwd = tmp()
    await generate({ cwd, profile: 'nextjs', layers: ['app', 'test'] })
    const testJson = JSON.parse(stripHeader(readFileSync(join(cwd, 'tsconfig.test.json'), 'utf8')))
    expect(testJson.compilerOptions.types).toEqual(['node', 'vitest/globals'])
  })

  it('injects paths into compilerOptions', async () => {
    const cwd = tmp()
    await generate({ cwd, profile: 'nextjs', layers: [], paths: { '@/*': ['./src/*'] } })
    const json = JSON.parse(stripHeader(readFileSync(join(cwd, 'tsconfig.json'), 'utf8')))
    expect(json.compilerOptions.paths).toEqual({ '@/*': ['./src/*'] })
  })

  it('rejects unknown profile', () => {
    expect(generate({ cwd: tmp(), profile: 'bogus', layers: [] })).rejects.toThrow(/Unknown profile/)
  })

  it('does not write files when content unchanged', async () => {
    const cwd = tmp()
    await generate({ cwd, profile: 'nextjs', layers: [] })
    const second = await generate({ cwd, profile: 'nextjs', layers: [] })
    expect(second.written).toHaveLength(0)
  })
})
