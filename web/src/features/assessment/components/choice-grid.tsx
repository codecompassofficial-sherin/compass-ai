'use client'

import { CheckIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface ChoiceOption {
  value: string
  label: string
  description?: string
  icon?: LucideIcon
}

interface ChoiceCardProps {
  option: ChoiceOption
  selected: boolean
  onSelect: () => void
  disabled?: boolean
}

const GRID_COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
} as const

interface ChoiceGridProps {
  options: ChoiceOption[]
  value?: string | null
  onChange: (value: string) => void
  columns?: keyof typeof GRID_COLUMNS
  disabled?: boolean
  className?: string
}

function ChoiceCard({ option, selected, onSelect, disabled }: ChoiceCardProps) {
  const Icon = option.icon
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'relative flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors outline-none',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3',
        'disabled:pointer-events-none disabled:opacity-50',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-input hover:border-foreground/20 hover:bg-accent/60 dark:border-input dark:hover:bg-input/50'
      )}
    >
      {Icon && (
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-md transition-colors',
            selected
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Icon className="size-4" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{option.label}</span>
        {option.description && (
          <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
            {option.description}
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted-foreground/30'
        )}
      >
        {selected && <CheckIcon className="size-3" />}
      </span>
    </button>
  )
}

export function ChoiceGrid({
  options,
  value,
  onChange,
  columns = 2,
  disabled,
  className,
}: ChoiceGridProps) {
  return (
    <div
      role="group"
      className={cn('grid gap-2', GRID_COLUMNS[columns], className)}
    >
      {options.map((option) => (
        <ChoiceCard
          key={option.value}
          option={option}
          selected={option.value === value}
          onSelect={() => onChange(option.value)}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
