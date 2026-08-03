import { ApiError, apiRequest, isRecord } from '@/lib/api'

import type { PublicGoal } from '../types/goals.types'

export const goalsApi = {
  list: () => apiRequest<{ goals: PublicGoal[] }>('/goals'),
  getById: (id: string) =>
    apiRequest<{ goal: PublicGoal }>(`/goals/${id}`),
  activate: (id: string) =>
    apiRequest<{ goal: PublicGoal }>(`/goals/${id}/activate`, {
      method: 'POST',
    }),
  complete: (id: string) =>
    apiRequest<{ goal: PublicGoal }>(`/goals/${id}/complete`, {
      method: 'POST',
    }),
}

function extractServerMessage(body: unknown): string | null {
  if (!isRecord(body) || !isRecord(body.error)) {
    return null
  }
  return typeof body.error.message === 'string' ? body.error.message : null
}

export function getGoalErrorDetails(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.'
    }
    if (error.status === 401) {
      return 'Your session has expired. Please sign in again.'
    }

    const serverMessage = extractServerMessage(error.body)
    switch (error.code) {
      case 'NO_ACTIVE_ROADMAP':
        return 'You need an active roadmap before you can work on goals.'
      case 'GOAL_NOT_FOUND':
        return 'This goal could not be found. It may have been removed.'
      case 'INVALID_GOAL_ID':
        return 'This goal is not valid. Please try again.'
      case 'GOAL_ALREADY_ACTIVE':
        return 'This goal is already active.'
      case 'GOAL_ALREADY_COMPLETED':
        return 'This goal is already completed.'
      case 'GOAL_NOT_ACTIVE':
        return 'Only active goals can be completed.'
      default:
        return serverMessage ?? 'Something went wrong. Please try again.'
    }
  }

  return 'Something went wrong. Please try again.'
}
