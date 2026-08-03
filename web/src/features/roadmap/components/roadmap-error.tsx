import { ApiError } from '@/lib/api'
import { ErrorState } from '@/components/feedback/error-state'

interface RoadmapErrorProps {
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
          'Check your connection and try again. Your roadmap lives on the Compass API.',
      }
    }
    if (error.status === 401) {
      return {
        title: 'Session expired',
        description: 'Please sign in again to view your roadmap.',
      }
    }
  }
  return {
    title: 'Something went wrong',
    description: "We couldn't load your roadmap. Please try again.",
  }
}

export function RoadmapError({ error, onRetry }: RoadmapErrorProps) {
  const copy = getErrorCopy(error)
  return (
    <ErrorState
      title={copy.title}
      description={copy.description}
      onRetry={onRetry}
    />
  )
}
