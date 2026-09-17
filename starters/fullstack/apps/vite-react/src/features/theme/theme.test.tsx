import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { ThemeProvider } from './theme-provider'
import { ThemeToggle } from './theme-toggle'

function renderTheme() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
      <input aria-label="Name" />
      <div contentEditable aria-label="Editor">
        <span>Editable text</span>
      </div>
    </ThemeProvider>,
  )
}

describe('theme controls', () => {
  it('switches the theme and restores the saved choice after remounting', async () => {
    const user = userEvent.setup()
    const view = renderTheme()
    await user.click(screen.getByRole('button', { name: 'Toggle theme' }))
    await waitFor(() => expect(document.documentElement).toHaveClass('dark'))
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    view.unmount()
    renderTheme()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Toggle theme' })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    )
    await user.click(screen.getByRole('button', { name: 'Toggle theme' }))
    await waitFor(() => expect(document.documentElement).toHaveClass('light'))
  })

  it('toggles with D but ignores typing, modified keys, repeats and composition', async () => {
    const user = userEvent.setup()
    renderTheme()
    await user.keyboard('d')
    await waitFor(() => expect(document.documentElement).toHaveClass('dark'))

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'd')
    fireEvent.keyDown(screen.getByText('Editable text'), { key: 'd' })
    fireEvent.keyDown(window, { key: 'd', ctrlKey: true })
    fireEvent.keyDown(window, { key: 'd', repeat: true })
    fireEvent.keyDown(window, { key: 'd', isComposing: true })
    expect(document.documentElement).toHaveClass('dark')

    fireEvent.keyDown(window, { key: 'D' })
    await waitFor(() => expect(document.documentElement).toHaveClass('light'))
  })
})
