import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

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
    const src = renderConfigTemplate({ profileFnName: 'nextjs', layers: [] })
    expect(src).toContain(`import { nextjs } from '@infra-x/tsconfig'`)
    expect(src).toContain(`import type { DefineTsconfigInput } from '@infra-x/tsconfig'`)
    expect(src).toContain('profile: nextjs(),')
    expect(src).toContain('satisfies DefineTsconfigInput')
    expect(src).not.toContain('layers:')
  })

  it('renders layers block with test extending app', () => {
    const src = renderConfigTemplate({ profileFnName: 'nextjs', layers: ['app', 'test'] })
    expect(src).toContain('layers:')
    expect(src).toContain('app: {}')
    expect(src).toContain(`extends: 'app'`)
    expect(src).toContain(`types: ['vitest/globals']`)
  })

  it('renders paths block', () => {
    const src = renderConfigTemplate({
      profileFnName: 'nextjs',
      layers: [],
      paths: { '@/*': ['./src/*'] },
    })
    expect(src).toContain('paths:')
    expect(src).toContain(`'@/*': ["./src/*"]`)
  })

  it('generates build layer that excludes test files', () => {
    const src = renderConfigTemplate({
      profileFnName: 'nextjs',
      layers: ['app', 'test', 'build'],
    })
    expect(src).toContain('build: {')
    expect(src).toContain(`exclude: ['**/*.test.ts', '**/*.test.tsx', '__tests__/**']`)
  })

  it('generates ci layer with sourceMap + declarationMap', () => {
    const src = renderConfigTemplate({
      profileFnName: 'nextjs',
      layers: ['app', 'ci'],
    })
    expect(src).toContain('ci: {')
    expect(src).toContain('declarationMap: true')
    expect(src).toContain('sourceMap: true')
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
    expect(configSrc).toContain('satisfies DefineTsconfigInput')

    const testJson = JSON.parse(stripHeader(readFileSync(join(tmp, 'tsconfig.test.json'), 'utf8')))
    expect(testJson.compilerOptions.types).toEqual(['node', 'vitest/globals'])
  })

  it('refuses to overwrite unless --force', async () => {
    await runInit({ cwd: tmp, profile: 'nextjs', layers: [] })
    expect(runInit({ cwd: tmp, profile: 'nextjs', layers: [] })).rejects.toThrow(/already exists/)
  })

  it('overwrites with force=true', async () => {
    await runInit({ cwd: tmp, profile: 'nextjs', layers: [] })
    await runInit({ cwd: tmp, profile: 'nextjs', layers: ['app'], force: true })
    const src = readFileSync(join(tmp, 'tsconfig.config.ts'), 'utf8')
    expect(src).toContain('layers:')
  })

  it('rejects unknown profile', () => {
    expect(runInit({ cwd: tmp, profile: 'bogus', layers: [] })).rejects.toThrow(/Unknown profile/)
  })

  it('once mode skips tsconfig.config.ts', async () => {
    const result = await runInit({
      cwd: tmp,
      profile: 'nextjs',
      layers: ['app', 'test'],
      once: true,
    })
    expect(result.configFile).toBeNull()
    expect(result.generatedFiles).toContain('tsconfig.json')
    expect(result.generatedFiles).toContain('tsconfig.test.json')

    // Verify tsconfig.config.ts was NOT created.
    expect(existsSync(join(tmp, 'tsconfig.config.ts'))).toBe(false)
  })

  it('once mode works even when tsconfig.config.ts exists (does not touch it)', async () => {
    writeFileSync(join(tmp, 'tsconfig.config.ts'), '// my custom DSL')
    await runInit({
      cwd: tmp,
      profile: 'nextjs',
      layers: [],
      once: true,
    })
    // DSL file untouched.
    expect(readFileSync(join(tmp, 'tsconfig.config.ts'), 'utf8')).toBe('// my custom DSL')
  })

  it('skipJson writes DSL only, no tsconfig.*.json', async () => {
    const result = await runInit({
      cwd: tmp,
      profile: 'nextjs',
      layers: ['app', 'test'],
      skipJson: true,
    })
    expect(result.configFile).toBe('tsconfig.config.ts')
    expect(result.generatedFiles).toEqual([])

    expect(existsSync(join(tmp, 'tsconfig.config.ts'))).toBe(true)
    expect(existsSync(join(tmp, 'tsconfig.json'))).toBe(false)
    expect(existsSync(join(tmp, 'tsconfig.test.json'))).toBe(false)
  })

  it('rejects once + skipJson combo (nothing to write)', () => {
    expect(
      runInit({ cwd: tmp, profile: 'nextjs', layers: [], once: true, skipJson: true }),
    ).rejects.toThrow(/nothing would be written/)
  })
})

function stripHeader(content: string): string {
  const idx = content.indexOf('{')
  return idx >= 0 ? content.slice(idx) : content
}
