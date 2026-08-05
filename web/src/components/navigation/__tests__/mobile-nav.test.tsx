import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MouseEvent, ReactNode } from 'react'

import { MobileNav } from '@/components/navigation/mobile-nav'
import { useSidebarStore } from '@/store/sidebar-store'

vi.mock('next/link', () => ({
  default: ({
    href,
    onClick,
    children,
    ...rest
  }: {
    href: string
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
    children: ReactNode
  }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault()
        onClick?.(event)
      }}
      {...rest}
    >
      {children}
    </a>
  ),
}))

describe('MobileNav', () => {
  beforeEach(() => {
    useSidebarStore.setState({ mobileOpen: false })
  })

  it('opens a named dialog when the trigger is activated', async () => {
    const user = userEvent.setup()
    render(<MobileNav />)

    await user.click(
      screen.getByRole('button', { name: 'Open navigation menu' })
    )

    expect(
      await screen.findByRole('dialog', { name: 'Navigation' })
    ).toBeInTheDocument()
    expect(useSidebarStore.getState().mobileOpen).toBe(true)
  })

  it('closes the sheet when a navigation link is clicked', async () => {
    const user = userEvent.setup()
    render(<MobileNav />)
    useSidebarStore.setState({ mobileOpen: true })

    const dashboardLink = await screen.findByRole('link', {
      name: /Dashboard/,
    })
    await user.click(dashboardLink)

    expect(useSidebarStore.getState().mobileOpen).toBe(false)
  })

  it('closes the sheet when Escape is pressed', async () => {
    const user = userEvent.setup()
    render(<MobileNav />)
    useSidebarStore.setState({ mobileOpen: true })

    await screen.findByRole('dialog', { name: 'Navigation' })
    await user.keyboard('{Escape}')

    expect(useSidebarStore.getState().mobileOpen).toBe(false)
  })

  it('announces the open state on the trigger via aria-expanded', async () => {
    const user = userEvent.setup()
    render(<MobileNav />)

    const trigger = screen.getByRole('button', { name: 'Open navigation menu' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
