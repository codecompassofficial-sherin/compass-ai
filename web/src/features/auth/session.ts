import { authApi } from '@/features/auth/auth.api'
import { useAuthStore } from '@/features/auth/auth.store'
import { ApiError } from '@/lib/api'

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401
}

let refreshPromise: Promise<{ accessToken: string } | null> | null = null

function refreshOnce(): Promise<{ accessToken: string } | null> {
  if (!refreshPromise) {
    refreshPromise = authApi
      .refresh()
      .catch(() => {
        useAuthStore.getState().clearSession()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export async function refreshSession(): Promise<boolean> {
  const result = await refreshOnce()
  return result !== null
}

export async function restoreSession(): Promise<void> {
  const result = await refreshOnce()
  if (!result) {
    return
  }
  try {
    const { user } = await authApi.getMe()
    useAuthStore.getState().setSession(user, result.accessToken)
  } catch {
    useAuthStore.getState().clearSession()
  }
}
