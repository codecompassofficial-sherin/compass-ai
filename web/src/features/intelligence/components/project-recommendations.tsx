'use client'

import Link from 'next/link'
import { ArrowRight, FolderGit2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/feedback/empty-state'
import { formatEffort } from '@/features/roadmap/utils/roadmap.utils'

import type { ProjectRecommendation } from '../types/intelligence.types'
import { getEffortLevel } from '../utils/intelligence.utils'

interface ProjectRecommendationsProps {
  projects: ProjectRecommendation[]
}

export function ProjectRecommendations({
  projects,
}: ProjectRecommendationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderGit2 className="text-muted-foreground size-4" />
          Project recommendations
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          Hands-on projects that apply your roadmap skills.
        </p>
      </CardHeader>
      <CardContent>
        {projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.templateKey} size="sm" className="flex flex-col">
                <CardContent className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-medium">
                      {project.title}
                    </p>
                    <Badge variant="secondary" className="shrink-0">
                      {getEffortLevel(project.estimatedEffortHours)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground line-clamp-3 text-xs">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.skillTargets.map((skill) => (
                      <Badge key={skill} variant="outline" className="h-5">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-auto pt-1 text-xs">
                    {project.reason} · ~{formatEffort(project.estimatedEffortHours)}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    render={<Link href="/projects" />}
                  >
                    Start project
                    <ArrowRight data-icon="inline-end" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderGit2}
            title="No project recommendations yet"
            description="Project ideas will appear here as your roadmap fills out."
            className="px-4 py-8"
          />
        )}
      </CardContent>
    </Card>
  )
}
