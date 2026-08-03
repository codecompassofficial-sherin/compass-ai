import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAuthStore } from '@/features/auth/auth.store'
import { LoginForm } from '@/features/auth/components/login-form'

const { loginMock } = vi.hoisted(() => ({ loginMock: vi.fn() }))

vi.mock('@/features/auth/auth.api', () => ({
  authApi: {
    login: loginMock,
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    getMe: vi.fn(),
  },
  getAuthErrorDetails: () => ({
    message: 'Invalid email or password.',
    fieldErrors: {},
  }),
}))

const validUser = {
  id: 'user-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  role: 'USER',
  isEmailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('LoginForm', () => {
  beforeEach(() => {
    loginMock.mockReset()
    useAuthStore.getState().clearSession()
  })

  it('renders the email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('shows inline validation errors for an empty submit', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByText('Enter your email address')
    ).toBeInTheDocument()
    expect(screen.getByText('Enter your password')).toBeInTheDocument()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('submits credentials and stores the session', async () => {
    const user = userEvent.setup()
    loginMock.mockResolvedValue({
      user: validUser,
      accessToken: 'access-token',
    })

    render(<LoginForm />)

    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'ada@example.com',
        password: 'secret123',
      })
    })
    await waitFor(() => {
      expect(useAuthStore.getState().status).toBe('authenticated')
    })
    expect(useAuthStore.getState().user?.email).toBe('ada@example.com')
  })

  it('shows a friendly error when login fails', async () => {
    const user = userEvent.setup()
    loginMock.mockRejectedValue(new Error('invalid credentials'))

    render(<LoginForm />)

    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid email or password.'
    )
    expect(useAuthStore.getState().status).toBe('unauthenticated')
  })
})
