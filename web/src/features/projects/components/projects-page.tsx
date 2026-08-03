'use client'

import { useState } from 'react'
import { FolderGit2, Plus, SearchX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/empty-state'

import {
  PROJECT_STATUS_FILTER_META,
  type ProjectStatusFilter,
} from '../constants/projects.constants'
import { CompleteProjectDialog } from '../dialogs/complete-project-dialog'
import { CreateProjectDialog } from '../dialogs/create-project-dialog'
import { DeleteProjectDialog } from '../dialogs/delete-project-dialog'
import { EditProjectDialog } from '../dialogs/edit-project-dialog'
import { useProjects } from '../hooks/useProjects'
import type { PublicProject } from '../types/projects.types'
import { filterProjects } from '../utils/projects.utils'
import { ProjectDetailPanel } from './project-detail-panel'
import { ProjectsError } from './projects-error'
import { ProjectsFilters } from './projects-filters'
import { ProjectsGrid } from './projects-grid'
import { ProjectsHeader } from './projects-header'
import { ProjectsSkeleton } from './projects-skeleton'

export function ProjectsPage() {
  const projectsQuery = useProjects()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<ProjectStatusFilter>('all')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editProject, setEditProject] = useState<PublicProject | null>(null)
  const [completeProject, setCompleteProject] = useState<PublicProject | null>(
    null
  )
  const [archiveProject, setArchiveProject] = useState<PublicProject | null>(
    null
  )

  if (projectsQuery.isPending) {
    return <ProjectsSkeleton />
  }

  if (projectsQuery.isError || !projectsQuery.data) {
    return (
      <ProjectsError
        error={projectsQuery.error}
        onRetry={() => void projectsQuery.refetch()}
      />
    )
  }

  const projects = projectsQuery.data.projects

  const counts: Record<ProjectStatusFilter, number> = {
    all: projects.length,
    planned: 0,
    in_progress: 0,
    completed: 0,
    archived: 0,
  }
  for (const project of projects) {
    counts[project.status] += 1
  }

  const visible = filterProjects(projects, filter, search)
  const selected = visible.find((project) => project.id === selectedId) ?? visible[0] ?? null

  const emptyTitle = search.trim()
    ? 'No matching projects'
    : filter === 'archived'
      ? 'No archived projects'
      : `No ${PROJECT_STATUS_FILTER_META[filter].label.toLowerCase()} projects`
  const emptyDescription = search.trim()
    ? 'Try a different search term or filter.'
    : filter === 'archived'
      ? 'Projects you archive are removed from this workspace.'
      : 'Create a project and move it through this stage to see it here.'

  return (
    <div className="flex flex-col gap-6">
      <ProjectsHeader projects={projects} onCreate={() => setCreateOpen(true)} />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects yet"
          description="Create your first project to start tracking what you are building."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus />
              Create project
            </Button>
          }
        />
      ) : (
        <>
          <ProjectsFilters
            filter={filter}
            onFilterChange={setFilter}
            search={search}
            onSearchChange={setSearch}
            counts={counts}
          />

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              {visible.length === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title={emptyTitle}
                  description={emptyDescription}
                />
              ) : (
                <ProjectsGrid
                  projects={visible}
                  selectedId={selected?.id ?? null}
                  onSelect={setSelectedId}
                />
              )}
            </div>

            <div className="lg:col-span-2">
              {selected && (
                <div className="lg:sticky lg:top-6">
                  <ProjectDetailPanel
                    project={selected}
                    onEdit={setEditProject}
                    onComplete={setCompleteProject}
                    onArchive={setArchiveProject}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditProjectDialog
        project={editProject}
        open={editProject !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditProject(null)
          }
        }}
      />

      <CompleteProjectDialog
        project={completeProject}
        open={completeProject !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCompleteProject(null)
          }
        }}
      />

      <DeleteProjectDialog
        project={archiveProject}
        open={archiveProject !== null}
        onOpenChange={(open) => {
          if (!open) {
            setArchiveProject(null)
          }
        }}
      />
    </div>
  )
}
