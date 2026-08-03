'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query'

import { ApiError } from '@/lib/api'
import { authApi } from '@/features/auth/auth.api'
import { useAuthStore } from '@/features/auth/auth.store'

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401
}

export async function refreshSession(): Promise<boolean> {
  try {
    const { accessToken } = await authApi.refresh()
    const { user } = await authApi.getMe()
    useAuthStore.getState().setSession(user, accessToken)
    return true
  } catch {
    useAuthStore.getState().clearSession()
    return false
  }
}

interface UseApiQueryOptions {
  enabled?: boolean
}

export function useApiQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options: UseApiQueryOptions = {}
) {
  const queryClient = useQueryClient()
  const refreshAttempted = useRef(false)

  const query = useQuery({
    queryKey,
    queryFn,
    enabled: options.enabled,
  })

  const unauthorized = isUnauthorized(query.error)

  useEffect(() => {
    if (!unauthorized || refreshAttempted.current || options.enabled === false) {
      return
    }
    refreshAttempted.current = true

    void (async () => {
      const refreshed = await refreshSession()
      if (!refreshed) {
        return
      }
      await queryClient.refetchQueries({ queryKey })
    })()
  }, [unauthorized, queryClient, queryKey, options.enabled])

  const refetch = useCallback(() => {
    void queryClient.refetchQueries({ queryKey })
  }, [queryClient, queryKey])

  return {
    data: query.data,
    error: query.error,
    isPending: query.isPending,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch,
  }
}
