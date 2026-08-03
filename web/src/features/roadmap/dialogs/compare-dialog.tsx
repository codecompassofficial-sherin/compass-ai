'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  ArrowRightLeft,
  GitCommitVertical,
  Plus,
  Trash2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { getRoadmapErrorDetails } from '../api/roadmap.api'
import { GENERATION_REASON_META } from '../constants/roadmap.constants'
import { useRoadmapCompare } from '../hooks/useRoadmapCompare'
import type {
  PublicGoalInstance,
  RoadmapHistoryEntry,
} from '../types/roadmap.types'
import { formatEffort } from '../utils/roadmap.utils'

interface CompareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entries: RoadmapHistoryEntry[]
}

function prettifyPhaseKey(phaseKey: string): string {
  return phaseKey
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function CompareDialog({
  open,
  onOpenChange,
  entries,
}: CompareDialogProps) {
  const sortedAsc = useMemo(
    () => [...entries].sort((a, b) => a.version - b.version),
    [entries]
  )
  const [fromVersion, setFromVersion] = useState<number | null>(null)
  const [toVersion, setToVersion] = useState<number | null>(null)

  useEffect(() => {
    if (open && sortedAsc.length >= 2 && fromVersion === null && toVersion === null) {
      setFromVersion(sortedAsc[sortedAsc.length - 2].version)
      setToVersion(sortedAsc[sortedAsc.length - 1].version)
    }
  }, [open, sortedAsc, fromVersion, toVersion])

  const compare = useRoadmapCompare(fromVersion, toVersion)

  const fromOptions = useMemo(
    () =>
      toVersion === null
        ? sortedAsc
        : sortedAsc.filter((entry) => entry.version < toVersion),
    [sortedAsc, toVersion]
  )
  const toOptions = useMemo(
    () =>
      fromVersion === null
        ? sortedAsc
        : sortedAsc.filter((entry) => entry.version > fromVersion),
    [sortedAsc, fromVersion]
  )

  function handleFromChange(value: string | null) {
    if (value === null) {
      return
    }
    const next = Number(value)
    setFromVersion(next)
    if (toVersion !== null && next >= toVersion) {
      const candidate = fromOptions.filter(
        (entry) => entry.version > next
      )[0]
      setToVersion(candidate?.version ?? null)
    }
  }

  function handleToChange(value: string | null) {
    if (value === null) {
      return
    }
    const next = Number(value)
    setToVersion(next)
    if (fromVersion !== null && next <= fromVersion) {
      const candidates = toOptions.filter((entry) => entry.version < next)
      setFromVersion(
        candidates[candidates.length - 1]?.version ?? null
      )
    }
  }

  const toEntry = entries.find((entry) => entry.version === toVersion)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compare versions</DialogTitle>
          <DialogDescription>
            See what changed between two versions of your roadmap.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs font-medium">
              From
            </span>
            <Select
              value={fromVersion === null ? null : String(fromVersion)}
              onValueChange={handleFromChange}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Version" />
              </SelectTrigger>
              <SelectContent>
                {fromOptions.map((entry) => (
                  <SelectItem key={entry.id} value={String(entry.version)}>
                    v{entry.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ArrowRight className="text-muted-foreground mb-2 size-4" />

          <div className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs font-medium">To</span>
            <Select
              value={toVersion === null ? null : String(toVersion)}
              onValueChange={handleToChange}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Version" />
              </SelectTrigger>
              <SelectContent>
                {toOptions.map((entry) => (
                  <SelectItem key={entry.id} value={String(entry.version)}>
                    v{entry.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {toEntry && (
          <p className="text-muted-foreground text-xs">
            {GENERATION_REASON_META[toEntry.reason].description}
          </p>
        )}

        <div className="flex flex-col gap-4">
          {fromVersion === null || toVersion === null ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Choose two versions to see what changed.
            </p>
          ) : compare.isPending ? (
            <div className="flex flex-col gap-3 py-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          ) : compare.isError ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <p className="text-muted-foreground text-sm">
                {getRoadmapErrorDetails(compare.error)}
              </p>
              <Button size="sm" variant="outline" onClick={() => void compare.refetch()}>
                Try again
              </Button>
            </div>
          ) : (
            compare.data && (
              <CompareResult
                fromVersion={fromVersion}
                toVersion={toVersion}
                added={compare.data.diff.addedGoals}
                removed={compare.data.diff.removedGoals}
                unchanged={compare.data.diff.unchangedGoals}
                phaseStructureChanged={compare.data.diff.phaseStructureChanged}
              />
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface CompareResultProps {
  fromVersion: number
  toVersion: number
  added: PublicGoalInstance[]
  removed: PublicGoalInstance[]
  unchanged: PublicGoalInstance[]
  phaseStructureChanged: boolean
}

function CompareResult({
  fromVersion,
  toVersion,
  added,
  removed,
  unchanged,
  phaseStructureChanged,
}: CompareResultProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          v{fromVersion} → v{toVersion}
        </span>
        {phaseStructureChanged && (
          <Badge variant="outline">Phase structure changed</Badge>
        )}
      </div>

      <DiffSection
        title="Added goals"
        icon={<Plus className="size-3.5" />}
        goals={added}
        tone="added"
      />
      <DiffSection
        title="Removed goals"
        icon={<Trash2 className="size-3.5" />}
        goals={removed}
        tone="removed"
      />
      <DiffSection
        title="Carried forward"
        icon={<ArrowRightLeft className="size-3.5" />}
        goals={unchanged}
        tone="unchanged"
      />
    </div>
  )
}

type DiffTone = 'added' | 'removed' | 'unchanged'

interface DiffSectionProps {
  title: string
  icon: React.ReactNode
  goals: PublicGoalInstance[]
  tone: DiffTone
}

function DiffSection({ title, icon, goals, tone }: DiffSectionProps) {
  if (goals.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <p
        className={cn(
          'flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase',
          tone === 'added' && 'text-emerald-600 dark:text-emerald-400',
          tone === 'removed' && 'text-destructive',
          tone === 'unchanged' && 'text-muted-foreground'
        )}
      >
        {icon}
        {title}
      </p>
      <ul className="flex flex-col gap-1.5">
        {goals.map((goal) => (
          <li
            key={goal.id}
            className="bg-muted/40 flex items-center justify-between gap-3 rounded-lg px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <GitCommitVertical className="text-muted-foreground size-3.5 shrink-0" />
              <span className="truncate text-sm">{goal.title}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="ghost">{prettifyPhaseKey(goal.phaseKey)}</Badge>
              <span className="text-muted-foreground text-xs">
                {formatEffort(goal.estimatedEffortHours)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
