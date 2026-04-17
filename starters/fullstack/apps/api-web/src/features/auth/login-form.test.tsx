import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const { mockSignInEmail, mockSignInSocial } = vi.hoisted(() => ({
  mockSignInEmail: vi.fn(),
  mockSignInSocial: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/config/env', () => ({
  env: { NEXT_PUBLIC_APP_NAME: 'Test App' },
}))

vi.mock('@/config/app-paths', () => ({
  appPaths: {
    home: { href: '/' },
    auth: {
      signup: { getHref: () => '/signup' },
      login: { getHref: () => '/login' },
    },
    legal: {
      terms: { href: '/terms' },
      privacy: { href: '/privacy' },
    },
  },
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: mockSignInEmail,
      social: mockSignInSocial,
    },
  },
}))

import { LoginForm } from './login-form'

describe('loginForm', () => {
  it('renders email, password inputs and submit button', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('shows error message when login fails', async () => {
    mockSignInEmail.mockResolvedValue({ error: { message: 'Invalid credentials' } })
    render(<LoginForm />)

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /login/i }))

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
  })

  it('shows fallback error when message is missing', async () => {
    mockSignInEmail.mockResolvedValue({ error: {} })
    render(<LoginForm />)

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /login/i }))

    expect(await screen.findByText('Login failed')).toBeInTheDocument()
  })

  it('disables submit button while submitting', async () => {
    mockSignInEmail.mockReturnValue(new Promise(() => {}))
    render(<LoginForm />)

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'pass')
    await userEvent.click(screen.getByRole('button', { name: /login/i }))

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('shows Redirecting... and disables GitHub button after click', async () => {
    mockSignInSocial.mockReturnValue(new Promise(() => {}))
    render(<LoginForm />)

    await userEvent.click(screen.getByRole('button', { name: /continue with github/i }))

    expect(screen.getByRole('button', { name: /redirecting/i })).toBeDisabled()
  })
})
