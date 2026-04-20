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

describe('renderConfig', () => {
  it('produces a single tsconfig.json when no views', () => {
    const result = renderConfig({ compilerOptions: nextjsOptions })
    expect(result.files).toHaveLength(1)
    expect(result.files[0]!.filename).toBe('tsconfig.json')
    expect(result.files[0]!.content.compilerOptions.strict).toBe(true)
  })

  it('applies extra compilerOptions on top of atoms', () => {
    const result = renderConfig({
      compilerOptions: { ...nextjsOptions, paths: { '@/*': ['./src/*'] } },
    })
    expect(result.files[0]!.content.compilerOptions.paths).toEqual({ '@/*': ['./src/*'] })
  })

  it('produces primary + one file per view', () => {
    const result = renderConfig({
      compilerOptions: nextjsOptions,
      views: [
        { name: 'test', compilerOptions: { types: ['vitest/globals'] }, include: ['**/*.test.ts'] },
      ],
    })
    expect(result.files.map((f) => f.filename)).toEqual(['tsconfig.json', 'tsconfig.test.json'])
  })

  it('view types are appended to primary types (the original pain point)', () => {
    const result = renderConfig({
      compilerOptions: nextjsOptions,
      views: [{ name: 'test', compilerOptions: { types: ['vitest/globals'] } }],
    })
    const testFile = result.files.find((f) => f.filename === 'tsconfig.test.json')!
    expect(testFile.content.compilerOptions.types).toContain('node')
    expect(testFile.content.compilerOptions.types).toContain('vitest/globals')
  })

  it('view inherits include from primary when not specified', () => {
    const result = renderConfig({
      compilerOptions: nextjsOptions,
      include: ['src/**/*'],
      views: [{ name: 'test' }],
    })
    const testFile = result.files.find((f) => f.filename === 'tsconfig.test.json')!
    expect(testFile.content.include).toEqual(['src/**/*'])
  })

  it('view include overrides primary include', () => {
    const result = renderConfig({
      compilerOptions: nextjsOptions,
      include: ['src/**/*'],
      views: [{ name: 'test', include: ['**/*.test.ts'] }],
    })
    const testFile = result.files.find((f) => f.filename === 'tsconfig.test.json')!
    expect(testFile.content.include).toEqual(['**/*.test.ts'])
  })

  it('references only appear on primary file', () => {
    const result = renderConfig({
      compilerOptions: nextjsOptions,
      references: [{ path: '../shared' }],
      views: [{ name: 'test' }],
    })
    expect(result.files.find((f) => f.filename === 'tsconfig.json')!.content.references).toEqual([
      { path: '../shared' },
    ])
    expect(
      result.files.find((f) => f.filename === 'tsconfig.test.json')!.content.references,
    ).toBeUndefined()
  })
})
