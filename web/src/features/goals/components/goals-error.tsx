'use client'

import { ApiError } from '@/lib/api'
import { ErrorState } from '@/components/feedback/error-state'

import { getGoalErrorDetails } from '../api/goals.api'

interface GoalsErrorProps {
  error: unknown
  onRetry: () => void
}

export function GoalsError({ error, onRetry }: GoalsErrorProps) {
  const isUnauthorized = error instanceof ApiError && error.status === 401

  return (
    <ErrorState
      title={isUnauthorized ? 'Session expired' : 'Something went wrong'}
      description={
        isUnauthorized
          ? 'Please sign in again to view your goals.'
          : getGoalErrorDetails(error)
      }
      onRetry={onRetry}
    />
  )
}
