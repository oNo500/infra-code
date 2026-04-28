import { describe, expect, it } from 'bun:test'

import { render, screen } from '@testing-library/react'

import { App } from '@/app'

describe('<App />', () => {
  it('renders a greeting heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /base-bun web/i })).toBeDefined()
  })
})
