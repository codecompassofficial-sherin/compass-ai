'use client'

import Link from 'next/link'
import {
  CheckCircle2,
  FolderGit2,
  Map,
  PackageCheck,
  Target,
} from 'lucide-react'

import { PageContainer } from '@/components/common/page-container'
import { Button } from '@/components/ui/button'
import { CareerIntelligence } from '@/features/dashboard/components/career-intelligence'
import { CurrentGoalCard } from '@/features/dashboard/components/current-goal-card'
import { DashboardError } from '@/features/dashboard/components/dashboard-error'
import { DashboardSkeleton } from '@/features/dashboard/components/dashboard-skeleton'
import { PhaseStrip } from '@/features/dashboard/components/phase-strip'
import { ProgressCard } from '@/features/dashboard/components/progress-card'
import { ProjectsSection } from '@/features/dashboard/components/projects-section'
import { StatCard } from '@/features/dashboard/components/stat-card'
import { TodayFocus } from '@/features/dashboard/components/today-focus'
import { WelcomeHero } from '@/features/dashboard/components/welcome-hero'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { getPhaseName } from '@/features/dashboard/lib/phases'

export default function DashboardPage() {
  const { dashboard, intelligence, projects, refetch } = useDashboard()

  if (dashboard.isPending || intelligence.isPending) {
    return (
      <PageContainer>
        <DashboardSkeleton />
      </PageContainer>
    )
  }

  const error = dashboard.error ?? intelligence.error
  if (error || !dashboard.data || !intelligence.data) {
    return (
      <PageContainer>
        <DashboardError
          error={error ?? new Error('Missing dashboard data')}
          onRetry={refetch}
        />
      </PageContainer>
    )
  }

  const data = dashboard.data.dashboard
  const insight = intelligence.data
  const stats = data.statistics
  const currentPhase = getPhaseName(stats.currentPhase)

  return (
    <PageContainer>
      <WelcomeHero dashboard={data} intelligence={insight} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Goals"
          value={stats.totalGoals}
          icon={Target}
          hint={
            stats.activeGoals > 0
              ? `${stats.activeGoals} active`
              : 'No active goals'
          }
        />
        <StatCard
          label="Projects"
          value={stats.totalProjects}
          icon={FolderGit2}
          hint={
            data.projects.inProgress > 0
              ? `${data.projects.inProgress} in progress`
              : 'No active projects'
          }
        />
        <StatCard
          label="Roadmap progress"
          value={`${stats.roadmapProgress}%`}
          icon={Map}
          hint={
            data.roadmap
              ? `${data.roadmap.completedPhases} of ${data.roadmap.totalPhases} phases`
              : 'No roadmap yet'
          }
        />
        <StatCard
          label="Current phase"
          value={currentPhase ?? '—'}
          icon={Target}
          hint="Where you are now"
        />
        <StatCard
          label="Goals completed"
          value={stats.completedGoals}
          icon={CheckCircle2}
          hint={`of ${stats.totalGoals} total`}
        />
        <StatCard
          label="Projects completed"
          value={stats.completedProjects}
          icon={PackageCheck}
          hint={`of ${stats.totalProjects} total`}
        />
      </div>

      <TodayFocus nextBestAction={insight.nextBestAction} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ProgressCard
            title="Career Progress"
            description="Goals completed across your roadmap."
            icon={Target}
            value={data.goals.completed}
            max={data.goals.totalGoals}
            percent={data.goals.progress}
            emptyTitle="No goals yet"
            emptyDescription="Your roadmap will break your plan into trackable goals."
            emptyAction={
              <Button size="sm" render={<Link href="/roadmaps" />}>
                View roadmap
              </Button>
            }
          />

          <ProgressCard
            title="Roadmap Progress"
            description="Phase completion across your plan."
            icon={Map}
            value={data.roadmap?.completedPhases ?? 0}
            max={data.roadmap?.totalPhases ?? 0}
            percent={data.roadmap?.progress ?? 0}
            footer={
              data.roadmap && (
                <PhaseStrip
                  totalPhases={data.roadmap.totalPhases}
                  completedPhases={data.roadmap.completedPhases}
                  currentPhaseName={currentPhase}
                />
              )
            }
            emptyTitle={
              data.roadmap ? 'Roadmap has no phases' : 'No roadmap yet'
            }
            emptyDescription={
              data.roadmap
                ? 'Your roadmap is ready but has no phases to track yet.'
                : 'Take your assessment to generate a personalized roadmap.'
            }
            emptyAction={
              !data.roadmap && (
                <Button size="sm" render={<Link href="/roadmaps" />}>
                  Generate roadmap
                </Button>
              )
            }
          />

          <ProjectsSection
            projects={projects.data}
            isPending={projects.isPending}
            isError={projects.isError}
            onRetry={refetch}
          />
        </div>

        <div className="flex flex-col gap-6">
          <CurrentGoalCard
            goals={data.goals}
            statistics={data.statistics}
            nextBestAction={insight.nextBestAction}
          />
          <CareerIntelligence intelligence={insight} />
        </div>
      </div>
    </PageContainer>
  )
}
