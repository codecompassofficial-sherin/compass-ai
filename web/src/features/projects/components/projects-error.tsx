'use client'

import { ApiError } from '@/lib/api'
import { ErrorState } from '@/components/feedback/error-state'

import { getProjectErrorDetails } from '../api/projects.api'

interface ProjectsErrorProps {
  error: unknown
  onRetry: () => void
}

export function ProjectsError({ error, onRetry }: ProjectsErrorProps) {
  const isUnauthorized = error instanceof ApiError && error.status === 401

  return (
    <ErrorState
      title={isUnauthorized ? 'Session expired' : 'Something went wrong'}
      description={
        isUnauthorized
          ? 'Please sign in again to view your projects.'
          : getProjectErrorDetails(error)
      }
      onRetry={onRetry}
    />
  )
}
