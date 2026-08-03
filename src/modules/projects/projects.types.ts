import type { ProjectStatus } from "./projects.constants.js";

export interface PublicProject {
  id: string;
  title: string;
  description?: string;
  technologyStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: ProjectStatus;
  relatedGoalIds: string[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
