import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface RecommendationCardProps {
  icon: LucideIcon
  title: string
  description?: string
  meta?: React.ReactNode
  className?: string
}

export function RecommendationCard({
  icon: Icon,
  title,
  description,
  meta,
  className,
}: RecommendationCardProps) {
  return (
    <Card
      size="sm"
      className={cn('transition-all duration-200 hover:shadow-sm', className)}
    >
      <CardContent className="flex items-start gap-3">
        <span className="bg-muted text-muted-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">{title}</p>
            {meta && <div className="shrink-0">{meta}</div>}
          </div>
          {description && (
            <p className="text-muted-foreground mt-1 text-xs">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
