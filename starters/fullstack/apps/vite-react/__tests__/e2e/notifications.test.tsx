import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { toast } from 'sonner'
import { afterEach, describe, expect, it } from 'vitest'

import { AppProvider } from '@/app/providers'
import { routes } from '@/app/routes'

let router: ReturnType<typeof createMemoryRouter>

afterEach(() => {
  toast.dismiss()
  router?.dispose()
})

describe('application notifications', () => {
  it('shows and dismisses a notification from the home page', async () => {
    const user = userEvent.setup()
    router = createMemoryRouter(routes)
    render(
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Show notification' }))
    expect(await screen.findByText('Notifications are ready')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close toast' }))
    await screen.findByRole('button', { name: 'Show notification' })
    // Sonner animates a dismissed toast before removing it from the DOM.
    await waitFor(() =>
      expect(screen.queryByText('Notifications are ready')).not.toBeInTheDocument(),
    )
  })
})
