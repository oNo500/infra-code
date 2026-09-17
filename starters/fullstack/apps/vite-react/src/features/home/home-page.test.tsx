import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import HomePage from '@/features/home/home-page'

describe('home page', () => {
  it('increments the counter through the shared UI button', async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    await user.click(screen.getByRole('button', { name: 'Count is 0' }))
    await user.click(screen.getByRole('button', { name: 'Count is 1' }))

    expect(screen.getByRole('button', { name: 'Count is 2' })).toBeInTheDocument()
  })
})
