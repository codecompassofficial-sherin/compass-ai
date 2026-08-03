import type {
  GoalBindings,
  GoalInstanceStatus,
} from '@/features/roadmap/types/roadmap.types'

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface PublicTask {
  id: string
  goalId: string
  roadmapId: string
  order: number
  title: string
  description: string
  estimatedEffortHours: number
  templateVersion: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface PublicGoal {
  id: string
  phaseKey: string
  order: number
  templateKey: string
  templateVersion: string
  title: string
  description: string
  skillTargets: string[]
  prerequisites: string[]
  estimatedEffortHours: number
  bindings: GoalBindings
  status: GoalInstanceStatus
  progress: number
  taskCount: number
  tasks: PublicTask[]
  activatedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}
