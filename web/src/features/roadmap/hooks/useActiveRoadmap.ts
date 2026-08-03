'use client'

import { useQueryClient } from '@tanstack/react-query'

import { useApiQuery } from '@/lib/use-api-query'
import { roadmapApi } from '../api/roadmap.api'

export const ROADMAP_QUERY_KEY = ['roadmap', 'active']
export const HISTORY_QUERY_KEY = ['roadmap', 'history']

export function useActiveRoadmap() {
  return useApiQuery(ROADMAP_QUERY_KEY, roadmapApi.getActive)
}

export function useRoadmapHistory() {
  return useApiQuery(HISTORY_QUERY_KEY, roadmapApi.getHistory)
}

export function useRoadmapInvalidation() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ROADMAP_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    queryClient.invalidateQueries({ queryKey: ['intelligence'] })
  }
}
