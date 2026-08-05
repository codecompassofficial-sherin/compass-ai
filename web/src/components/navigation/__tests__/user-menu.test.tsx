import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { UserMenu } from '@/components/navigation/user-menu'

const { logoutMock } = vi.hoisted(() => ({
  logoutMock: vi.fn(),
}))

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    },
    logout: logoutMock,
  }),
}))

describe('UserMenu', () => {
  beforeEach(() => {
    logoutMock.mockReset()
  })

  it('opens a menu with the user details and actions when activated', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByRole('button', { name: 'Open user menu' }))

    const menu = await screen.findByRole('menu')
    expect(within(menu).getByText('Ada Lovelace')).toBeInTheDocument()
    expect(
      within(menu).getByRole('menuitem', { name: /Sign out/ })
    ).toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    const trigger = screen.getByRole('button', { name: 'Open user menu' })
    trigger.focus()
    await user.keyboard('{Enter}')

    expect(await screen.findByRole('menu')).toBeInTheDocument()
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
  })

  it('activates the sign out item with the keyboard', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    const trigger = screen.getByRole('button', { name: 'Open user menu' })
    trigger.focus()
    await user.keyboard('{Enter}')

    const menu = await screen.findByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: /Sign out/ })).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(logoutMock).toHaveBeenCalledTimes(1)
  })
})
