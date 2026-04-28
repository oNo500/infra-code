import { describe, expect, it } from 'bun:test'

import { parseEnv } from '@/env'

describe('parseEnv', () => {
  it('coerces PORT to a number and defaults to 3000', () => {
    expect(parseEnv({ DATABASE_URL: './x.sqlite' }).PORT).toBe(3000)
    expect(parseEnv({ DATABASE_URL: './x.sqlite', PORT: '8080' }).PORT).toBe(8080)
  })

  it('requires DATABASE_URL', () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/)
  })

  it('rejects non-numeric PORT', () => {
    expect(() => parseEnv({ DATABASE_URL: './x.sqlite', PORT: 'abc' })).toThrow()
  })
})
