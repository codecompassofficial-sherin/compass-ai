import { ApiError } from '@/lib/api'
import { ErrorState } from '@/components/feedback/error-state'

interface DashboardErrorProps {
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
          'Check your connection and try again. Your dashboard data lives on the Compass API.',
      }
    }
    if (error.status === 401) {
      return {
        title: 'Session expired',
        description: 'Please sign in again to view your dashboard.',
      }
    }
  }
  return {
    title: 'Something went wrong',
    description: "We couldn't load your dashboard. Please try again.",
  }
}

export function DashboardError({ error, onRetry }: DashboardErrorProps) {
  const copy = getErrorCopy(error)
  return (
    <ErrorState
      title={copy.title}
      description={copy.description}
      onRetry={onRetry}
    />
  )
}
