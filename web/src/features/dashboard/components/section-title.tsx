import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SectionTitleProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  className?: string
}

export function SectionTitle({
  title,
  description,
  icon: Icon,
  action,
  className,
}: SectionTitleProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="flex items-center gap-2">
        {Icon && (
          <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md">
            <Icon className="size-3.5" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="font-heading text-sm font-semibold tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground text-xs">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
