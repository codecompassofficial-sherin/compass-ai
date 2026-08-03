'use client'

import { motion } from 'framer-motion'
import {
  CalendarClock,
  CheckCircle2,
  FolderGit2,
  Gauge,
  Play,
  Plus,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import type { PublicProject } from '../types/projects.types'
import {
  getCompletionRate,
  getProjectsSummary,
} from '../utils/projects.utils'

interface ProjectsHeaderProps {
  projects: PublicProject[]
  onCreate: () => void
}

export function ProjectsHeader({ projects, onCreate }: ProjectsHeaderProps) {
  const summary = getProjectsSummary(projects)
  const completionRate = getCompletionRate(projects)

  const stats = [
    {
      label: 'Total',
      value: summary.total,
      icon: FolderGit2,
    },
    {
      label: 'Planned',
      value: summary.planned,
      icon: CalendarClock,
    },
    {
      label: 'In progress',
      value: summary.inProgress,
      icon: Play,
    },
    {
      label: 'Completed',
      value: summary.completed,
      icon: CheckCircle2,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Projects workspace
              </p>
              <h1 className="font-heading mt-1 text-2xl font-semibold tracking-tight">
                Build your portfolio
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Track the projects that prove your skills — from idea to
                shipped.
              </p>
            </div>

            <Button onClick={onCreate}>
              <Plus />
              Create project
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
                  <stat.icon className="size-3.5" />
                  {stat.label}
                </span>
                <span className="font-heading text-xl font-semibold tabular-nums">
                  {stat.value}
                </span>
              </div>
            ))}

            <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
              <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
                <Gauge className="size-3.5" />
                Completion rate
              </span>
              <span className="font-heading flex items-center gap-2 text-xl font-semibold tabular-nums">
                {completionRate}%
                <Badge variant="ghost" className="h-5">
                  {summary.completed} of {summary.total}
                </Badge>
              </span>
              <Progress value={completionRate} className="h-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
