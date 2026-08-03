'use client'

import { Diff, History, TriangleAlert } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { GENERATION_REASON_META } from '../constants/roadmap.constants'
import type { RoadmapHistoryEntry } from '../types/roadmap.types'
import { formatDate } from '../utils/roadmap.utils'

interface HistoryPanelProps {
  entries: RoadmapHistoryEntry[]
  isPending: boolean
  isError: boolean
  onRetry: () => void
  onCompare: () => void
}

export function HistoryPanel({
  entries,
  isPending,
  isError,
  onRetry,
  onCompare,
}: HistoryPanelProps) {
  const sorted = [...entries].sort((a, b) => b.version - a.version)
  const canCompare = sorted.length >= 2

  return (
    <Card>
      <CardHeader>
        <CardTitle>Version history</CardTitle>
        <CardDescription>
          Every version of your roadmap, from your first generation onward.
        </CardDescription>
        <CardAction>
          <Button
            size="sm"
            variant="outline"
            onClick={onCompare}
            disabled={!canCompare}
          >
            <Diff />
            Compare
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <TriangleAlert className="text-destructive size-5" />
            <p className="text-muted-foreground text-sm">
              Something went wrong loading your version history.
            </p>
            <Button size="sm" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <History className="text-muted-foreground size-5" />
            <p className="text-muted-foreground text-sm">
              No previous versions yet. Regenerate your roadmap to create one.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {sorted.map((entry) => (
              <li
                key={entry.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-2 py-2',
                  entry.status === 'active' && 'bg-muted/50'
                )}
              >
                <Badge
                  variant={entry.status === 'active' ? 'default' : 'outline'}
                  className="shrink-0"
                >
                  v{entry.version}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {GENERATION_REASON_META[entry.reason].label}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(entry.generatedAt)}
                  </p>
                </div>
                {entry.status === 'active' && (
                  <span className="text-muted-foreground shrink-0 text-xs">
                    Current
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
