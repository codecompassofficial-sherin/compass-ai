'use client'

import { useState } from 'react'

import { isNoActiveRoadmap } from '../utils/roadmap.utils'
import { useActiveRoadmap, useRoadmapHistory } from '../hooks/useActiveRoadmap'
import { CompareDialog } from '../dialogs/compare-dialog'
import { RegenerateDialog } from '../dialogs/regenerate-dialog'
import { GenerationFlow } from './generation-flow'
import { HistoryPanel } from './history-panel'
import { RoadmapError } from './roadmap-error'
import { RoadmapHero } from './roadmap-hero'
import { RoadmapSkeleton } from './roadmap-skeleton'
import { RoadmapTimeline } from './roadmap-timeline'

export function RoadmapPage() {
  const active = useActiveRoadmap()
  const history = useRoadmapHistory()
  const [regenerateOpen, setRegenerateOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)

  if (active.isPending) {
    return <RoadmapSkeleton />
  }

  if (active.isError || !active.data) {
    if (isNoActiveRoadmap(active.error)) {
      return <GenerationFlow />
    }
    return (
      <RoadmapError
        error={active.error}
        onRetry={() => void active.refetch()}
      />
    )
  }

  const roadmap = active.data.roadmap
  const historyEntries = history.data?.history ?? []

  return (
    <div className="flex flex-col gap-6">
      <RoadmapHero
        roadmap={roadmap}
        onRegenerate={() => setRegenerateOpen(true)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RoadmapTimeline roadmap={roadmap} />
        </div>
        <div className="flex flex-col gap-6">
          <HistoryPanel
            entries={historyEntries}
            isPending={history.isPending}
            isError={history.isError}
            onRetry={() => void history.refetch()}
            onCompare={() => setCompareOpen(true)}
          />
        </div>
      </div>

      <RegenerateDialog
        open={regenerateOpen}
        onOpenChange={setRegenerateOpen}
        currentVersion={roadmap.version}
      />
      <CompareDialog
        open={compareOpen}
        onOpenChange={setCompareOpen}
        entries={historyEntries}
      />
    </div>
  )
}
