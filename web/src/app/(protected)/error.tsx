'use client'

import { PageContainer } from '@/components/common/page-container'
import { ErrorState } from '@/components/feedback/error-state'

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <PageContainer>
      <ErrorState onRetry={reset} />
    </PageContainer>
  )
}
