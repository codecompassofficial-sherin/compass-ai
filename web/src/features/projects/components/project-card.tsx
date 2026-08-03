'use client'

import { ExternalLink, GitBranch, RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatDate } from '@/features/roadmap/utils/roadmap.utils'

import { PROJECT_STATUS_META } from '../constants/projects.constants'
import type { PublicProject } from '../types/projects.types'
import { getProjectProgress } from '../utils/projects.utils'

interface ProjectCardProps {
  project: PublicProject
  selected: boolean
  onSelect: (id: string) => void
}

export function ProjectCard({
  project,
  selected,
  onSelect,
}: ProjectCardProps) {
  const statusMeta = PROJECT_STATUS_META[project.status]
  const progress = getProjectProgress(project.status)
  const externalUrl = project.liveUrl ?? project.githubUrl ?? null
  const extraTech = project.technologyStack.slice(3).length

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onSelect(project.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(project.id)
        }
      }}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        selected && 'border-primary bg-accent/40 ring-primary'
      )}
    >
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading min-w-0 text-sm font-semibold tracking-tight">
            {project.title}
          </h3>
          <Badge variant={statusMeta.variant} className="shrink-0">
            {statusMeta.label}
          </Badge>
        </div>

        {project.description && (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {project.description}
          </p>
        )}

        {project.technologyStack.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {project.technologyStack.slice(0, 3).map((technology) => (
              <Badge key={technology} variant="outline" className="h-5">
                {technology}
              </Badge>
            ))}
            {extraTech > 0 && (
              <span className="text-muted-foreground text-xs">
                +{extraTech} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Progress
              value={progress.percent}
              className="h-1.5 flex-1"
            />
            <span className="text-muted-foreground text-xs">
              {progress.label}
            </span>
          </div>

          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1">
              <RefreshCw className="size-3.5" />
              Updated {formatDate(project.updatedAt)}
            </span>

            <span className="flex flex-1 items-center justify-end gap-1.5">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${project.title} on GitHub`}
                  onClick={(event) => event.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
                >
                  <GitBranch className="size-4" />
                </a>
              )}
              {externalUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 gap-1 px-1.5 text-xs"
                  render={<a href={externalUrl} target="_blank" rel="noreferrer" />}
                  onClick={(event) => event.stopPropagation()}
                >
                  <ExternalLink />
                  Open
                </Button>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
