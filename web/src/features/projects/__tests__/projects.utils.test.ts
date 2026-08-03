import { describe, expect, it } from 'vitest'

import type { PublicProject, ProjectStatus } from '@/features/projects/types/projects.types'
import {
  filterProjects,
  getAllowedStatusTransitions,
  getCompletionRate,
  getProjectProgress,
  getProjectsSummary,
  isProjectStatus,
  isProjectStatusFilter,
  isSameStringArray,
} from '@/features/projects/utils/projects.utils'

function project(overrides: Partial<PublicProject> = {}): PublicProject {
  return {
    id: 'project-1',
    title: 'Portfolio site',
    description: 'A personal portfolio built with Next.js',
    technologyStack: ['React', 'TypeScript'],
    githubUrl: 'https://github.com/example/portfolio',
    status: 'planned',
    relatedGoalIds: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('getProjectsSummary', () => {
  it('counts projects by status', () => {
    const projects = [
      project({ status: 'planned' }),
      project({ id: 'b', status: 'in_progress' }),
      project({ id: 'c', status: 'completed' }),
      project({ id: 'd', status: 'archived' }),
    ]
    expect(getProjectsSummary(projects)).toEqual({
      total: 4,
      planned: 1,
      inProgress: 1,
      completed: 1,
      archived: 1,
    })
  })

  it('handles an empty list', () => {
    expect(getProjectsSummary([])).toEqual({
      total: 0,
      planned: 0,
      inProgress: 0,
      completed: 0,
      archived: 0,
    })
  })
})

describe('getCompletionRate', () => {
  it('computes the completed ratio as a rounded percentage', () => {
    const projects = [
      project({ status: 'completed' }),
      project({ id: 'b', status: 'completed' }),
      project({ id: 'c', status: 'planned' }),
    ]
    expect(getCompletionRate(projects)).toBe(67)
  })

  it('returns 0 for an empty list', () => {
    expect(getCompletionRate([])).toBe(0)
  })
})

describe('filterProjects', () => {
  const projects = [
    project({
      title: 'Portfolio site',
      description: 'Personal site with React',
      technologyStack: ['React', 'TypeScript'],
      status: 'in_progress',
    }),
    project({
      id: 'b',
      title: 'CLI tool',
      description: 'A command line helper',
      technologyStack: ['Node.js'],
      status: 'planned',
    }),
    project({
      id: 'c',
      title: 'API service',
      description: 'Backend with Node and TypeScript',
      technologyStack: ['Express', 'TypeScript'],
      status: 'completed',
    }),
  ]

  it('filters by status', () => {
    const result = filterProjects(projects, 'planned', '')
    expect(result.map((item) => item.id)).toEqual(['b'])
  })

  it('keeps everything for the all filter', () => {
    expect(filterProjects(projects, 'all', '')).toHaveLength(3)
  })

  it('searches by title', () => {
    const result = filterProjects(projects, 'all', 'cli')
    expect(result.map((item) => item.id)).toEqual(['b'])
  })

  it('searches by description', () => {
    const result = filterProjects(projects, 'all', 'backend')
    expect(result.map((item) => item.id)).toEqual(['c'])
  })

  it('searches by technology stack', () => {
    const result = filterProjects(projects, 'all', 'typescript')
    expect(result.map((item) => item.id)).toEqual(['project-1', 'c'])
  })

  it('combines status filter and search', () => {
    const result = filterProjects(projects, 'completed', 'typescript')
    expect(result.map((item) => item.id)).toEqual(['c'])
  })

  it('returns nothing for an unmatched search', () => {
    expect(filterProjects(projects, 'all', 'zzz')).toEqual([])
  })
})

describe('isProjectStatus and isProjectStatusFilter', () => {
  it('recognises valid statuses', () => {
    expect(isProjectStatus('in_progress')).toBe(true)
    expect(isProjectStatus('archived')).toBe(true)
    expect(isProjectStatus('nope')).toBe(false)
    expect(isProjectStatus(null)).toBe(false)
  })

  it('recognises valid filters', () => {
    expect(isProjectStatusFilter('all')).toBe(true)
    expect(isProjectStatusFilter('completed')).toBe(true)
    expect(isProjectStatusFilter('nope')).toBe(false)
  })
})

describe('getAllowedStatusTransitions', () => {
  const cases: [ProjectStatus, ProjectStatus[]][] = [
    ['planned', ['in_progress', 'archived']],
    ['in_progress', ['completed', 'archived']],
    ['completed', ['archived']],
    ['archived', []],
  ]

  it.each(cases)('returns the next states for %s', (status, expected) => {
    expect(getAllowedStatusTransitions(status)).toEqual(expected)
  })
})

describe('getProjectProgress', () => {
  it('maps statuses to progress values', () => {
    expect(getProjectProgress('completed')).toEqual({ percent: 100, label: 'Completed' })
    expect(getProjectProgress('in_progress')).toEqual({ percent: null, label: 'In progress' })
    expect(getProjectProgress('planned')).toEqual({ percent: 0, label: 'Not started' })
    expect(getProjectProgress('archived')).toEqual({ percent: 0, label: 'Archived' })
  })
})

describe('isSameStringArray', () => {
  it('compares arrays by value and order', () => {
    expect(isSameStringArray(['a', 'b'], ['a', 'b'])).toBe(true)
    expect(isSameStringArray(['a', 'b'], ['b', 'a'])).toBe(false)
    expect(isSameStringArray(['a'], ['a', 'b'])).toBe(false)
    expect(isSameStringArray([], [])).toBe(true)
  })
})
