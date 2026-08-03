export const PROJECT_STATUSES = [
  'planned',
  'in_progress',
  'completed',
  'archived',
] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export interface PublicProject {
  id: string
  title: string
  description?: string
  technologyStack: string[]
  githubUrl?: string
  liveUrl?: string
  status: ProjectStatus
  relatedGoalIds: string[]
  completedAt?: string
  createdAt: string
  updatedAt: string
}
