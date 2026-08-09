'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'

import {
  isUnauthorized,
  refreshSession,
} from '@/features/auth/session'
import { assessmentApi } from '@/features/assessment/assessment.api'
import type { AssessmentFormValues } from '@/features/assessment/assessment.validation'

const ASSESSMENT_KEY = 'assessment'

function invalidateRelatedQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: [ASSESSMENT_KEY] })
  queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  queryClient.invalidateQueries({ queryKey: ['intelligence'] })
}

export function useAssessment() {
  const queryClient = useQueryClient()
  const refreshAttempted = useRef(false)

  const query = useQuery({
    queryKey: [ASSESSMENT_KEY],
    queryFn: assessmentApi.get,
  })

  const unauthorized = isUnauthorized(query.error)

  useEffect(() => {
    if (!unauthorized || refreshAttempted.current) {
      return
    }
    refreshAttempted.current = true

    void (async () => {
      const refreshed = await refreshSession()
      if (!refreshed) {
        return
      }
      await queryClient.refetchQueries({ queryKey: [ASSESSMENT_KEY] })
    })()
  }, [unauthorized, queryClient])

  const refetch = useCallback(() => {
    void queryClient.refetchQueries({ queryKey: [ASSESSMENT_KEY] })
  }, [queryClient])

  return {
    data: query.data,
    error: query.error,
    isPending: query.isPending,
    isError: query.isError,
    refetch,
  }
}

export function useCreateAssessment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: AssessmentFormValues) => assessmentApi.create(values),
    onSuccess: () => invalidateRelatedQueries(queryClient),
  })
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: AssessmentFormValues) => assessmentApi.update(values),
    onSuccess: () => invalidateRelatedQueries(queryClient),
  })
}
