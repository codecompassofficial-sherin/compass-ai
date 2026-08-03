import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/feedback/empty-state'
import { Progress } from '@/components/ui/progress'
import type { LucideIcon } from 'lucide-react'

interface ProgressCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  value: number
  max: number
  percent: number
  footer?: React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
}

export function ProgressCard({
  title,
  description,
  icon: Icon,
  value,
  max,
  percent,
  footer,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: ProgressCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="text-muted-foreground size-4" />}
          {title}
        </CardTitle>
        {description && (
          <p className="text-muted-foreground text-xs">{description}</p>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {max <= 0 && emptyTitle ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
            className="px-4 py-8"
          />
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Progress value={percent} className="flex-1" />
              <span className="text-muted-foreground w-10 text-right text-sm font-medium tabular-nums">
                {percent}%
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              {value} of {max} complete
            </p>
            {footer}
          </>
        )}
      </CardContent>
    </Card>
  )
}
