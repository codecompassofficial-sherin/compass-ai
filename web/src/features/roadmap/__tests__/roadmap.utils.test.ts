import { describe, expect, it } from 'vitest'

import { ApiError } from '@/lib/api'
import type {
  PublicGoalInstance,
  RoadmapPhase,
} from '@/features/roadmap/types/roadmap.types'
import {
  computePhaseStatuses,
  formatDate,
  formatDateTime,
  formatEffort,
  getCompletedPhaseCount,
  getCurrentPhaseKey,
  getPhaseGoalCounts,
  getRoadmapProgress,
  getRoadmapTitle,
  groupGoalsByPhase,
  isAssessmentRequiredError,
  isNoActiveRoadmap,
} from '@/features/roadmap/utils/roadmap.utils'

const phases: RoadmapPhase[] = [
  { key: 'foundation', name: 'Foundations', description: '', order: 1 },
  { key: 'core-skills', name: 'Core Skills', description: '', order: 2 },
  { key: 'projects', name: 'Project Work', description: '', order: 3 },
]

function goal(overrides: Partial<PublicGoalInstance> = {}): PublicGoalInstance {
  return {
    id: 'goal-1',
    phaseKey: 'foundation',
    order: 1,
    templateKey: 'template-1',
    templateVersion: '1.0.0',
    title: 'Test goal',
    description: '',
    skillTargets: [],
    prerequisites: [],
    estimatedEffortHours: 4,
    bindings: { technologyPreferences: [], currentSkills: [] },
    status: 'draft',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function roadmapError(code: string): ApiError {
  return new ApiError(404, 'Not found', {
    success: false,
    error: { message: 'Not found', code },
  })
}

describe('groupGoalsByPhase', () => {
  it('groups goals and orders them by phase order then goal order', () => {
    const goals = [
      goal({ id: 'b', phaseKey: 'core-skills', order: 2 }),
      goal({ id: 'a', phaseKey: 'foundation', order: 3 }),
      goal({ id: 'c', phaseKey: 'foundation', order: 1 }),
      goal({ id: 'd', phaseKey: 'projects', order: 1 }),
    ]
    const grouped = groupGoalsByPhase(phases, goals)

    expect([...grouped.keys()]).toEqual([
      'foundation',
      'core-skills',
      'projects',
    ])
    expect(grouped.get('foundation')?.map((g) => g.id)).toEqual(['c', 'a'])
  })
})

describe('computePhaseStatuses', () => {
  it('marks the first phase with open goals as current', () => {
    const goals = [
      goal({ phaseKey: 'foundation', status: 'completed' }),
      goal({ phaseKey: 'core-skills', status: 'draft' }),
    ]
    const statuses = computePhaseStatuses(phases, goals)

    expect(statuses.get('foundation')).toBe('completed')
    expect(statuses.get('core-skills')).toBe('current')
    expect(statuses.get('projects')).toBe('upcoming')
  })

  it('marks every phase completed when all goals are completed', () => {
    const goals = [
      goal({ id: 'a', phaseKey: 'foundation', status: 'completed' }),
      goal({ id: 'b', phaseKey: 'core-skills', status: 'completed' }),
      goal({ id: 'c', phaseKey: 'projects', status: 'completed' }),
    ]
    const statuses = computePhaseStatuses(phases, goals)

    for (const status of statuses.values()) {
      expect(status).toBe('completed')
    }
  })

  it('treats empty phases as upcoming', () => {
    const statuses = computePhaseStatuses(phases, [
      goal({ phaseKey: 'foundation', status: 'completed' }),
    ])

    expect(statuses.get('core-skills')).toBe('upcoming')
  })
})

describe('getCurrentPhaseKey', () => {
  it('returns the first phase with a non-completed goal', () => {
    const grouped = groupGoalsByPhase(phases, [
      goal({ phaseKey: 'foundation', status: 'completed' }),
      goal({ phaseKey: 'core-skills', status: 'active' }),
    ])
    expect(getCurrentPhaseKey(phases, grouped)).toBe('core-skills')
  })

  it('returns null when every phase is completed', () => {
    const grouped = groupGoalsByPhase(phases, [
      goal({ id: 'a', phaseKey: 'foundation', status: 'completed' }),
      goal({ id: 'b', phaseKey: 'core-skills', status: 'completed' }),
    ])
    expect(getCurrentPhaseKey(phases, grouped)).toBeNull()
  })
})

describe('phase progress helpers', () => {
  it('counts completed phases', () => {
    const goals = [
      goal({ id: 'a', phaseKey: 'foundation', status: 'completed' }),
      goal({ id: 'b', phaseKey: 'core-skills', status: 'draft' }),
    ]
    expect(getCompletedPhaseCount(phases, goals)).toBe(1)
  })

  it('computes progress as a rounded percentage', () => {
    const goals = [
      goal({ id: 'a', phaseKey: 'foundation', status: 'completed' }),
      goal({ id: 'b', phaseKey: 'core-skills', status: 'draft' }),
    ]
    expect(getRoadmapProgress(phases, goals)).toBe(33)
  })

  it('returns zero progress for an empty roadmap', () => {
    expect(getRoadmapProgress([], [])).toBe(0)
  })

  it('counts completed and total goals', () => {
    const goals = [
      goal({ id: 'a', status: 'completed' }),
      goal({ id: 'b', status: 'active' }),
      goal({ id: 'c', status: 'draft' }),
    ]
    expect(getPhaseGoalCounts(goals)).toEqual({ completed: 1, total: 3 })
  })
})

describe('formatters', () => {
  it('formats effort under a day in hours', () => {
    expect(formatEffort(4)).toBe('4 hrs')
  })

  it('formats effort of a day or more as days', () => {
    expect(formatEffort(8)).toBe('~1 days')
    expect(formatEffort(20)).toBe('~3 days')
  })

  it('formats dates', () => {
    const value = '2026-03-12T10:30:00.000Z'
    expect(formatDate(value)).toContain('2026')
    expect(formatDateTime(value)).toContain('2026')
  })
})

describe('getRoadmapTitle', () => {
  it('builds the title from the target role', () => {
    const roadmap = {
      assessmentSnapshot: { targetRole: 'Frontend Developer' },
    } as never
    expect(getRoadmapTitle(roadmap)).toBe('Frontend Developer Roadmap')
  })
})

describe('error guards', () => {
  it('detects NO_ACTIVE_ROADMAP', () => {
    expect(isNoActiveRoadmap(roadmapError('NO_ACTIVE_ROADMAP'))).toBe(true)
    expect(isNoActiveRoadmap(roadmapError('ROADMAP_NOT_FOUND'))).toBe(false)
    expect(isNoActiveRoadmap(new Error('boom'))).toBe(false)
  })

  it('detects ROADMAP_ASSESSMENT_REQUIRED', () => {
    expect(
      isAssessmentRequiredError(roadmapError('ROADMAP_ASSESSMENT_REQUIRED'))
    ).toBe(true)
    expect(isAssessmentRequiredError(roadmapError('NO_ACTIVE_ROADMAP'))).toBe(
      false
    )
  })
})
