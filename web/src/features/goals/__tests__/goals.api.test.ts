import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/lib/api'
import { goalsApi, getGoalErrorDetails } from '@/features/goals/api/goals.api'

function buildError(status: number, code: string, message: string): ApiError {
  return new ApiError(status, 'Error', {
    success: false,
    error: { message, code },
  })
}

describe('getGoalErrorDetails', () => {
  it('maps a network failure to a connection message', () => {
    const error = new ApiError(0, 'Network error', null)
    expect(getGoalErrorDetails(error)).toContain(
      'Unable to reach the server'
    )
  })

  it('maps a 401 to a session message', () => {
    const error = new ApiError(401, 'Unauthorized', null)
    expect(getGoalErrorDetails(error)).toBe(
      'Your session has expired. Please sign in again.'
    )
  })

  it('maps NO_ACTIVE_ROADMAP to a friendly message', () => {
    const error = buildError(404, 'NO_ACTIVE_ROADMAP', 'No active roadmap')
    expect(getGoalErrorDetails(error)).toBe(
      'You need an active roadmap before you can work on goals.'
    )
  })

  it('maps GOAL_NOT_FOUND to a friendly message', () => {
    const error = buildError(404, 'GOAL_NOT_FOUND', 'Goal not found')
    expect(getGoalErrorDetails(error)).toBe(
      'This goal could not be found. It may have been removed.'
    )
  })

  it('maps GOAL_NOT_ACTIVE to a friendly message', () => {
    const error = buildError(409, 'GOAL_NOT_ACTIVE', 'Goal is not active')
    expect(getGoalErrorDetails(error)).toBe(
      'Only active goals can be completed.'
    )
  })

  it('falls back to the server message for unknown codes', () => {
    const error = buildError(500, 'INTERNAL_SERVER_ERROR', 'Something broke')
    expect(getGoalErrorDetails(error)).toBe('Something broke')
  })

  it('falls back to a generic message for unknown errors', () => {
    expect(getGoalErrorDetails(new Error('boom'))).toBe(
      'Something went wrong. Please try again.'
    )
  })
})

describe('goalsApi endpoints', () => {
  const fetchMock = vi.fn()

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('requests the goal list', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { goals: [] } }), { status: 200 })
    )

    await goalsApi.list()
    expect(fetchMock.mock.calls[0][0]).toContain('/goals')
  })

  it('requests a goal by id', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { goal: {} } }), { status: 200 })
    )

    await goalsApi.getById('goal-123')
    expect(fetchMock.mock.calls[0][0]).toContain('/goals/goal-123')
  })

  it('requests activation with POST', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { goal: {} } }), { status: 200 })
    )

    await goalsApi.activate('goal-123')
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain('/goals/goal-123/activate')
    expect(options.method).toBe('POST')
  })

  it('requests completion with POST', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { goal: {} } }), { status: 200 })
    )

    await goalsApi.complete('goal-123')
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain('/goals/goal-123/complete')
    expect(options.method).toBe('POST')
  })
})
