import { describe, expect, it } from 'vitest'

import type { PublicProject } from '@/features/projects/types/projects.types'
import type { EditProjectFormOutput } from '@/features/projects/validation/projects.validation'
import { buildUpdatePayload } from '@/features/projects/utils/edit-project-payload'

function project(overrides: Partial<PublicProject> = {}): PublicProject {
  return {
    id: 'project-1',
    title: 'Portfolio',
    description: 'My portfolio',
    technologyStack: ['React'],
    githubUrl: 'https://github.com/example/portfolio',
    liveUrl: '',
    status: 'planned',
    relatedGoalIds: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function values(overrides: Partial<EditProjectFormOutput> = {}): EditProjectFormOutput {
  return {
    title: 'Portfolio',
    description: 'My portfolio',
    technologyStack: ['React'],
    githubUrl: 'https://github.com/example/portfolio',
    liveUrl: '',
    ...overrides,
  }
}

describe('buildUpdatePayload', () => {
  it('includes only the status when only the status changes', () => {
    const payload = buildUpdatePayload(values(), project(), 'in_progress')

    expect(payload).toEqual({ status: 'in_progress' })
  })

  it('returns an empty payload when nothing changes', () => {
    const payload = buildUpdatePayload(values(), project(), '')

    expect(payload).toEqual({})
  })

  it('includes status alongside other field changes', () => {
    const payload = buildUpdatePayload(
      values({ title: 'Renamed' }),
      project(),
      'in_progress'
    )

    expect(payload).toEqual({ title: 'Renamed', status: 'in_progress' })
  })

  it('keeps the status out of the payload when no new status is selected', () => {
    const payload = buildUpdatePayload(
      values({ title: 'Renamed' }),
      project(),
      ''
    )

    expect(payload).toEqual({ title: 'Renamed' })
    expect('status' in payload).toBe(false)
  })
})
