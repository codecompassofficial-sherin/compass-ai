import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AssessmentWizard } from '@/features/assessment/components/assessment-wizard'
import { readDraft } from '@/features/assessment/lib/draft'
import type { AssessmentFormValues } from '@/features/assessment/assessment.validation'

const { createMock, updateMock, toastSuccessMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  updateMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}))

const { pushMock, refreshMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
}))

vi.mock('@/features/assessment/hooks/useAssessment', () => ({
  useCreateAssessment: () => ({ mutateAsync: createMock, isPending: false }),
  useUpdateAssessment: () => ({ mutateAsync: updateMock, isPending: false }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    refresh: refreshMock,
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: vi.fn(),
  },
}))

const DRAFT_KEY = 'compass-ai:assessment-draft'

function seedDraft(
  stepIndex: number,
  values: Partial<AssessmentFormValues>
): void {
  window.sessionStorage.setItem(
    DRAFT_KEY,
    JSON.stringify({ stepIndex, values })
  )
}

describe('AssessmentWizard', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    createMock.mockReset()
    updateMock.mockReset()
    toastSuccessMock.mockReset()
    pushMock.mockReset()
    refreshMock.mockReset()
    createMock.mockResolvedValue({})
    updateMock.mockResolvedValue({})
  })

  it('restores a saved draft step and values on mount', async () => {
    seedDraft(4, {
      primaryCareerGoal: 'Career Switch',
      targetTimeline: '6 Months',
    })

    render(<AssessmentWizard />)

    expect(await screen.findByText('Step 5 of 6')).toBeInTheDocument()
    expect(
      await screen.findByRole(
        'button',
        { name: /Career Switch/ },
        { timeout: 5000 }
      )
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: /6 Months/ })
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('persists entered values to the draft', async () => {
    const user = userEvent.setup()
    render(<AssessmentWizard />)

    await user.click(screen.getByRole('button', { name: /Backend Developer/ }))

    await waitFor(() => {
      expect(readDraft()?.values.targetRole).toBe('Backend Developer')
    })
  })

  it('persists the current step after continuing', async () => {
    const user = userEvent.setup()
    render(<AssessmentWizard />)

    await user.click(screen.getByRole('button', { name: /Backend Developer/ }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      expect(readDraft()?.stepIndex).toBe(1)
    })
    expect(readDraft()?.values.targetRole).toBe('Backend Developer')
  })

  it('advances only one step when Continue is double-clicked', async () => {
    const user = userEvent.setup()
    render(<AssessmentWizard />)

    await user.click(screen.getByRole('button', { name: /Backend Developer/ }))
    await user.dblClick(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByText('Step 2 of 6')).toBeInTheDocument()
    expect(screen.queryByText('Step 3 of 6')).not.toBeInTheDocument()
  })

  it('does not skip the current-skills step when it is pre-filled', async () => {
    const user = userEvent.setup()
    seedDraft(0, { currentSkills: [] })
    render(<AssessmentWizard />)

    await user.click(screen.getByRole('button', { name: /Backend Developer/ }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(await screen.findByRole('button', { name: /Intermediate/ }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(await screen.findByRole('button', { name: /React Native/ }))
    await user.dblClick(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByText('Step 4 of 6')).toBeInTheDocument()
    expect(screen.queryByText('Step 5 of 6')).not.toBeInTheDocument()
  })

  it('does not skip the current-skills step on a rapid second click', async () => {
    const user = userEvent.setup()
    render(<AssessmentWizard />)

    await user.click(screen.getByRole('button', { name: /Backend Developer/ }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(await screen.findByRole('button', { name: /Intermediate/ }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(await screen.findByRole('button', { name: /React Native/ }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByText('Step 4 of 6')).toBeInTheDocument()

    await new Promise((resolve) => setTimeout(resolve, 50))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByText('Step 4 of 6')).toBeInTheDocument()
    expect(screen.queryByText('Step 5 of 6')).not.toBeInTheDocument()
  })

  it('clears the draft after a successful save', async () => {
    const user = userEvent.setup()
    seedDraft(5, {
      targetRole: 'Backend Developer',
      experienceLevel: 'Intermediate',
      technologyPreferences: ['React Native'],
      currentSkills: [],
      primaryCareerGoal: 'Career Switch',
      targetTimeline: '6 Months',
    })

    render(<AssessmentWizard />)

    await user.click(
      await screen.findByRole('button', { name: 'Save assessment' })
    )

    await waitFor(() => {
      expect(window.sessionStorage.getItem(DRAFT_KEY)).toBeNull()
    })
    expect(createMock).toHaveBeenCalledTimes(1)
    expect(toastSuccessMock).toHaveBeenCalledWith('Assessment saved')
  })

  it('submits only once when Save assessment is double-clicked', async () => {
    const user = userEvent.setup()
    seedDraft(5, {
      targetRole: 'Backend Developer',
      experienceLevel: 'Intermediate',
      technologyPreferences: ['React Native'],
      currentSkills: [],
      primaryCareerGoal: 'Career Switch',
      targetTimeline: '6 Months',
    })
    render(<AssessmentWizard />)

    await user.dblClick(
      await screen.findByRole('button', { name: 'Save assessment' })
    )

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      expect(window.sessionStorage.getItem(DRAFT_KEY)).toBeNull()
    })
    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/roadmaps')
    expect(toastSuccessMock).toHaveBeenCalledTimes(1)
  })
})
