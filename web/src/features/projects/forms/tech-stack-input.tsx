'use client'

import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

import { Input } from '@/components/ui/input'

interface TechStackInputProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  placeholder?: string
}

export function TechStackInput({
  value,
  onChange,
  disabled,
  placeholder = 'Type a technology and press Enter',
}: TechStackInputProps) {
  const [text, setText] = useState('')

  function addChip() {
    const trimmed = text.trim()
    if (!trimmed) {
      return
    }
    const exists = value.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    )
    if (!exists) {
      onChange([...value, trimmed])
    }
    setText('')
  }

  function removeChip(index: number) {
    onChange(value.filter((_, itemIndex) => itemIndex !== index))
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      addChip()
      return
    }
    if (event.key === 'Backspace' && text === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5" aria-live="polite">
        {value.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="border-border bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-4xl border px-2 py-0.5 text-xs font-medium"
          >
            {item}
            <button
              type="button"
              aria-label={`Remove ${item}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => removeChip(index)}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        value={text}
        disabled={disabled}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (text.trim()) {
            addChip()
          }
        }}
        placeholder={placeholder}
      />
    </div>
  )
}
