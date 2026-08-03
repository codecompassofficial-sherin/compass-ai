import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn('transition-all duration-200 hover:shadow-sm', className)}
    >
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-medium">{label}</p>
          <p className="font-heading mt-1 text-2xl font-semibold tracking-tight">
            {value}
          </p>
          {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
        </div>
        <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-4" />
        </span>
      </CardContent>
    </Card>
  )
}
