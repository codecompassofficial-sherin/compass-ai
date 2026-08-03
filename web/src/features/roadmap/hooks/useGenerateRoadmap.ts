'use client'

import { useMutation } from '@tanstack/react-query'

import { roadmapApi } from '../api/roadmap.api'
import { useRoadmapInvalidation } from './useActiveRoadmap'

export function useGenerateRoadmap() {
  const invalidateRoadmapData = useRoadmapInvalidation()

  return useMutation({
    mutationFn: roadmapApi.generate,
    onSuccess: invalidateRoadmapData,
  })
}

export function useRegenerateRoadmap() {
  const invalidateRoadmapData = useRoadmapInvalidation()

  return useMutation({
    mutationFn: roadmapApi.regenerate,
    onSuccess: invalidateRoadmapData,
  })
}
