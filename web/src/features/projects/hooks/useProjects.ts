'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useApiQuery } from '@/lib/use-api-query'

import { projectsApi } from '../api/projects.api'
import type { PublicProject } from '../types/projects.types'
import type {
  CreateProjectPayload,
  UpdateProjectPayload,
} from '../validation/projects.validation'

export const PROJECTS_QUERY_KEY = ['projects']
export const PROJECT_DETAIL_QUERY_KEY = (id: string) => ['projects', id]

export function useProjects() {
  return useApiQuery(PROJECTS_QUERY_KEY, projectsApi.list)
}

export function useProject(id: string | null) {
  return useApiQuery<{ project: PublicProject }>(
    PROJECT_DETAIL_QUERY_KEY(id ?? ''),
    () => projectsApi.getById(id as string),
    { enabled: id !== null }
  )
}

export function useProjectsInvalidation() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    queryClient.invalidateQueries({ queryKey: ['goals'] })
    queryClient.invalidateQueries({ queryKey: ['roadmap'] })
    queryClient.invalidateQueries({ queryKey: ['intelligence'] })
  }
}

export function useCreateProject() {
  const invalidateProjects = useProjectsInvalidation()
  return useMutation({
    mutationFn: (input: CreateProjectPayload) => projectsApi.create(input),
    onSuccess: invalidateProjects,
  })
}

export function useUpdateProject() {
  const invalidateProjects = useProjectsInvalidation()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: UpdateProjectPayload
    }) => projectsApi.update(id, input),
    onSuccess: invalidateProjects,
  })
}

export function useCompleteProject() {
  const invalidateProjects = useProjectsInvalidation()
  return useMutation({
    mutationFn: projectsApi.complete,
    onSuccess: invalidateProjects,
  })
}

export function useArchiveProject() {
  const invalidateProjects = useProjectsInvalidation()
  return useMutation({
    mutationFn: projectsApi.archive,
    onSuccess: invalidateProjects,
  })
}
