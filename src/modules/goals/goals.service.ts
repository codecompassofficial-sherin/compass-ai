import { Types } from "mongoose";
import type { GoalInstanceDocument } from "../roadmap/goalInstance.model.js";
import { roadmapErrors } from "../roadmap/roadmap.errors.js";
import type { RoadmapDocument } from "../roadmap/roadmap.model.js";
import { goalsErrors } from "./goals.errors.js";
import { goalsRepository } from "./goals.repository.js";
import type { PublicGoal, PublicTask } from "./goals.types.js";
import { generateTasks } from "./task.generator.js";
import type { TaskInstanceDocument } from "./taskInstance.model.js";

function toPublicTask(task: TaskInstanceDocument): PublicTask {
  return {
    id: task._id.toString(),
    goalId: task.goalId.toString(),
    roadmapId: task.roadmapId.toString(),
    order: task.order,
    title: task.title,
    description: task.description,
    estimatedEffortHours: task.estimatedEffortHours,
    templateVersion: task.templateVersion,
    status: task.status,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function computeProgress(tasks: TaskInstanceDocument[]): number {
  if (tasks.length === 0) {
    return 0;
  }
  const done = tasks.filter((task) => task.status === "done").length;
  return Math.round((done / tasks.length) * 100);
}

function toPublicGoal(
  goal: GoalInstanceDocument,
  tasks: TaskInstanceDocument[] = [],
): PublicGoal {
  const progress = computeProgress(tasks);
  return {
    id: goal._id.toString(),
    phaseKey: goal.phaseKey,
    order: goal.order,
    templateKey: goal.templateKey,
    templateVersion: goal.templateVersion,
    title: goal.title,
    description: goal.description,
    skillTargets: [...goal.skillTargets],
    prerequisites: [...goal.prerequisites],
    estimatedEffortHours: goal.estimatedEffortHours,
    bindings: {
      technologyPreferences: [...goal.bindings.technologyPreferences],
      currentSkills: [...goal.bindings.currentSkills],
    },
    status: goal.status,
    progress,
    taskCount: tasks.length,
    tasks: tasks.map(toPublicTask),
    ...(goal.activatedAt ? { activatedAt: goal.activatedAt.toISOString() } : {}),
    ...(goal.completedAt ? { completedAt: goal.completedAt.toISOString() } : {}),
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
}

function sortGoalsByPhase(
  phases: RoadmapDocument["phases"],
  goals: GoalInstanceDocument[],
): GoalInstanceDocument[] {
  const phaseOrder = new Map(phases.map((phase) => [phase.key, phase.order]));
  return [...goals].sort(
    (a, b) =>
      (phaseOrder.get(a.phaseKey) ?? Number.MAX_SAFE_INTEGER) -
        (phaseOrder.get(b.phaseKey) ?? Number.MAX_SAFE_INTEGER) || a.order - b.order,
  );
}

async function requireActiveRoadmap(userId: string) {
  const roadmap = await goalsRepository.findActiveRoadmap(userId);
  if (!roadmap) {
    throw roadmapErrors.noActiveRoadmap();
  }
  return roadmap;
}

async function listGoals(userId: string): Promise<PublicGoal[]> {
  const roadmap = await requireActiveRoadmap(userId);
  const goals = sortGoalsByPhase(roadmap.phases, await goalsRepository.findGoalsByRoadmapId(roadmap._id));
  const tasks = await goalsRepository.findTasksByGoalIds(
    goals.map((goal) => goal._id),
  );
  const tasksByGoal = new Map<string, TaskInstanceDocument[]>();
  for (const task of tasks) {
    const key = task.goalId.toString();
    const current = tasksByGoal.get(key) ?? [];
    current.push(task);
    tasksByGoal.set(key, current);
  }
  return goals.map((goal) => toPublicGoal(goal, tasksByGoal.get(goal._id.toString()) ?? []));
}

async function getGoal(userId: string, goalId: Types.ObjectId): Promise<PublicGoal> {
  const roadmap = await requireActiveRoadmap(userId);
  const goal = await goalsRepository.findGoalForUser(goalId, userId);
  if (!goal || goal.roadmapId.toString() !== roadmap._id.toString()) {
    throw goalsErrors.goalNotFound();
  }
  const tasks = await goalsRepository.findTasksByGoalId(goal._id);
  return toPublicGoal(goal, tasks);
}

async function activateGoal(userId: string, goalId: Types.ObjectId): Promise<PublicGoal> {
  const roadmap = await requireActiveRoadmap(userId);
  const goal = await goalsRepository.findGoalForUser(goalId, userId);
  if (!goal || goal.roadmapId.toString() !== roadmap._id.toString()) {
    throw goalsErrors.goalNotFound();
  }

  const tasks = generateTasks({
    templateKey: goal.templateKey,
    title: goal.title,
    description: goal.description,
    skillTargets: goal.skillTargets,
    estimatedEffortHours: goal.estimatedEffortHours,
  });

  const result = await goalsRepository.activateGoalWithTasks({
    goalId,
    userId,
    roadmapId: roadmap._id,
    tasks,
  });
  return toPublicGoal(result.goal, result.tasks);
}

async function completeGoal(userId: string, goalId: Types.ObjectId): Promise<PublicGoal> {
  const roadmap = await requireActiveRoadmap(userId);
  const goal = await goalsRepository.findGoalForUser(goalId, userId);
  if (!goal || goal.roadmapId.toString() !== roadmap._id.toString()) {
    throw goalsErrors.goalNotFound();
  }

  const updated = await goalsRepository.completeGoal({ goalId, userId });
  const tasks = await goalsRepository.findTasksByGoalId(updated._id);
  return toPublicGoal(updated, tasks);
}

export const goalsService = {
  listGoals,
  getGoal,
  activateGoal,
  completeGoal,
};
