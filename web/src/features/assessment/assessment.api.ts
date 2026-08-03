import { ApiError, apiRequest, isRecord } from '@/lib/api'

import type { PublicAssessment } from './assessment.types'
import type { AssessmentFormValues } from './assessment.validation'

export const assessmentApi = {
  get: () => apiRequest<{ assessment: PublicAssessment }>('/assessment'),
  create: (input: AssessmentFormValues) =>
    apiRequest<{ assessment: PublicAssessment }>('/assessment', {
      method: 'POST',
      body: input,
    }),
  update: (input: AssessmentFormValues) =>
    apiRequest<{ assessment: PublicAssessment }>('/assessment', {
      method: 'PATCH',
      body: input,
    }),
}

function extractServerMessage(body: unknown): string | null {
  if (!isRecord(body) || !isRecord(body.error)) {
    return null
  }
  return typeof body.error.message === 'string' ? body.error.message : null
}

export function getAssessmentErrorDetails(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.'
    }
    if (error.status === 401) {
      return 'Your session has expired. Please sign in again.'
    }

    const serverMessage = extractServerMessage(error.body)
    switch (error.code) {
      case 'ASSESSMENT_ALREADY_EXISTS':
        return 'An assessment already exists for your account. Try editing it instead.'
      case 'ASSESSMENT_NOT_FOUND':
        return 'No assessment was found for your account.'
      case 'VALIDATION_ERROR':
        return serverMessage ?? 'Please check your answers and try again.'
      default:
        return serverMessage ?? 'Something went wrong. Please try again.'
    }
  }

  return 'Something went wrong. Please try again.'
}

export function isAssessmentNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'ASSESSMENT_NOT_FOUND'
}
