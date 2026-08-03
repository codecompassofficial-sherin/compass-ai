'use client'

import { useEffect, useState } from 'react'

import { useIntelligence } from '../hooks/useIntelligence'
import { getIntelligenceStatus } from '../utils/intelligence.utils'
import { IntelligenceEmpty } from './intelligence-empty'
import { IntelligenceError } from './intelligence-error'
import { IntelligenceHeader } from './intelligence-header'
import { IntelligenceSkeleton } from './intelligence-skeleton'
import { LearningRecommendations } from './learning-recommendations'
import { NextBestAction } from './next-best-action'
import { ProjectRecommendations } from './project-recommendations'
import { RoadmapInsights } from './roadmap-insights'
import { SkillGap } from './skill-gap'

export function IntelligencePage() {
  const query = useIntelligence()
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    if (query.data) {
      setLastUpdated(new Date().toISOString())
    }
  }, [query.data])

  if (query.isPending) {
    return <IntelligenceSkeleton />
  }

  if (query.isError || !query.data) {
    return (
      <IntelligenceError
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const data = query.data
  const status = getIntelligenceStatus(data)
  const refresh = () => void query.refetch()

  if (status !== 'ready') {
    return <IntelligenceEmpty variant={status} onRefresh={refresh} />
  }

  return (
    <div className="flex flex-col gap-6">
      <IntelligenceHeader
        intelligence={data}
        lastUpdated={lastUpdated}
        refreshing={query.isRefetching}
        onRefresh={refresh}
      />

      <NextBestAction nextBestAction={data.nextBestAction} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <SkillGap skillGap={data.skillGap} />
          <LearningRecommendations learning={data.learning} />
        </div>
        <div className="lg:col-span-2">
          <RoadmapInsights roadmap={data.roadmap} />
        </div>
      </div>

      <ProjectRecommendations projects={data.projects} />
    </div>
  )
}
