import { GitBranch } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { PublicProject } from '@/features/dashboard/dashboard.types'
import { getProjectStatusMeta } from '@/features/dashboard/lib/projects'

interface ProjectCardProps {
  project: PublicProject
}

export function ProjectCard({ project }: ProjectCardProps) {
  const status = getProjectStatusMeta(project.status)

  return (
    <Card size="sm" className="transition-all duration-200 hover:shadow-sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{project.title}</p>
            {project.description && (
              <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                {project.description}
              </p>
            )}
          </div>
          <Badge variant={status.badgeVariant} className="shrink-0">
            {status.label}
          </Badge>
        </div>

        <Progress value={status.progress} className="h-1.5" />

        <div className="flex items-center justify-between gap-2">
          {project.technologyStack.length > 0 ? (
            <p className="text-muted-foreground truncate text-xs">
              {project.technologyStack.slice(0, 3).join(' · ')}
            </p>
          ) : (
            <span className="text-muted-foreground text-xs">
              No stack listed
            </span>
          )}
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${project.title} on GitHub`}
              className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
            >
              <GitBranch className="size-3.5" />
            </a>
          ) : (
            <span
              aria-label="No GitHub repository"
              className="text-muted-foreground/40 shrink-0"
            >
              <GitBranch className="size-3.5" />
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
