import { describe, expect, it } from 'vitest'

import { ApiError } from '@/lib/api'
import {
  getAssessmentErrorDetails,
  isAssessmentNotFound,
} from '@/features/assessment/assessment.api'

function buildError(status: number, code: string, message: string): ApiError {
  return new ApiError(status, 'Error', {
    success: false,
    error: { message, code },
  })
}

describe('getAssessmentErrorDetails', () => {
  it('maps a network failure to a connection message', () => {
    const error = new ApiError(0, 'Network error', null)
    expect(getAssessmentErrorDetails(error)).toContain(
      'Unable to reach the server'
    )
  })

  it('maps a 401 to a session message', () => {
    const error = new ApiError(401, 'Unauthorized', null)
    expect(getAssessmentErrorDetails(error)).toBe(
      'Your session has expired. Please sign in again.'
    )
  })

  it('maps ASSESSMENT_ALREADY_EXISTS to a friendly message', () => {
    const error = buildError(
      409,
      'ASSESSMENT_ALREADY_EXISTS',
      'An assessment already exists for this user'
    )
    expect(getAssessmentErrorDetails(error)).toBe(
      'An assessment already exists for your account. Try editing it instead.'
    )
  })

  it('maps ASSESSMENT_NOT_FOUND to a friendly message', () => {
    const error = buildError(
      404,
      'ASSESSMENT_NOT_FOUND',
      'No assessment found for this user'
    )
    expect(getAssessmentErrorDetails(error)).toBe(
      'No assessment was found for your account.'
    )
  })

  it('maps VALIDATION_ERROR to the server message', () => {
    const error = buildError(400, 'VALIDATION_ERROR', 'Validation failed')
    expect(getAssessmentErrorDetails(error)).toBe('Validation failed')
  })

  it('falls back to the server message for unknown codes', () => {
    const error = buildError(500, 'INTERNAL_SERVER_ERROR', 'Something broke')
    expect(getAssessmentErrorDetails(error)).toBe('Something broke')
  })

  it('falls back to a generic message for unknown errors', () => {
    expect(getAssessmentErrorDetails(new Error('boom'))).toBe(
      'Something went wrong. Please try again.'
    )
  })
})

describe('isAssessmentNotFound', () => {
  it('returns true for ASSESSMENT_NOT_FOUND', () => {
    const error = buildError(404, 'ASSESSMENT_NOT_FOUND', 'Not found')
    expect(isAssessmentNotFound(error)).toBe(true)
  })

  it('returns false for other errors', () => {
    expect(isAssessmentNotFound(new Error('boom'))).toBe(false)
    expect(isAssessmentNotFound(buildError(500, 'SERVER', 'oops'))).toBe(false)
  })
})
