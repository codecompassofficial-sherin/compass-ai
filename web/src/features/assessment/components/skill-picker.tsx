'use client'

import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SkillPickerProps {
  options: readonly string[]
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  className?: string
}

function toggle(values: string[], item: string): string[] {
  return values.includes(item)
    ? values.filter((value) => value !== item)
    : [...values, item]
}

export function SkillPicker({
  options,
  value,
  onChange,
  disabled,
  className,
}: SkillPickerProps) {
  return (
    <div role="group" className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const selected = value.includes(option)
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(toggle(value, option))}
            disabled={disabled}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors outline-none',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3',
              'disabled:pointer-events-none disabled:opacity-50',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground dark:border-input dark:hover:bg-input/50'
            )}
          >
            {selected && <CheckIcon className="size-3.5" />}
            {option}
          </button>
        )
      })}
    </div>
  )
}
