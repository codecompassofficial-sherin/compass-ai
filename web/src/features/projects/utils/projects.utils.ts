import {
  PROJECT_STATUS_FILTERS,
  PROJECT_STATUS_TRANSITIONS,
  type ProjectStatusFilter,
} from '../constants/projects.constants'
import { PROJECT_STATUSES, type ProjectStatus } from '../types/projects.types'
import type { PublicProject } from '../types/projects.types'

export function getProjectsSummary(projects: PublicProject[]): {
  total: number
  planned: number
  inProgress: number
  completed: number
  archived: number
} {
  return {
    total: projects.length,
    planned: projects.filter((project) => project.status === 'planned').length,
    inProgress: projects.filter(
      (project) => project.status === 'in_progress'
    ).length,
    completed: projects.filter((project) => project.status === 'completed')
      .length,
    archived: projects.filter((project) => project.status === 'archived')
      .length,
  }
}

export function getCompletionRate(projects: PublicProject[]): number {
  const total = projects.length
  if (total === 0) {
    return 0
  }
  const completed = projects.filter(
    (project) => project.status === 'completed'
  ).length
  return Math.round((completed / total) * 100)
}

export function filterProjects(
  projects: PublicProject[],
  filter: ProjectStatusFilter,
  search: string
): PublicProject[] {
  const query = search.trim().toLowerCase()
  return projects.filter((project) => {
    if (filter !== 'all' && project.status !== filter) {
      return false
    }
    if (!query) {
      return true
    }
    return (
      project.title.toLowerCase().includes(query) ||
      (project.description?.toLowerCase().includes(query) ?? false) ||
      project.technologyStack.some((technology) =>
        technology.toLowerCase().includes(query)
      )
    )
  })
}

export function isProjectStatus(value: unknown): value is ProjectStatus {
  return (
    typeof value === 'string' &&
    (PROJECT_STATUSES as readonly string[]).includes(value)
  )
}

export function getAllowedStatusTransitions(
  status: ProjectStatus
): ProjectStatus[] {
  return [...PROJECT_STATUS_TRANSITIONS[status]]
}

export function getProjectProgress(status: ProjectStatus): {
  percent: number | null
  label: string
} {
  switch (status) {
    case 'completed':
      return { percent: 100, label: 'Completed' }
    case 'in_progress':
      return { percent: null, label: 'In progress' }
    case 'planned':
      return { percent: 0, label: 'Not started' }
    case 'archived':
      return { percent: 0, label: 'Archived' }
  }
}

export function isSameStringArray(
  left: readonly string[],
  right: readonly string[]
): boolean {
  if (left.length !== right.length) {
    return false
  }
  return left.every((value, index) => value === right[index])
}

export function isProjectStatusFilter(value: string): value is ProjectStatusFilter {
  return (PROJECT_STATUS_FILTERS as readonly string[]).includes(value)
}
