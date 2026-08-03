'use client'

import { ErrorState } from '@/components/feedback/error-state'
import { ApiError } from '@/lib/api'

import { getIntelligenceErrorDetails } from '../api/intelligence.api'

interface IntelligenceErrorProps {
  error: unknown
  onRetry: () => void
}

export function IntelligenceError({ error, onRetry }: IntelligenceErrorProps) {
  const isUnauthorized = error instanceof ApiError && error.status === 401

  return (
    <ErrorState
      title={isUnauthorized ? 'Session expired' : 'Something went wrong'}
      description={
        isUnauthorized
          ? 'Please sign in again to view your career intelligence.'
          : getIntelligenceErrorDetails(error)
      }
      onRetry={onRetry}
    />
  )
}
