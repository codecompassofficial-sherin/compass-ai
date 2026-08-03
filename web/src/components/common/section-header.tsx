import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  className?: string
}

export function SectionHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="bg-muted/50 text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg border">
            <Icon className="size-4" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="font-heading text-lg font-semibold tracking-tight sm:text-xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-0.5 text-sm">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
