import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { useForm } from 'react-hook-form'

import { Form } from '@/components/ui/form'
import type { AssessmentFormValues } from '@/features/assessment/assessment.validation'
import { ReviewStep } from '@/features/assessment/components/steps/review-step'

function ReviewStepHarness() {
  const form = useForm<AssessmentFormValues>({
    defaultValues: {
      targetRole: 'Full Stack Developer',
      experienceLevel: 'Intermediate',
      technologyPreferences: ['MERN'],
      currentSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      primaryCareerGoal: 'Career Advancement',
      targetTimeline: '12 Months',
      additionalNotes: '',
    },
  })

  return (
    <Form {...form}>
      <ReviewStep onEditStep={vi.fn()} />
    </Form>
  )
}

describe('ReviewStep', () => {
  it('shows the full answer value instead of truncating it at narrow widths', () => {
    render(<ReviewStepHarness />)

    const row = screen.getByText('Target role').closest('li')
    expect(row).not.toBeNull()

    const value = within(row!).getByText('Full Stack Developer')
    expect(value).toHaveClass('break-words')
    expect(value).not.toHaveClass('truncate')
  })

  it('lets the row label shrink so it cannot starve the value column', () => {
    render(<ReviewStepHarness />)

    const label = screen.getByText('Technology preferences')
    expect(label).not.toHaveClass('shrink-0')
    expect(label).toHaveClass('shrink')
  })
})
