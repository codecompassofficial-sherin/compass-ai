import { ApiError } from '@/lib/api'
import { ErrorState } from '@/components/feedback/error-state'

interface AssessmentErrorProps {
  error: unknown
  onRetry: () => void
}

interface ErrorCopy {
  title: string
  description: string
}

function getErrorCopy(error: unknown): ErrorCopy {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return {
        title: "Can't reach the server",
        description:
          'Check your connection and try again. Your assessment data lives on the Compass API.',
      }
    }
    if (error.status === 401) {
      return {
        title: 'Session expired',
        description: 'Please sign in again to continue your assessment.',
      }
    }
  }
  return {
    title: 'Something went wrong',
    description: "We couldn't load your assessment. Please try again.",
  }
}

export function AssessmentError({ error, onRetry }: AssessmentErrorProps) {
  const copy = getErrorCopy(error)
  return (
    <ErrorState
      title={copy.title}
      description={copy.description}
      onRetry={onRetry}
    />
  )
}
