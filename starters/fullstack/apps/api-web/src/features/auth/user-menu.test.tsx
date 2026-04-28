import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { UserMenu } from './user-menu'

const mockPush = vi.hoisted(() => vi.fn())
const { mockUseSession, mockSignOut } = vi.hoisted(() => ({
  mockUseSession: vi.fn(),
  mockSignOut: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/config/app-paths', () => ({
  appPaths: {
    auth: {
      login: { getHref: () => '/login' },
    },
  },
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: mockUseSession,
    signOut: mockSignOut,
  },
}))

const fakeSession = {
  user: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    image: null,
  },
}

describe('userMenu — desktop', () => {
  it('renders skeleton while pending', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: true })
    const { container } = render(<UserMenu variant="desktop" />)
    expect(container.firstChild).toBeInTheDocument()
    // skeleton has no text content
    expect(container.textContent).toBe('')
  })

  it('renders login button when not authenticated', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false })
    render(<UserMenu variant="desktop" />)
    const loginBtn = screen.getByRole('button', { name: /login/i })
    expect(loginBtn).toBeInTheDocument()
    expect(loginBtn).toHaveAttribute('href', '/login')
  })

  it('renders user name and email when authenticated', async () => {
    mockUseSession.mockReturnValue({ data: fakeSession, isPending: false })
    render(<UserMenu variant="desktop" />)
    // open the dropdown to reveal content
    await userEvent.click(screen.getByRole('button', { name: /user menu/i }))
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('calls signOut and redirects to login on sign out', async () => {
    mockUseSession.mockReturnValue({ data: fakeSession, isPending: false })
    mockSignOut.mockResolvedValue(undefined)
    render(<UserMenu variant="desktop" />)

    await userEvent.click(screen.getByRole('button', { name: /user menu/i }))
    const menuItem = await screen.findByRole('menuitem', { name: /sign out/i })
    await userEvent.click(menuItem)

    expect(mockSignOut).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})

describe('userMenu — mobile', () => {
  it('renders skeleton while pending', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: true })
    const { container } = render(<UserMenu variant="mobile" />)
    expect(container.firstChild).toBeInTheDocument()
    expect(container.textContent).toBe('')
  })

  it('renders login button when not authenticated', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false })
    render(<UserMenu variant="mobile" />)
    const loginBtn = screen.getByRole('button', { name: /login/i })
    expect(loginBtn).toBeInTheDocument()
    expect(loginBtn).toHaveAttribute('href', '/login')
  })

  it('renders user name and sign out button when authenticated', () => {
    mockUseSession.mockReturnValue({ data: fakeSession, isPending: false })
    render(<UserMenu variant="mobile" />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })
})
