import { ApiError, apiRequest, isRecord } from '@/lib/api'

import type { IntelligenceData } from '../types/intelligence.types'

export const intelligenceApi = {
  get: () => apiRequest<IntelligenceData>('/intelligence'),
}

function extractServerMessage(body: unknown): string | null {
  if (!isRecord(body) || !isRecord(body.error)) {
    return null
  }
  return typeof body.error.message === 'string' ? body.error.message : null
}

export function getIntelligenceErrorDetails(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.'
    }
    if (error.status === 401) {
      return 'Your session has expired. Please sign in again.'
    }

    const serverMessage = extractServerMessage(error.body)
    return serverMessage ?? 'Something went wrong. Please try again.'
  }

  return 'Something went wrong. Please try again.'
}
