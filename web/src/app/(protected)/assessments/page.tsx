'use client'

import { useState } from 'react'

import { PageContainer } from '@/components/common/page-container'
import { isAssessmentNotFound } from '@/features/assessment/assessment.api'
import { AssessmentError } from '@/features/assessment/components/assessment-error'
import { AssessmentIntro } from '@/features/assessment/components/assessment-intro'
import { AssessmentSkeleton } from '@/features/assessment/components/assessment-skeleton'
import { AssessmentWizard } from '@/features/assessment/components/assessment-wizard'
import { useAssessment } from '@/features/assessment/hooks/useAssessment'

export default function AssessmentsPage() {
  const { data, isPending, isError, error, refetch } = useAssessment()
  const [creating, setCreating] = useState(false)

  if (isPending) {
    return (
      <PageContainer>
        <AssessmentSkeleton />
      </PageContainer>
    )
  }

  if (isError || !data) {
    if (isAssessmentNotFound(error)) {
      return (
        <PageContainer>
          {creating ? (
            <AssessmentWizard />
          ) : (
            <AssessmentIntro onStart={() => setCreating(true)} />
          )}
        </PageContainer>
      )
    }
    return (
      <PageContainer>
        <AssessmentError error={error} onRetry={refetch} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <AssessmentWizard assessment={data.assessment} />
    </PageContainer>
  )
}
