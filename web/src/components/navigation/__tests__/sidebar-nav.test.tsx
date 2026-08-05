import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MouseEvent, ReactNode } from 'react'

import { SidebarNav } from '@/components/navigation/sidebar-nav'

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

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

describe('SidebarNav', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders a named navigation landmark with the app links', () => {
    render(<SidebarNav />)

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(
      within(nav).getByRole('link', { name: /Dashboard/ })
    ).toHaveAttribute('href', '/dashboard')
    expect(within(nav).getByRole('link', { name: /Roadmaps/ })).toHaveAttribute(
      'href',
      '/roadmaps'
    )
  })

  it('marks the link for the current page with aria-current', () => {
    render(<SidebarNav />)

    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(
      screen.getByRole('link', { name: /Assessments/ })
    ).not.toHaveAttribute('aria-current')
  })

  it('is keyboard-navigable: Tab moves forward and Shift+Tab moves back', async () => {
    const user = userEvent.setup()
    render(<SidebarNav />)

    await user.tab()
    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('link', { name: /Assessments/ })).toHaveFocus()

    await user.tab({ shift: true })
    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveFocus()
  })

  it('keeps a collapsed icon-only link accessible by name', () => {
    render(<SidebarNav collapsed />)

    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveAttribute(
      'aria-label',
      'Dashboard'
    )
  })
})
