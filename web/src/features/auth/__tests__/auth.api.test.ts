import { describe, expect, it } from 'vitest'

import { ApiError } from '@/lib/api'
import { getAuthErrorDetails } from '@/features/auth/auth.api'

describe('getAuthErrorDetails', () => {
  it('maps invalid credentials to a friendly message', () => {
    const error = new ApiError(401, 'Unauthorized', {
      success: false,
      error: {
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      },
    })
    expect(getAuthErrorDetails(error)).toEqual({
      message: 'Invalid email or password.',
      fieldErrors: {},
    })
  })

  it('maps email already exists to an email field error', () => {
    const error = new ApiError(409, 'Conflict', {
      success: false,
      error: {
        message: 'An account with this email already exists',
        code: 'EMAIL_ALREADY_EXISTS',
      },
    })
    expect(getAuthErrorDetails(error)).toEqual({
      message: 'An account with this email already exists.',
      fieldErrors: { email: 'An account with this email already exists.' },
    })
  })

  it('maps validation details to field errors', () => {
    const error = new ApiError(400, 'Bad Request', {
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: [{ path: 'email', message: 'Invalid email address' }],
      },
    })
    expect(getAuthErrorDetails(error)).toEqual({
      message: 'Please check the highlighted fields and try again.',
      fieldErrors: { email: 'Invalid email address' },
    })
  })

  it('maps network failures to a connection message', () => {
    const error = new ApiError(0, 'Network error', null)
    expect(getAuthErrorDetails(error).message).toContain(
      'Unable to reach the server'
    )
  })

  it('falls back to a generic message for unknown errors', () => {
    expect(getAuthErrorDetails(new Error('boom'))).toEqual({
      message: 'Something went wrong. Please try again.',
      fieldErrors: {},
    })
  })
})
