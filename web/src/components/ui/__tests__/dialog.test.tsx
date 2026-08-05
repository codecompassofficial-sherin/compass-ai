import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

describe('DialogContent', () => {
  it('constrains the popup to the viewport so tall dialogs scroll internally', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>Form content</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    const popup = document.querySelector('[data-slot="dialog-content"]')
    expect(popup).not.toBeNull()
    expect(popup).toHaveClass('max-h-[calc(100dvh-2rem)]')
    expect(popup).toHaveClass('overflow-y-auto')
    expect(popup).toHaveClass('max-w-[calc(100%-2rem)]')
    expect(screen.getByRole('dialog')).toBe(popup)
  })
})
