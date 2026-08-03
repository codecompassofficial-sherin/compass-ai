import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/lib/api'
import {
  getProjectErrorDetails,
  projectsApi,
} from '@/features/projects/api/projects.api'

function buildError(status: number, code: string, message: string): ApiError {
  return new ApiError(status, 'Error', {
    success: false,
    error: { message, code },
  })
}

describe('getProjectErrorDetails', () => {
  it('maps a network failure to a connection message', () => {
    const error = new ApiError(0, 'Network error', null)
    expect(getProjectErrorDetails(error)).toContain(
      'Unable to reach the server'
    )
  })

  it('maps a 401 to a session message', () => {
    const error = new ApiError(401, 'Unauthorized', null)
    expect(getProjectErrorDetails(error)).toBe(
      'Your session has expired. Please sign in again.'
    )
  })

  it('maps PROJECT_NOT_FOUND to a friendly message', () => {
    const error = buildError(404, 'PROJECT_NOT_FOUND', 'Project not found')
    expect(getProjectErrorDetails(error)).toBe(
      'This project could not be found. It may have been removed.'
    )
  })

  it('maps INVALID_PROJECT_STATUS_TRANSITION to a friendly message', () => {
    const error = buildError(
      409,
      'INVALID_PROJECT_STATUS_TRANSITION',
      'Invalid transition'
    )
    expect(getProjectErrorDetails(error)).toBe(
      'This project status change is not allowed.'
    )
  })

  it('maps PROJECT_CANNOT_COMPLETE to a friendly message', () => {
    const error = buildError(409, 'PROJECT_CANNOT_COMPLETE', 'Cannot complete')
    expect(getProjectErrorDetails(error)).toBe(
      'Only projects in progress can be completed.'
    )
  })

  it('maps PROJECT_CANNOT_ARCHIVE to a friendly message', () => {
    const error = buildError(409, 'PROJECT_CANNOT_ARCHIVE', 'Cannot archive')
    expect(getProjectErrorDetails(error)).toBe(
      'This project cannot be archived.'
    )
  })

  it('falls back to the server message for unknown codes', () => {
    const error = buildError(500, 'INTERNAL_SERVER_ERROR', 'Something broke')
    expect(getProjectErrorDetails(error)).toBe('Something broke')
  })

  it('falls back to a generic message for unknown errors', () => {
    expect(getProjectErrorDetails(new Error('boom'))).toBe(
      'Something went wrong. Please try again.'
    )
  })
})

describe('projectsApi endpoints', () => {
  const fetchMock = vi.fn()

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('requests the project list', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { projects: [] } }), { status: 200 })
    )

    await projectsApi.list()
    expect(fetchMock.mock.calls[0][0]).toContain('/projects')
  })

  it('requests a project by id', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { project: {} } }), { status: 200 })
    )

    await projectsApi.getById('project-123')
    expect(fetchMock.mock.calls[0][0]).toContain('/projects/project-123')
  })

  it('creates a project with POST and a body', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { project: {} } }), { status: 201 })
    )

    await projectsApi.create({
      title: 'Portfolio',
      technologyStack: ['React'],
      status: 'planned',
    })
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain('/projects')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toMatchObject({ title: 'Portfolio' })
  })

  it('updates a project with PATCH and a body', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { project: {} } }), { status: 200 })
    )

    await projectsApi.update('project-123', { title: 'Renamed' })
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain('/projects/project-123')
    expect(options.method).toBe('PATCH')
    expect(JSON.parse(options.body)).toEqual({ title: 'Renamed' })
  })

  it('completes a project with POST', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { project: {} } }), { status: 200 })
    )

    await projectsApi.complete('project-123')
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain('/projects/project-123/complete')
    expect(options.method).toBe('POST')
  })

  it('archives a project with DELETE', async () => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { project: {} } }), { status: 200 })
    )

    await projectsApi.archive('project-123')
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain('/projects/project-123')
    expect(options.method).toBe('DELETE')
  })
})
