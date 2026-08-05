import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SkipToContent } from '@/components/common/skip-link'

describe('SkipToContent', () => {
  it('renders a visually hidden skip link', () => {
    render(
      <>
        <SkipToContent />
        <main id="main" tabIndex={-1}>
          Content
        </main>
      </>
    )

    const link = screen.getByRole('link', { name: 'Skip to content' })
    expect(link).toHaveAttribute('href', '#main')
    expect(link.className).toContain('sr-only')
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1')
  })

  it('moves focus to the main content when activated', async () => {
    const user = userEvent.setup()
    render(
      <>
        <SkipToContent />
        <main id="main" tabIndex={-1}>
          Content
        </main>
      </>
    )

    const main = screen.getByRole('main')
    await user.click(screen.getByRole('link', { name: 'Skip to content' }))

    expect(main).toHaveFocus()
  })

  it('is the first focusable element in tab order', async () => {
    const user = userEvent.setup()
    render(
      <>
        <SkipToContent />
        <main id="main" tabIndex={-1}>
          <button>Inside main</button>
        </main>
      </>
    )

    await user.tab()

    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveFocus()
  })
})
