import { describe, expect, it } from 'bun:test'

import { greet } from '@/commands/greet'

describe('greet command', () => {
  it('returns a greeting with the given name', () => {
    expect(greet({ name: 'world' })).toBe('Hello, world!')
  })

  it('defaults to "world" when no name is given', () => {
    expect(greet({})).toBe('Hello, world!')
  })

  it('respects a custom greeting prefix', () => {
    expect(greet({ name: 'Bun', greeting: 'Hi' })).toBe('Hi, Bun!')
  })
})
