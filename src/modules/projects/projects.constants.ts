export const PROJECT_STATUSES = ["planned", "in_progress", "completed", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_TRANSITIONS: Readonly<Record<ProjectStatus, readonly ProjectStatus[]>> = {
  planned: ["in_progress", "archived"],
  in_progress: ["completed", "archived"],
  completed: ["archived"],
  archived: [],
};
