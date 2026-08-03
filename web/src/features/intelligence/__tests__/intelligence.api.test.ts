import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/lib/api'
import {
  getIntelligenceErrorDetails,
  intelligenceApi,
} from '@/features/intelligence/api/intelligence.api'

describe('getIntelligenceErrorDetails', () => {
  it('maps a network failure to a connection message', () => {
    const error = new ApiError(0, 'Network error', null)
    expect(getIntelligenceErrorDetails(error)).toContain(
      'Unable to reach the server'
    )
  })

  it('maps a 401 to a session message', () => {
    const error = new ApiError(401, 'Unauthorized', null)
    expect(getIntelligenceErrorDetails(error)).toBe(
      'Your session has expired. Please sign in again.'
    )
  })

  it('falls back to the server message for unknown codes', () => {
    const error = new ApiError(500, 'Error', {
      success: false,
      error: { message: 'Something broke' },
    })
    expect(getIntelligenceErrorDetails(error)).toBe('Something broke')
  })

  it('falls back to a generic message when no server message exists', () => {
    const error = new ApiError(500, 'Error', null)
    expect(getIntelligenceErrorDetails(error)).toBe(
      'Something went wrong. Please try again.'
    )
  })

  it('falls back to a generic message for unknown errors', () => {
    expect(getIntelligenceErrorDetails(new Error('boom'))).toBe(
      'Something went wrong. Please try again.'
    )
  })
})

describe('intelligenceApi', () => {
  const fetchMock = vi.fn()

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('requests the intelligence payload', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), { status: 200 })
    )

    await intelligenceApi.get()
    expect(fetchMock.mock.calls[0][0]).toContain('/intelligence')
  })
})
