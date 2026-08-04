import type { TaskStatus } from "./goals.types.js";

export const TASK_GENERATOR_VERSION = "1.0.0";

export const TASK_STATUS_TRANSITIONS: Readonly<
  Record<TaskStatus, readonly TaskStatus[]>
> = {
  todo: ["in_progress"],
  in_progress: ["done"],
  done: [],
};
