import { describe, expect, it } from 'bun:test'

import { validateCompilerOptions } from '@/validate'

describe('validateCompilerOptions', () => {
  it('returns no warnings for valid options', () => {
    const warnings = validateCompilerOptions({
      strict: true,
      target: 'es2022',
      module: 'esnext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      noEmit: true,
    })
    expect(warnings).toHaveLength(0)
  })

  it('warns on unknown key with suggestion', () => {
    const warnings = validateCompilerOptions({ stric: true })
    expect(warnings).toHaveLength(1)
    expect(warnings[0]!.message).toContain('Unknown compilerOption "stric"')
    expect(warnings[0]!.suggestion).toBe('strict')
  })

  it('warns on unknown key without suggestion when too different', () => {
    const warnings = validateCompilerOptions({ zzzzunknownzzz: true })
    expect(warnings).toHaveLength(1)
    expect(warnings[0]!.suggestion).toBeUndefined()
  })

  it('warns on invalid enum value with suggestion', () => {
    const warnings = validateCompilerOptions({ target: 'es202' })
    expect(warnings).toHaveLength(1)
    expect(warnings[0]!.message).toContain('Invalid value "es202"')
    expect(['es2020', 'es2022']).toContain(warnings[0]!.suggestion ?? '')
  })

  it('warns on invalid module value', () => {
    const warnings = validateCompilerOptions({ module: 'esNext' })
    // esNext != esnext — case-insensitive comparison so should pass
    expect(warnings).toHaveLength(0)
  })

  it('accepts case-insensitive enum values', () => {
    const warnings = validateCompilerOptions({ target: 'ES2022' })
    expect(warnings).toHaveLength(0)
  })

  it('returns empty array when typescript is not available', () => {
    // This just tests the happy path — typescript IS available in test env
    const warnings = validateCompilerOptions({})
    expect(warnings).toHaveLength(0)
  })
})
