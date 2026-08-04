'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useApiQuery } from '@/lib/use-api-query'

import { goalsApi } from '../api/goals.api'
import type { PublicGoal, TaskStatus } from '../types/goals.types'

export const GOALS_QUERY_KEY = ['goals']
export const GOAL_DETAIL_QUERY_KEY = (id: string) => ['goals', id]

export function useGoals() {
  return useApiQuery(GOALS_QUERY_KEY, goalsApi.list)
}

export function useGoal(id: string | null) {
  return useApiQuery<{ goal: PublicGoal }>(
    GOAL_DETAIL_QUERY_KEY(id ?? ''),
    () => goalsApi.getById(id as string),
    { enabled: id !== null }
  )
}

export function useGoalsInvalidation() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: ['roadmap'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    queryClient.invalidateQueries({ queryKey: ['intelligence'] })
  }
}

export function useActivateGoal() {
  const invalidateGoalsData = useGoalsInvalidation()
  return useMutation({
    mutationFn: goalsApi.activate,
    onSuccess: invalidateGoalsData,
  })
}

export function useCompleteGoal() {
  const invalidateGoalsData = useGoalsInvalidation()
  return useMutation({
    mutationFn: goalsApi.complete,
    onSuccess: invalidateGoalsData,
  })
}

export function useUpdateTaskStatus() {
  const invalidateGoalsData = useGoalsInvalidation()
  return useMutation({
    mutationFn: ({
      goalId,
      taskId,
      status,
    }: {
      goalId: string
      taskId: string
      status: TaskStatus
    }) => goalsApi.updateTask(goalId, taskId, status),
    onSuccess: invalidateGoalsData,
  })
}
