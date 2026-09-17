import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'

import { routes } from '@/app/routes'

let router: ReturnType<typeof createMemoryRouter>

function renderRoute(path = '/') {
  router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

afterEach(() => router?.dispose())

describe('application navigation', () => {
  it('navigates through the sidebar and updates the active link and breadcrumb', async () => {
    const user = userEvent.setup()
    renderRoute()

    const aboutLink = screen.getByRole('link', { name: 'About' })
    await user.click(aboutLink)

    expect(await screen.findByRole('heading', { name: 'About' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/about')
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
    expect(
      within(screen.getByRole('navigation', { name: 'breadcrumb' })).getByText('About'),
    ).toHaveAttribute('aria-current', 'page')
    expect(aboutLink).toHaveAttribute('aria-current', 'page')
  })

  it('opens a nested route directly and returns home', async () => {
    const user = userEvent.setup()
    renderRoute('/about')

    expect(await screen.findByRole('heading', { name: 'About' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Back to home' }))

    expect(await screen.findByRole('heading', { name: 'Get started' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('recovers from an unknown route using the 404 page link', async () => {
    const user = userEvent.setup()
    renderRoute('/missing')

    expect(await screen.findByRole('heading', { name: '404 — Page not found' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Back to home' }))

    expect(await screen.findByRole('heading', { name: 'Get started' })).toBeInTheDocument()
  })

  it('collapses the sidebar with its trigger and expands it with the keyboard shortcut', async () => {
    const user = userEvent.setup()
    const { container } = renderRoute()
    const sidebar = container.querySelector('[data-slot="sidebar"]')

    expect(sidebar).toHaveAttribute('data-state', 'expanded')
    await user.click(
      within(screen.getByRole('main')).getByRole('button', { name: 'Toggle Sidebar' }),
    )
    expect(sidebar).toHaveAttribute('data-state', 'collapsed')

    await user.keyboard('{Control>}b{/Control}')
    expect(sidebar).toHaveAttribute('data-state', 'expanded')
  })
})
