import { ApiError, apiRequest, isRecord } from '@/lib/api'

import type {
  PublicRoadmap,
  RoadmapDiff,
  RoadmapHistoryEntry,
} from '../types/roadmap.types'

export const roadmapApi = {
  getActive: () => apiRequest<{ roadmap: PublicRoadmap }>('/roadmap'),
  getById: (id: string) =>
    apiRequest<{ roadmap: PublicRoadmap }>(`/roadmap/${id}`),
  getHistory: () =>
    apiRequest<{ history: RoadmapHistoryEntry[] }>('/roadmap/history'),
  compare: (fromVersion: number, toVersion: number) =>
    apiRequest<{ diff: RoadmapDiff }>(
      `/roadmap/compare?from=${fromVersion}&to=${toVersion}`
    ),
  generate: () =>
    apiRequest<{ roadmap: PublicRoadmap }>('/roadmap/generate', {
      method: 'POST',
    }),
  regenerate: () =>
    apiRequest<{ roadmap: PublicRoadmap }>('/roadmap/regenerate', {
      method: 'POST',
    }),
}

function extractServerMessage(body: unknown): string | null {
  if (!isRecord(body) || !isRecord(body.error)) {
    return null
  }
  return typeof body.error.message === 'string' ? body.error.message : null
}

export function getRoadmapErrorDetails(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.'
    }
    if (error.status === 401) {
      return 'Your session has expired. Please sign in again.'
    }
    if (error.code === 'ROADMAP_ASSESSMENT_REQUIRED') {
      return 'Complete your career assessment before generating a roadmap.'
    }
    return (
      extractServerMessage(error.body) ?? 'Something went wrong. Please try again.'
    )
  }

  return 'Something went wrong. Please try again.'
}
