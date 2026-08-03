import { Types } from "mongoose";
import type { ProjectDocument } from "./project.model.js";
import { PROJECT_STATUS_TRANSITIONS } from "./projects.constants.js";
import type { ProjectStatus } from "./projects.constants.js";
import { projectsErrors } from "./projects.errors.js";
import { projectsRepository } from "./projects.repository.js";
import type { PublicProject } from "./projects.types.js";
import type { CreateProjectInput, UpdateProjectInput } from "./projects.validation.js";

function toPublicProject(project: ProjectDocument): PublicProject {
  return {
    id: project._id.toString(),
    title: project.title,
    ...(project.description ? { description: project.description } : {}),
    technologyStack: [...project.technologyStack],
    ...(project.githubUrl ? { githubUrl: project.githubUrl } : {}),
    ...(project.liveUrl ? { liveUrl: project.liveUrl } : {}),
    status: project.status,
    relatedGoalIds: [...project.relatedGoalIds],
    ...(project.completedAt ? { completedAt: project.completedAt.toISOString() } : {}),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function validateStatusTransition(
  current: ProjectStatus,
  next: ProjectStatus,
): void {
  if (!PROJECT_STATUS_TRANSITIONS[current].includes(next)) {
    throw projectsErrors.invalidStatusTransition();
  }
}

async function createProject(
  userId: string,
  input: CreateProjectInput,
): Promise<PublicProject> {
  const project = await projectsRepository.create({
    userId: new Types.ObjectId(userId),
    ...input,
  });
  return toPublicProject(project);
}

async function getProject(userId: string, projectId: Types.ObjectId): Promise<PublicProject> {
  const project = await projectsRepository.findByIdForUser(projectId, userId);
  if (!project) {
    throw projectsErrors.projectNotFound();
  }
  return toPublicProject(project);
}

async function listProjects(userId: string): Promise<PublicProject[]> {
  const projects = await projectsRepository.listForUser(userId);
  return projects.map(toPublicProject);
}

async function updateProject(
  userId: string,
  projectId: Types.ObjectId,
  input: UpdateProjectInput,
): Promise<PublicProject> {
  const project = await projectsRepository.findByIdForUser(projectId, userId);
  if (!project) {
    throw projectsErrors.projectNotFound();
  }

  const nextStatus = input.status ?? project.status;
  if (input.status !== undefined) {
    validateStatusTransition(project.status, nextStatus);
  }

  const completedAt =
    nextStatus === "completed"
      ? new Date()
      : project.status === "completed"
        ? null
        : undefined;

  const updated = await projectsRepository.update(projectId, userId, {
    ...input,
    status: nextStatus,
    completedAt,
  });
  if (!updated) {
    throw projectsErrors.projectNotFound();
  }
  return toPublicProject(updated);
}

async function completeProject(
  userId: string,
  projectId: Types.ObjectId,
): Promise<PublicProject> {
  const project = await projectsRepository.findByIdForUser(projectId, userId);
  if (!project) {
    throw projectsErrors.projectNotFound();
  }
  if (project.status !== "in_progress") {
    throw projectsErrors.cannotCompleteProject();
  }

  const updated = await projectsRepository.update(projectId, userId, {
    status: "completed",
    completedAt: new Date(),
  });
  if (!updated) {
    throw projectsErrors.projectNotFound();
  }
  return toPublicProject(updated);
}

async function archiveProject(
  userId: string,
  projectId: Types.ObjectId,
): Promise<PublicProject> {
  const project = await projectsRepository.findByIdForUser(projectId, userId);
  if (!project) {
    throw projectsErrors.projectNotFound();
  }
  if (project.status === "archived") {
    throw projectsErrors.cannotArchiveProject();
  }
  validateStatusTransition(project.status, "archived");

  const updated = await projectsRepository.update(projectId, userId, {
    status: "archived",
    completedAt: undefined,
  });
  if (!updated) {
    throw projectsErrors.projectNotFound();
  }
  return toPublicProject(updated);
}

export const projectsService = {
  create: createProject,
  get: getProject,
  list: listProjects,
  update: updateProject,
  complete: completeProject,
  archive: archiveProject,
  validateStatusTransition,
};
