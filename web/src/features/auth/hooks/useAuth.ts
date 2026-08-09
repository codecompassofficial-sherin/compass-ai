'use client'

import { useCallback } from 'react'

import { authApi } from '@/features/auth/auth.api'
import { useAuthStore } from '@/features/auth/auth.store'
import { restoreSession } from '@/features/auth/session'
import type { LoginInput, RegisterInput } from '@/features/auth/auth.types'

export { restoreSession }

export function useAuth() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'

  const login = useCallback(async (input: LoginInput) => {
    const result = await authApi.login(input)
    useAuthStore.getState().setSession(result.user, result.accessToken)
    return result
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const result = await authApi.register(input)
    useAuthStore.getState().setSession(result.user, result.accessToken)
    return result
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Local session is cleared regardless of the server response.
    }
    useAuthStore.getState().clearSession()
  }, [])

  return { status, user, isAuthenticated, isLoading, login, register, logout }
}
