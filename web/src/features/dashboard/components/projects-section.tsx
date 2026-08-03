'use client'

import Link from 'next/link'
import { FolderGit2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import type { PublicProject } from '@/features/dashboard/dashboard.types'
import { sortProjectsByRecency } from '@/features/dashboard/lib/projects'
import { ProjectCard } from './project-card'
import { SectionTitle } from './section-title'

interface ProjectsSectionProps {
  projects: PublicProject[] | undefined
  isPending: boolean
  isError: boolean
  onRetry: () => void
}

const RECENT_PROJECT_LIMIT = 5

export function ProjectsSection({
  projects,
  isPending,
  isError,
  onRetry,
}: ProjectsSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <SectionTitle
        icon={FolderGit2}
        title="Recent Projects"
        description="Work that showcases your skills"
        action={
          <Button variant="ghost" size="sm" render={<Link href="/projects" />}>
            View all
          </Button>
        }
      />

      {isPending ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Couldn't load projects"
          description="We couldn't fetch your recent projects. Please try again."
          onRetry={onRetry}
          className="px-4 py-8"
        />
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {sortProjectsByRecency(projects)
            .slice(0, RECENT_PROJECT_LIMIT)
            .map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderGit2}
          title="No projects yet"
          description="Start a hands-on project to apply what you're learning."
          className="px-4 py-8"
          action={
            <Button size="sm" render={<Link href="/projects" />}>
              Start a project
            </Button>
          }
        />
      )}
    </section>
  )
}
