'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  ExternalLink,
  FolderKanban,
  GitBranch,
  Link2,
  Pencil,
  Archive,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { formatDateTime } from '@/features/roadmap/utils/roadmap.utils'

import { PROJECT_STATUS_META } from '../constants/projects.constants'
import type { PublicProject } from '../types/projects.types'
import { getProjectProgress } from '../utils/projects.utils'

interface ProjectDetailPanelProps {
  project: PublicProject
  onEdit: (project: PublicProject) => void
  onComplete: (project: PublicProject) => void
  onArchive: (project: PublicProject) => void
}

export function ProjectDetailPanel({
  project,
  onEdit,
  onComplete,
  onArchive,
}: ProjectDetailPanelProps) {
  const statusMeta = PROJECT_STATUS_META[project.status]
  const progress = getProjectProgress(project.status)

  return (
    <Card className="h-fit">
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-heading min-w-0 text-lg font-semibold tracking-tight">
              {project.title}
            </h2>
            <Badge variant={statusMeta.variant} className="shrink-0">
              {statusMeta.label}
            </Badge>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{statusMeta.description}</span>
              <span className="font-medium tabular-nums">
                {progress.percent === null ? 'In progress' : `${progress.percent}%`}
              </span>
            </div>
            <Progress value={progress.percent} />
          </div>
        </div>

        <CollapsibleSection title="Description" defaultOpen={!!project.description}>
          {project.description ? (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {project.description}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              No description for this project yet.
            </p>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="Technology stack"
          defaultOpen={project.technologyStack.length > 0}
        >
          {project.technologyStack.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {project.technologyStack.map((technology) => (
                <Badge key={technology} variant="outline" className="h-5">
                  {technology}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No technologies listed.
            </p>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="Links"
          defaultOpen={!!project.githubUrl || !!project.liveUrl}
        >
          <div className="flex flex-col gap-2">
            <ExternalLinkRow
              icon={GitBranch}
              label="GitHub"
              href={project.githubUrl}
            />
            <ExternalLinkRow
              icon={Link2}
              label="Live demo"
              href={project.liveUrl}
            />
            {!project.githubUrl && !project.liveUrl && (
              <p className="text-muted-foreground text-sm">
                No links attached to this project.
              </p>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Related goals"
          defaultOpen={project.relatedGoalIds.length > 0}
        >
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <FolderKanban className="size-3.5" />
            {project.relatedGoalIds.length === 0
              ? 'Not linked to any goals.'
              : `Linked to ${project.relatedGoalIds.length} goal${
                  project.relatedGoalIds.length === 1 ? '' : 's'
                }.`}
          </p>
        </CollapsibleSection>

        <CollapsibleSection title="Timeline">
          <dl className="flex flex-col gap-2 text-sm">
            <TimelineRow label="Created" value={formatDateTime(project.createdAt)} />
            <TimelineRow label="Last updated" value={formatDateTime(project.updatedAt)} />
            {project.completedAt && (
              <TimelineRow
                label="Completed"
                value={formatDateTime(project.completedAt)}
              />
            )}
          </dl>
        </CollapsibleSection>

        <div className="mt-1 flex flex-col gap-2">
          <Button variant="outline" className="w-full" onClick={() => onEdit(project)}>
            <Pencil />
            Edit project
          </Button>

          {project.status === 'in_progress' && (
            <Button className="w-full" onClick={() => onComplete(project)}>
              <CheckCircle2 />
              Complete project
            </Button>
          )}

          {project.status === 'completed' && (
            <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs">
              <CheckCircle2 className="size-3.5" />
              Completed{' '}
              {project.completedAt ? formatDateTime(project.completedAt) : '—'}
            </p>
          )}

          <Button
            variant="ghost"
            className="text-muted-foreground w-full"
            onClick={() => onArchive(project)}
          >
            <Archive />
            Archive project
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 rounded-lg py-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
          {title}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-border h-px w-8 transition-colors group-hover:bg-muted-foreground/30" />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

function ExternalLinkRow({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
        <Icon className="size-3.5" />
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm underline underline-offset-3"
        >
          Open
          <ExternalLink className="size-3.5" />
        </a>
      ) : (
        <span className="text-muted-foreground/60 text-sm">—</span>
      )}
    </div>
  )
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  )
}
