import { ApiError, apiRequest, isRecord } from '@/lib/api'

import type { PublicProject } from '../types/projects.types'
import type {
  CreateProjectPayload,
  UpdateProjectPayload,
} from '../validation/projects.validation'

export const projectsApi = {
  list: () => apiRequest<{ projects: PublicProject[] }>('/projects'),
  getById: (id: string) =>
    apiRequest<{ project: PublicProject }>(`/projects/${id}`),
  create: (input: CreateProjectPayload) =>
    apiRequest<{ project: PublicProject }>('/projects', {
      method: 'POST',
      body: input,
    }),
  update: (id: string, input: UpdateProjectPayload) =>
    apiRequest<{ project: PublicProject }>(`/projects/${id}`, {
      method: 'PATCH',
      body: input,
    }),
  complete: (id: string) =>
    apiRequest<{ project: PublicProject }>(`/projects/${id}/complete`, {
      method: 'POST',
    }),
  archive: (id: string) =>
    apiRequest<{ project: PublicProject }>(`/projects/${id}`, {
      method: 'DELETE',
    }),
}

function extractServerMessage(body: unknown): string | null {
  if (!isRecord(body) || !isRecord(body.error)) {
    return null
  }
  return typeof body.error.message === 'string' ? body.error.message : null
}

export function getProjectErrorDetails(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.'
    }
    if (error.status === 401) {
      return 'Your session has expired. Please sign in again.'
    }

    const serverMessage = extractServerMessage(error.body)
    switch (error.code) {
      case 'PROJECT_NOT_FOUND':
        return 'This project could not be found. It may have been removed.'
      case 'INVALID_PROJECT_ID':
        return 'This project is not valid. Please try again.'
      case 'INVALID_PROJECT_STATUS_TRANSITION':
        return 'This project status change is not allowed.'
      case 'PROJECT_CANNOT_COMPLETE':
        return 'Only projects in progress can be completed.'
      case 'PROJECT_CANNOT_ARCHIVE':
        return 'This project cannot be archived.'
      default:
        return serverMessage ?? 'Something went wrong. Please try again.'
    }
  }

  return 'Something went wrong. Please try again.'
}
