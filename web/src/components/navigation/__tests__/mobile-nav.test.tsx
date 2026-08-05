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
    useSidebarStore.setState({ mobileOpen: true })
  })

  it('closes the sheet when a navigation link is clicked', async () => {
    const user = userEvent.setup()
    render(<MobileNav />)

    const dashboardLink = await screen.findByRole('link', {
      name: /Dashboard/,
    })
    await user.click(dashboardLink)

    expect(useSidebarStore.getState().mobileOpen).toBe(false)
  })
})
