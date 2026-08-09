import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/features/auth/auth.store'
import {
  isUnauthorized,
  refreshSession,
  restoreSession,
} from '@/features/auth/session'
import { ApiError } from '@/lib/api'

const { refreshMock, getMeMock } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  getMeMock: vi.fn(),
}))

vi.mock('@/features/auth/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: refreshMock,
    getMe: getMeMock,
  },
}))

const user = {
  id: 'user-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  role: 'USER' as const,
  isEmailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('isUnauthorized', () => {
  it('returns true for an ApiError with status 401', () => {
    expect(isUnauthorized(new ApiError(401, 'Unauthorized', null))).toBe(true)
  })

  it('returns false for other ApiError statuses', () => {
    expect(isUnauthorized(new ApiError(403, 'Forbidden', null))).toBe(false)
  })

  it('returns false for non-ApiError errors', () => {
    expect(isUnauthorized(new Error('boom'))).toBe(false)
  })
})

describe('refreshSession', () => {
  beforeEach(() => {
    refreshMock.mockReset()
    getMeMock.mockReset()
    useAuthStore.setState({
      status: 'authenticated',
      user,
      accessToken: 'old-token',
    })
  })

  it('deduplicates concurrent calls into a single refresh request', async () => {
    refreshMock.mockResolvedValue({ accessToken: 'new-token' })

    const results = await Promise.all([
      refreshSession(),
      refreshSession(),
      refreshSession(),
    ])

    expect(refreshMock).toHaveBeenCalledTimes(1)
    expect(results).toEqual([true, true, true])
  })

  it('refreshes the access token without refetching the user', async () => {
    refreshMock.mockResolvedValue({ accessToken: 'new-token' })

    const ok = await refreshSession()

    expect(ok).toBe(true)
    expect(refreshMock).toHaveBeenCalledTimes(1)
    expect(getMeMock).not.toHaveBeenCalled()
    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().user).toEqual(user)
  })

  it('clears the session and returns false when the refresh fails', async () => {
    refreshMock.mockRejectedValue(new Error('boom'))

    const ok = await refreshSession()

    expect(ok).toBe(false)
    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('retries with a new network request after a failure', async () => {
    refreshMock.mockRejectedValueOnce(new Error('boom'))
    await refreshSession()

    useAuthStore.setState({
      status: 'authenticated',
      user,
      accessToken: 'old-token',
    })
    refreshMock.mockResolvedValueOnce({ accessToken: 'new-token' })

    const ok = await refreshSession()

    expect(refreshMock).toHaveBeenCalledTimes(2)
    expect(ok).toBe(true)
  })
})

describe('restoreSession', () => {
  beforeEach(() => {
    refreshMock.mockReset()
    getMeMock.mockReset()
    useAuthStore.setState({ status: 'loading', user: null, accessToken: null })
  })

  it('restores the session by refreshing and fetching the user once', async () => {
    refreshMock.mockResolvedValue({ accessToken: 'new-token' })
    getMeMock.mockResolvedValue({ user })

    await restoreSession()

    expect(refreshMock).toHaveBeenCalledTimes(1)
    expect(getMeMock).toHaveBeenCalledTimes(1)
    const state = useAuthStore.getState()
    expect(state.status).toBe('authenticated')
    expect(state.user).toEqual(user)
    expect(state.accessToken).toBe('new-token')
  })

  it('shares a single refresh with a concurrent refreshSession', async () => {
    refreshMock.mockResolvedValue({ accessToken: 'new-token' })
    getMeMock.mockResolvedValue({ user })

    const [refreshed] = await Promise.all([refreshSession(), restoreSession()])

    expect(refreshMock).toHaveBeenCalledTimes(1)
    expect(getMeMock).toHaveBeenCalledTimes(1)
    expect(refreshed).toBe(true)
    expect(useAuthStore.getState().status).toBe('authenticated')
  })

  it('clears the session when getMe fails after a successful refresh', async () => {
    refreshMock.mockResolvedValue({ accessToken: 'new-token' })
    getMeMock.mockRejectedValue(new Error('boom'))

    await restoreSession()

    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(getMeMock).toHaveBeenCalledTimes(1)
  })

  it('does not fetch the user when the refresh fails', async () => {
    refreshMock.mockRejectedValue(new Error('boom'))

    await restoreSession()

    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(getMeMock).not.toHaveBeenCalled()
  })
})
