import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import { parsePathsArg, runInit } from '../src/init'
import { renderConfigTemplate } from '../src/template'

let tmp: string

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'tsconfig-init-'))
})

afterEach(() => {
  // mkdtemp creates a unique dir per test; leave them for OS to clean.
})

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

describe('renderConfigTemplate', () => {
  it('renders minimal single-layer config', () => {
    const src = renderConfigTemplate({ profileName: 'nextjs', layers: [] })
    expect(src).toContain(`import { defineTsconfig, nextjs } from '@infra-x/tsconfig'`)
    expect(src).toContain('profile: nextjs(),')
    expect(src).not.toContain('layers:')
  })

  it('renders layers block with test extending app', () => {
    const src = renderConfigTemplate({ profileName: 'nextjs', layers: ['app', 'test'] })
    expect(src).toContain('layers:')
    expect(src).toContain('app: {}')
    expect(src).toContain(`extends: 'app'`)
    expect(src).toContain(`types: ['vitest/globals']`)
  })

  it('renders paths block', () => {
    const src = renderConfigTemplate({
      profileName: 'nextjs',
      layers: [],
      paths: { '@/*': ['./src/*'] },
    })
    expect(src).toContain('paths:')
    expect(src).toContain(`'@/*': ["./src/*"]`)
  })
})

describe('runInit', () => {
  it('creates config + tsconfig files in a fresh directory', async () => {
    const result = await runInit({
      cwd: tmp,
      profile: 'nextjs',
      layers: ['app', 'test'],
      paths: { '@/*': ['./src/*'] },
    })

    expect(result.configFile).toBe('tsconfig.config.ts')
    expect(result.generatedFiles).toContain('tsconfig.json')
    expect(result.generatedFiles).toContain('tsconfig.test.json')

    const configSrc = readFileSync(join(tmp, 'tsconfig.config.ts'), 'utf8')
    expect(configSrc).toContain(`from '@infra-x/tsconfig'`)
    expect(configSrc).toContain('nextjs()')

    const testJson = JSON.parse(stripHeader(readFileSync(join(tmp, 'tsconfig.test.json'), 'utf8')))
    expect(testJson.compilerOptions.types).toEqual(['node', 'vitest/globals'])
  })

  it('refuses to overwrite unless --force', async () => {
    await runInit({ cwd: tmp, profile: 'nextjs', layers: [] })
    expect(runInit({ cwd: tmp, profile: 'nextjs', layers: [] })).rejects.toThrow(
      /already exists/,
    )
  })

  it('overwrites with force=true', async () => {
    await runInit({ cwd: tmp, profile: 'nextjs', layers: [] })
    await runInit({ cwd: tmp, profile: 'nextjs', layers: ['app'], force: true })
    const src = readFileSync(join(tmp, 'tsconfig.config.ts'), 'utf8')
    expect(src).toContain('layers:')
  })

  it('rejects unknown profile', () => {
    expect(runInit({ cwd: tmp, profile: 'bogus', layers: [] })).rejects.toThrow(
      /Unknown profile/,
    )
  })
})

function stripHeader(content: string): string {
  const idx = content.indexOf('{')
  return idx >= 0 ? content.slice(idx) : content
}
