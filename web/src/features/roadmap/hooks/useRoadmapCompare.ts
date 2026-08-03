'use client'

import { useApiQuery } from '@/lib/use-api-query'
import { roadmapApi } from '../api/roadmap.api'
import type { RoadmapDiff } from '../types/roadmap.types'

export const COMPARE_QUERY_KEY = ['roadmap', 'compare']

export function useRoadmapCompare(
  fromVersion: number | null,
  toVersion: number | null
) {
  const enabled = fromVersion !== null && toVersion !== null

  return useApiQuery<{ diff: RoadmapDiff }>(
    [...COMPARE_QUERY_KEY, fromVersion, toVersion],
    () => roadmapApi.compare(fromVersion as number, toVersion as number),
    { enabled }
  )
}
