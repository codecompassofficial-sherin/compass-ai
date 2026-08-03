import { describe, expect, it } from 'vitest'

import type { RoadmapPhase } from '@/features/roadmap/types/roadmap.types'
import type { PublicGoal, PublicTask } from '@/features/goals/types/goals.types'
import {
  formatTaskCountLabel,
  getActiveGoal,
  getFirstDraftGoal,
  getGoalsSummary,
  getPhaseName,
  getTaskSummary,
} from '@/features/goals/utils/goals.utils'

const phases: RoadmapPhase[] = [
  { key: 'foundation', name: 'Foundations', description: '', order: 1 },
  { key: 'core-skills', name: 'Core Skills', description: '', order: 2 },
]

function task(overrides: Partial<PublicTask> = {}): PublicTask {
  return {
    id: 'task-1',
    goalId: 'goal-1',
    roadmapId: 'roadmap-1',
    order: 1,
    title: 'Task',
    description: '',
    estimatedEffortHours: 2,
    templateVersion: '1.0.0',
    status: 'todo',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function goal(overrides: Partial<PublicGoal> = {}): PublicGoal {
  return {
    id: 'goal-1',
    phaseKey: 'foundation',
    order: 1,
    templateKey: 'template-1',
    templateVersion: '1.0.0',
    title: 'Goal',
    description: '',
    skillTargets: [],
    prerequisites: [],
    estimatedEffortHours: 8,
    bindings: { technologyPreferences: [], currentSkills: [] },
    status: 'draft',
    progress: 0,
    taskCount: 0,
    tasks: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('getPhaseName', () => {
  it('returns the phase name when found', () => {
    expect(getPhaseName(phases, 'core-skills')).toBe('Core Skills')
  })

  it('prettifies unknown phase keys', () => {
    expect(getPhaseName(phases, 'interview-prep')).toBe('Interview Prep')
  })
})

describe('getTaskSummary', () => {
  it('counts done and total tasks', () => {
    const tasks = [
      task({ status: 'done' }),
      task({ status: 'in_progress' }),
      task({ status: 'todo' }),
    ]
    expect(getTaskSummary(tasks)).toEqual({ done: 1, total: 3 })
  })

  it('handles an empty task list', () => {
    expect(getTaskSummary([])).toEqual({ done: 0, total: 0 })
  })
})

describe('getGoalsSummary', () => {
  it('counts completed and total goals', () => {
    const goals = [
      goal({ status: 'completed' }),
      goal({ id: 'b', status: 'active' }),
      goal({ id: 'c', status: 'draft' }),
    ]
    expect(getGoalsSummary(goals)).toEqual({ completed: 1, total: 3 })
  })
})

describe('getActiveGoal and getFirstDraftGoal', () => {
  it('returns the active goal', () => {
    const goals = [
      goal({ status: 'completed' }),
      goal({ id: 'b', status: 'active' }),
    ]
    expect(getActiveGoal(goals)?.id).toBe('b')
  })

  it('returns null when no active goal', () => {
    expect(getActiveGoal([goal({ status: 'completed' })])).toBeNull()
  })

  it('returns the first draft goal', () => {
    const goals = [
      goal({ status: 'completed' }),
      goal({ id: 'b', status: 'draft' }),
      goal({ id: 'c', status: 'draft' }),
    ]
    expect(getFirstDraftGoal(goals)?.id).toBe('b')
  })

  it('returns null when no draft goal', () => {
    expect(getFirstDraftGoal([goal({ status: 'active' })])).toBeNull()
  })
})

describe('formatTaskCountLabel', () => {
  it('formats the done/total label', () => {
    expect(formatTaskCountLabel(2, 5)).toBe('2 of 5 tasks')
  })
})
