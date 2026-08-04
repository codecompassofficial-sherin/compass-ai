import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EditProjectDialog } from '@/features/projects/dialogs/edit-project-dialog'
import type { PublicProject } from '@/features/projects/types/projects.types'

const { updateProjectMock, toastSuccessMock } = vi.hoisted(() => ({
  updateProjectMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}))

vi.mock('@/features/projects/hooks/useProjects', () => ({
  useUpdateProject: () => ({
    mutateAsync: updateProjectMock,
    isPending: false,
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: vi.fn(),
  },
}))

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

describe('EditProjectDialog', () => {
  beforeEach(() => {
    updateProjectMock.mockReset()
    toastSuccessMock.mockReset()
  })

  it('keeps the save button disabled when nothing has changed', () => {
    render(
      <EditProjectDialog project={project()} open onOpenChange={vi.fn()} />
    )

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
  })

  it('enables save and submits only the new status when the status changes', async () => {
    const user = userEvent.setup()
    render(
      <EditProjectDialog project={project()} open onOpenChange={vi.fn()} />
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(
      await screen.findByRole('option', { name: 'In progress' })
    )

    const save = screen.getByRole('button', { name: 'Save changes' })
    expect(save).toBeEnabled()

    await user.click(save)

    await waitFor(() => {
      expect(updateProjectMock).toHaveBeenCalledWith({
        id: 'project-1',
        input: { status: 'in_progress' },
      })
    })
    expect(toastSuccessMock).toHaveBeenCalled()
  })
})
