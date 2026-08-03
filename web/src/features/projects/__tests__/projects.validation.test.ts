import { describe, expect, it } from 'vitest'

import {
  createProjectSchema,
  editProjectSchema,
  updateProjectSchema,
} from '@/features/projects/validation/projects.validation'

describe('createProjectSchema', () => {
  it('accepts a valid project', () => {
    const result = createProjectSchema.safeParse({
      title: 'Portfolio',
      description: 'My portfolio',
      technologyStack: ['React', 'TypeScript'],
      githubUrl: 'https://github.com/example/portfolio',
      liveUrl: 'https://example.com',
      status: 'in_progress',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Portfolio')
      expect(result.data.githubUrl).toBe('https://github.com/example/portfolio')
    }
  })

  it('transforms empty optional strings into undefined', () => {
    const result = createProjectSchema.safeParse({
      title: 'Portfolio',
      description: '',
      technologyStack: ['React'],
      githubUrl: '',
      liveUrl: '',
      status: 'planned',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeUndefined()
      expect(result.data.githubUrl).toBeUndefined()
      expect(result.data.liveUrl).toBeUndefined()
    }
  })

  it('rejects an empty title', () => {
    const result = createProjectSchema.safeParse({
      title: '   ',
      technologyStack: ['React'],
      status: 'planned',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty technology stack', () => {
    const result = createProjectSchema.safeParse({
      title: 'Portfolio',
      technologyStack: [],
      status: 'planned',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid URL', () => {
    const result = createProjectSchema.safeParse({
      title: 'Portfolio',
      technologyStack: ['React'],
      githubUrl: 'not-a-url',
      status: 'planned',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown status', () => {
    const result = createProjectSchema.safeParse({
      title: 'Portfolio',
      technologyStack: ['React'],
      status: 'shipped',
    })
    expect(result.success).toBe(false)
  })
})

describe('editProjectSchema', () => {
  it('accepts an edit without status', () => {
    const result = editProjectSchema.safeParse({
      title: 'Renamed',
      technologyStack: ['React'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid URL when provided', () => {
    const result = editProjectSchema.safeParse({
      technologyStack: ['React'],
      liveUrl: 'broken',
    })
    expect(result.success).toBe(false)
  })

  it('allows a project without optional fields', () => {
    const result = editProjectSchema.safeParse({
      title: 'Just a title',
    })
    expect(result.success).toBe(true)
  })
})

describe('updateProjectSchema', () => {
  it('requires at least one field', () => {
    const result = updateProjectSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('accepts a partial update', () => {
    const result = updateProjectSchema.safeParse({ status: 'completed' })
    expect(result.success).toBe(true)
  })
})
