import { describe, expect, it } from 'bun:test'

import { PROFILES } from '../src/profiles/registry'

/**
 * Smoke tests for every profile: compose without error, produce a sane
 * compilerOptions with at least the canonical atoms applied.
 */
describe('all profiles', () => {
  for (const descriptor of PROFILES) {
    describe(descriptor.name, () => {
      const result = descriptor.factory()

      it('has a matching label and base flags', () => {
        expect(result.label).toBe(descriptor.name)
        const co = result.compilerOptions
        expect(co.strict).toBe(true)
        expect(co.target).toBe('esnext')
        expect(co['noUncheckedIndexedAccess']).toBe(true)
      })

      it('has a runtime lib', () => {
        const co = result.compilerOptions
        expect(Array.isArray(co.lib)).toBe(true)
        expect(co.lib).not.toEqual([])
      })

      it('has include/exclude defaults', () => {
        expect(result.include).toBeTruthy()
        expect(result.exclude).toContain('node_modules')
      })
    })
  }
})

describe('profile specifics', () => {
  it('nextjs injects the next plugin and jsx preserve', () => {
    const result = PROFILES.find((p) => p.name === 'nextjs')!.factory()
    expect(result.compilerOptions.jsx).toBe('preserve')
    expect(result.compilerOptions.plugins).toEqual([{ name: 'next' }])
    expect(result.compilerOptions['allowImportingTsExtensions']).toBe(true)
  })

  it('vite-react uses react-jsx and no node types', () => {
    const result = PROFILES.find((p) => p.name === 'vite-react')!.factory()
    expect(result.compilerOptions.jsx).toBe('react-jsx')
    expect(result.compilerOptions.types).toEqual([])
    expect(result.compilerOptions.lib).toContain('DOM')
  })

  it('lib-node enables declaration emission', () => {
    const result = PROFILES.find((p) => p.name === 'lib-node')!.factory()
    expect(result.compilerOptions.declaration).toBe(true)
    expect(result.compilerOptions.isolatedDeclarations).toBe(true)
    expect(result.compilerOptions.types).toEqual(['node'])
  })

  it('lib-react composes project-lib + framework-react', () => {
    const result = PROFILES.find((p) => p.name === 'lib-react')!.factory()
    expect(result.compilerOptions.declaration).toBe(true)
    expect(result.compilerOptions.jsx).toBe('react-jsx')
    expect(result.compilerOptions.lib).toContain('DOM')
  })

  it('app-bun uses bun types', () => {
    const result = PROFILES.find((p) => p.name === 'app-bun')!.factory()
    expect(result.compilerOptions.types).toEqual(['bun'])
  })

  it('app-nestjs enables decorator metadata', () => {
    const result = PROFILES.find((p) => p.name === 'app-nestjs')!.factory()
    expect(result.compilerOptions['experimentalDecorators']).toBe(true)
    expect(result.compilerOptions['emitDecoratorMetadata']).toBe(true)
    expect(result.compilerOptions['strictPropertyInitialization']).toBe(false)
  })
})
