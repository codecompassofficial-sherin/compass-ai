import { describe, expect, it } from 'vitest'

import {
  assessmentFormSchema,
  type AssessmentFormValues,
} from '@/features/assessment/assessment.validation'

const validValues: AssessmentFormValues = {
  targetRole: 'Frontend Developer',
  experienceLevel: 'Intermediate',
  technologyPreferences: ['MERN', 'React Native'],
  currentSkills: ['JavaScript', 'React'],
  primaryCareerGoal: 'First Tech Role',
  targetTimeline: '6 Months',
  additionalNotes: '',
}

describe('assessmentFormSchema', () => {
  it('accepts a complete valid assessment', () => {
    const result = assessmentFormSchema.safeParse(validValues)
    expect(result.success).toBe(true)
  })

  it('requires a target role', () => {
    const result = assessmentFormSchema.safeParse({
      ...validValues,
      targetRole: undefined,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Choose the role you are targeting'
      )
    }
  })

  it('rejects an unknown target role', () => {
    const result = assessmentFormSchema.safeParse({
      ...validValues,
      targetRole: 'Designer',
    })
    expect(result.success).toBe(false)
  })

  it('requires at least one technology preference', () => {
    const result = assessmentFormSchema.safeParse({
      ...validValues,
      technologyPreferences: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Choose at least one technology preference'
      )
    }
  })

  it('rejects a duplicate technology preference', () => {
    const result = assessmentFormSchema.safeParse({
      ...validValues,
      technologyPreferences: ['MERN', 'MERN'],
    })
    expect(result.success).toBe(false)
  })

  it('allows an empty current skills list', () => {
    const result = assessmentFormSchema.safeParse({
      ...validValues,
      currentSkills: [],
    })
    expect(result.success).toBe(true)
  })

  it('requires a primary career goal', () => {
    const result = assessmentFormSchema.safeParse({
      ...validValues,
      primaryCareerGoal: undefined,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Choose your primary career goal'
      )
    }
  })

  it('requires a target timeline', () => {
    const result = assessmentFormSchema.safeParse({
      ...validValues,
      targetTimeline: undefined,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Choose your target timeline')
    }
  })

  it('accepts notes up to 500 characters and rejects longer ones', () => {
    const atLimit = assessmentFormSchema.safeParse({
      ...validValues,
      additionalNotes: 'a'.repeat(500),
    })
    expect(atLimit.success).toBe(true)

    const overLimit = assessmentFormSchema.safeParse({
      ...validValues,
      additionalNotes: 'a'.repeat(501),
    })
    expect(overLimit.success).toBe(false)
    if (!overLimit.success) {
      expect(overLimit.error.issues[0].message).toBe(
        'Notes must be under 500 characters'
      )
    }
  })
})
