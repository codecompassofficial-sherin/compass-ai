import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/lib/api'
import { roadmapApi, getRoadmapErrorDetails } from '@/features/roadmap/api/roadmap.api'

function buildError(status: number, code: string, message: string): ApiError {
  return new ApiError(status, 'Error', {
    success: false,
    error: { message, code },
  })
}

describe('getRoadmapErrorDetails', () => {
  it('maps a network failure to a connection message', () => {
    const error = new ApiError(0, 'Network error', null)
    expect(getRoadmapErrorDetails(error)).toContain(
      'Unable to reach the server'
    )
  })

  it('maps a 401 to a session message', () => {
    const error = new ApiError(401, 'Unauthorized', null)
    expect(getRoadmapErrorDetails(error)).toBe(
      'Your session has expired. Please sign in again.'
    )
  })

  it('maps ROADMAP_ASSESSMENT_REQUIRED to a friendly message', () => {
    const error = buildError(
      409,
      'ROADMAP_ASSESSMENT_REQUIRED',
      'No assessment exists for this user'
    )
    expect(getRoadmapErrorDetails(error)).toBe(
      'Complete your career assessment before generating a roadmap.'
    )
  })

  it('falls back to the server message for unknown codes', () => {
    const error = buildError(500, 'INTERNAL_SERVER_ERROR', 'Something broke')
    expect(getRoadmapErrorDetails(error)).toBe('Something broke')
  })

  it('falls back to a generic message for unknown errors', () => {
    expect(getRoadmapErrorDetails(new Error('boom'))).toBe(
      'Something went wrong. Please try again.'
    )
  })
})

describe('roadmapApi endpoints', () => {
  const fetchMock = vi.fn()

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('requests the active roadmap', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { roadmap: {} } }), {
        status: 200,
      })
    )

    await roadmapApi.getActive()
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0][0]).toContain('/roadmap')
  })

  it('requests history', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { history: [] } }), { status: 200 })
    )

    await roadmapApi.getHistory()
    expect(fetchMock.mock.calls[0][0]).toContain('/roadmap/history')
  })

  it('requests a compare with from and to query params', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { diff: {} } }), { status: 200 })
    )

    await roadmapApi.compare(1, 3)
    expect(fetchMock.mock.calls[0][0]).toContain(
      '/roadmap/compare?from=1&to=3'
    )
  })

  it('requests generation with POST', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { roadmap: {} } }), { status: 201 })
    )

    await roadmapApi.generate()
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain('/roadmap/generate')
    expect(options.method).toBe('POST')
  })

  it('requests regeneration with POST', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { roadmap: {} } }), { status: 201 })
    )

    await roadmapApi.regenerate()
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain('/roadmap/regenerate')
    expect(options.method).toBe('POST')
  })
})
