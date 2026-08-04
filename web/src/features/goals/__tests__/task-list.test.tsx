import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TaskList } from '@/features/goals/components/task-list'
import type { PublicTask, TaskStatus } from '@/features/goals/types/goals.types'

function task(overrides: Partial<PublicTask> = {}): PublicTask {
  return {
    id: 'task-1',
    goalId: 'goal-1',
    roadmapId: 'roadmap-1',
    order: 1,
    title: 'Learn React state',
    description: 'Build a counter',
    estimatedEffortHours: 2,
    templateVersion: '1.0.0',
    status: 'todo',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('TaskList', () => {
  it('renders a Start button for todo tasks and reports the transition', async () => {
    const user = userEvent.setup()
    const onUpdateStatus = vi.fn<(taskId: string, status: TaskStatus) => void>()

    render(
      <TaskList
        tasks={[task()]}
        onUpdateStatus={onUpdateStatus}
      />
    )

    await user.click(screen.getByRole('button', { name: /start/i }))
    expect(onUpdateStatus).toHaveBeenCalledWith('task-1', 'in_progress')
  })

  it('renders a Mark done button for in_progress tasks', async () => {
    const user = userEvent.setup()
    const onUpdateStatus = vi.fn<(taskId: string, status: TaskStatus) => void>()

    render(
      <TaskList
        tasks={[task({ status: 'in_progress' })]}
        onUpdateStatus={onUpdateStatus}
      />
    )

    await user.click(screen.getByRole('button', { name: /mark done/i }))
    expect(onUpdateStatus).toHaveBeenCalledWith('task-1', 'done')
  })

  it('renders no action button for done tasks', () => {
    render(
      <TaskList
        tasks={[task({ status: 'done' })]}
        onUpdateStatus={vi.fn()}
      />
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('disables the action button while the task is being updated', () => {
    render(
      <TaskList
        tasks={[task(), task({ id: 'task-2', order: 2, status: 'in_progress' })]}
        onUpdateStatus={vi.fn()}
        pendingTaskIds={new Set(['task-1', 'task-2'])}
      />
    )

    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /mark done/i })
    ).toBeDisabled()
  })
})
