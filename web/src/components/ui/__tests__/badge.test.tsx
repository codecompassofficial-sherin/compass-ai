import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('caps the badge width so long content never overflows its container', () => {
    render(
      <Badge>A very long skill name that must never overflow its container</Badge>
    )

    const badge = screen.getByText(/very long skill name/)
    expect(badge).toHaveClass('max-w-full')
    expect(badge).toHaveClass('overflow-hidden')
    expect(badge).toHaveClass('whitespace-nowrap')
  })
})
