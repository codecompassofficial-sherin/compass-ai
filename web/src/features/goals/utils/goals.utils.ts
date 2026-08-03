import type { RoadmapPhase } from '@/features/roadmap/types/roadmap.types'

import type { PublicGoal, PublicTask } from '../types/goals.types'

export function getPhaseName(
  phases: RoadmapPhase[],
  phaseKey: string
): string {
  const phase = phases.find((candidate) => candidate.key === phaseKey)
  if (phase) {
    return phase.name
  }
  return phaseKey
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getTaskSummary(tasks: PublicTask[]): {
  done: number
  total: number
} {
  return {
    done: tasks.filter((task) => task.status === 'done').length,
    total: tasks.length,
  }
}

export function getGoalsSummary(goals: PublicGoal[]): {
  completed: number
  total: number
} {
  return {
    completed: goals.filter((goal) => goal.status === 'completed').length,
    total: goals.length,
  }
}

export function getActiveGoal(goals: PublicGoal[]): PublicGoal | null {
  return goals.find((goal) => goal.status === 'active') ?? null
}

export function getFirstDraftGoal(goals: PublicGoal[]): PublicGoal | null {
  return goals.find((goal) => goal.status === 'draft') ?? null
}

export function formatTaskCountLabel(done: number, total: number): string {
  return `${done} of ${total} tasks`
}
