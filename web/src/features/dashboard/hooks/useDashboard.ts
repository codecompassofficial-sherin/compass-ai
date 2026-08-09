'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  isUnauthorized,
  refreshSession,
} from '@/features/auth/session'
import {
  dashboardApi,
  intelligenceApi,
  projectsApi,
} from '@/features/dashboard/dashboard.api'

const DASHBOARD_KEYS = ['dashboard', 'intelligence', 'projects'] as const

export function useDashboard() {
  const queryClient = useQueryClient()
  const refreshAttempted = useRef(false)

  const dashboard = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
  })

  const intelligence = useQuery({
    queryKey: ['intelligence'],
    queryFn: intelligenceApi.get,
  })

  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })

  const unauthorized =
    isUnauthorized(dashboard.error) ||
    isUnauthorized(intelligence.error) ||
    isUnauthorized(projects.error)

  useEffect(() => {
    if (!unauthorized || refreshAttempted.current) {
      return
    }
    refreshAttempted.current = true

    void (async () => {
      const refreshed = await refreshSession()
      if (!refreshed) {
        return
      }
      await Promise.all(
        DASHBOARD_KEYS.map((key) =>
          queryClient.refetchQueries({ queryKey: [key] })
        )
      )
    })()
  }, [unauthorized, queryClient])

  const refetch = useCallback(() => {
    void Promise.all(
      DASHBOARD_KEYS.map((key) =>
        queryClient.refetchQueries({ queryKey: [key] })
      )
    )
  }, [queryClient])

  return {
    dashboard,
    intelligence,
    projects,
    refetch,
  }
}
