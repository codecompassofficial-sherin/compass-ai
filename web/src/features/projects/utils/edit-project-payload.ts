import type { ProjectStatus, PublicProject } from '../types/projects.types'
import type {
  EditProjectFormOutput,
  UpdateProjectPayload,
} from '../validation/projects.validation'
import { isSameStringArray } from './projects.utils'

export function buildUpdatePayload(
  values: EditProjectFormOutput,
  project: PublicProject,
  nextStatus: string
): UpdateProjectPayload {
  const input: UpdateProjectPayload = {}

  const title = values.title?.trim()
  if (title !== undefined && title !== project.title) {
    input.title = title
  }

  const description = values.description
  if (description !== undefined && description !== project.description) {
    input.description = description
  }

  const technologyStack = values.technologyStack ?? []
  if (!isSameStringArray(technologyStack, project.technologyStack)) {
    input.technologyStack = technologyStack
  }

  const githubUrl = values.githubUrl
  if (githubUrl !== undefined && githubUrl !== (project.githubUrl ?? '')) {
    input.githubUrl = githubUrl
  }

  const liveUrl = values.liveUrl
  if (liveUrl !== undefined && liveUrl !== (project.liveUrl ?? '')) {
    input.liveUrl = liveUrl
  }

  if (nextStatus !== '') {
    input.status = nextStatus as ProjectStatus
  }

  return input
}
