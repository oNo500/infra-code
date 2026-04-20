import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { generate, parsePathsArg } from '../src/generate'

import type { GenOptions } from '../src/generate'

function tmp() {
  return mkdtempSync(join(tmpdir(), 'tsconfig-gen-'))
}

function readJson(cwd: string, name: string): Record<string, unknown> {
  const raw = readFileSync(join(cwd, name), 'utf8')
  const idx = raw.indexOf('{')
  return JSON.parse(idx >= 0 ? raw.slice(idx) : raw) as Record<string, unknown>
}

const base: GenOptions = {
  cwd: '',
  runtimes: ['node'],
  module: 'bundler',
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
  it('writes tsconfig.json for node+bundler', async () => {
    const cwd = tmp()
    const result = await generate({ ...base, cwd })
    expect(result.written).toContain('tsconfig.json')
  })

  it('includes node types for node runtime', async () => {
    const cwd = tmp()
    await generate({ ...base, cwd })
    const json = readJson(cwd, 'tsconfig.json')
    const opts = json['compilerOptions'] as Record<string, unknown>
    expect(opts['types']).toContain('node')
  })

  it('includes bun types for bun runtime', async () => {
    const cwd = tmp()
    await generate({ ...base, cwd, runtimes: ['bun'] })
    const json = readJson(cwd, 'tsconfig.json')
    const opts = json['compilerOptions'] as Record<string, unknown>
    expect(opts['types']).toContain('bun')
  })

  it('merges node+browser runtimes (universal)', async () => {
    const cwd = tmp()
    await generate({ ...base, cwd, runtimes: ['node', 'browser'] })
    const json = readJson(cwd, 'tsconfig.json')
    const opts = json['compilerOptions'] as Record<string, unknown>
    expect(opts['types']).toContain('node')
    expect((opts['lib'] as string[]).some((l) => l.toLowerCase().includes('dom'))).toBe(true)
  })

  it('sets jsx for react framework', async () => {
    const cwd = tmp()
    await generate({ ...base, cwd, framework: 'react' })
    const json = readJson(cwd, 'tsconfig.json')
    const opts = json['compilerOptions'] as Record<string, unknown>
    expect(opts['jsx']).toBe('react-jsx')
  })

  it('enables decorators for nestjs framework', async () => {
    const cwd = tmp()
    await generate({ ...base, cwd, framework: 'nestjs', module: 'nodenext' })
    const json = readJson(cwd, 'tsconfig.json')
    const opts = json['compilerOptions'] as Record<string, unknown>
    expect(opts['experimentalDecorators']).toBe(true)
    expect(opts['emitDecoratorMetadata']).toBe(true)
  })

  it('sets nodenext module resolution when module=nodenext', async () => {
    const cwd = tmp()
    await generate({ ...base, cwd, module: 'nodenext' })
    const json = readJson(cwd, 'tsconfig.json')
    const opts = json['compilerOptions'] as Record<string, unknown>
    expect(opts['module']).toBe('nodenext')
    expect(opts['moduleResolution']).toBe('nodenext')
  })

  it('enables isolatedDeclarations for lib mode', async () => {
    const cwd = tmp()
    await generate({ ...base, cwd, lib: true })
    const json = readJson(cwd, 'tsconfig.json')
    const opts = json['compilerOptions'] as Record<string, unknown>
    expect(opts['isolatedDeclarations']).toBe(true)
    // declaration is owned by buildTscEmit, not projectLib — bundler handles .d.ts via its own dts option
    expect(opts['declaration']).toBeUndefined()
  })

  it('writes one extra file per view', async () => {
    const cwd = tmp()
    const result = await generate({
      ...base,
      cwd,
      views: [{ name: 'test', types: ['vitest/globals'], include: ['**/*.test.ts'] }],
    })
    expect(result.written).toContain('tsconfig.json')
    expect(result.written).toContain('tsconfig.test.json')
  })

  it('view file has correct types merged', async () => {
    const cwd = tmp()
    await generate({
      ...base,
      cwd,
      runtimes: ['node'],
      views: [{ name: 'test', types: ['vitest/globals'], include: ['**/*.test.ts'] }],
    })
    const json = readJson(cwd, 'tsconfig.test.json')
    const opts = json['compilerOptions'] as Record<string, unknown>
    expect(opts['types']).toContain('node')
    expect(opts['types']).toContain('vitest/globals')
  })

  it('injects paths into compilerOptions', async () => {
    const cwd = tmp()
    await generate({ ...base, cwd, paths: { '@/*': ['./src/*'] } })
    const json = readJson(cwd, 'tsconfig.json')
    const opts = json['compilerOptions'] as Record<string, unknown>
    expect(opts['paths']).toEqual({ '@/*': ['./src/*'] })
  })

  it('does not write files when content unchanged', async () => {
    const cwd = tmp()
    await generate({ ...base, cwd })
    const second = await generate({ ...base, cwd })
    expect(second.written).toHaveLength(0)
  })
})
