import { z } from "zod";
import { TASK_STATUSES } from "./goals.types.js";

export const updateTaskStatusSchema = z.object({
  status: z.enum(TASK_STATUSES),
});

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
