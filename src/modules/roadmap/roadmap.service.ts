import { Types } from "mongoose";
import type { AssessmentDocument } from "../assessment/assessment.model.js";
import { assessmentRepository } from "../assessment/assessment.repository.js";
import { CATALOG_VERSION, ENGINE_VERSION } from "./roadmap.constants.js";
import { roadmapErrors } from "./roadmap.errors.js";
import { generateRoadmap } from "./roadmap.generator.js";
import type { GoalInstanceDocument } from "./goalInstance.model.js";
import { roadmapRepository } from "./roadmap.repository.js";
import type { RoadmapDocument } from "./roadmap.model.js";
import type {
  AssessmentSnapshot,
  PublicGoalInstance,
  PublicRoadmap,
  RoadmapDiff,
  RoadmapHistoryEntry,
  RoadmapPhase,
} from "./roadmap.types.js";

function toAssessmentSnapshot(assessment: AssessmentDocument): AssessmentSnapshot {
  return {
    targetRole: assessment.targetRole,
    experienceLevel: assessment.experienceLevel,
    technologyPreferences: [...assessment.technologyPreferences],
    currentSkills: [...assessment.currentSkills],
    primaryCareerGoal: assessment.primaryCareerGoal,
    ...(assessment.additionalNotes ? { additionalNotes: assessment.additionalNotes } : {}),
    targetTimeline: assessment.targetTimeline,
  };
}

function toPublicGoalInstance(goal: GoalInstanceDocument): PublicGoalInstance {
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
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
}

function sortGoalsByPhase(
  phases: RoadmapPhase[],
  goals: GoalInstanceDocument[],
): GoalInstanceDocument[] {
  const phaseOrder = new Map(phases.map((phase) => [phase.key, phase.order]));
  return [...goals].sort(
    (a, b) =>
      (phaseOrder.get(a.phaseKey) ?? Number.MAX_SAFE_INTEGER) -
        (phaseOrder.get(b.phaseKey) ?? Number.MAX_SAFE_INTEGER) || a.order - b.order,
  );
}

function toPublicRoadmap(
  roadmap: RoadmapDocument,
  goals: GoalInstanceDocument[],
): PublicRoadmap {
  return {
    id: roadmap._id.toString(),
    version: roadmap.version,
    status: roadmap.status,
    reason: roadmap.reason,
    assessmentSnapshot: roadmap.assessmentSnapshot,
    phases: roadmap.phases,
    engineVersion: roadmap.engineVersion,
    catalogVersion: roadmap.catalogVersion,
    generatedAt: roadmap.generatedAt.toISOString(),
    goals: sortGoalsByPhase(roadmap.phases, goals).map(toPublicGoalInstance),
    createdAt: roadmap.createdAt.toISOString(),
    updatedAt: roadmap.updatedAt.toISOString(),
  };
}

async function generate(userId: string): Promise<PublicRoadmap> {
  const assessment = await assessmentRepository.findByUserId(userId);
  if (!assessment) {
    throw roadmapErrors.assessmentRequired();
  }
  const active = await roadmapRepository.findActiveByUserId(userId);
  if (active) {
    throw roadmapErrors.roadmapAlreadyExists();
  }

  const assessmentSnapshot = toAssessmentSnapshot(assessment);
  const generated = generateRoadmap({
    assessment: assessmentSnapshot,
    engineVersion: ENGINE_VERSION,
    catalogVersion: CATALOG_VERSION,
  });

  const roadmap = await roadmapRepository.createRoadmapWithGoals({
    userId: new Types.ObjectId(userId),
    version: 1,
    assessmentSnapshot,
    phases: generated.phases,
    goals: generated.goals,
    engineVersion: ENGINE_VERSION,
    catalogVersion: CATALOG_VERSION,
    reason: "INITIAL",
    generatedAt: new Date(),
  });

  const goals = await roadmapRepository.findGoalsByRoadmapId(roadmap._id);
  return toPublicRoadmap(roadmap, goals);
}

async function regenerate(userId: string): Promise<PublicRoadmap> {
  const assessment = await assessmentRepository.findByUserId(userId);
  if (!assessment) {
    throw roadmapErrors.assessmentRequired();
  }
  const active = await roadmapRepository.findActiveByUserId(userId);
  if (!active) {
    throw roadmapErrors.noActiveRoadmapToRegenerate();
  }

  const assessmentSnapshot = toAssessmentSnapshot(assessment);
  const generated = generateRoadmap({
    assessment: assessmentSnapshot,
    engineVersion: ENGINE_VERSION,
    catalogVersion: CATALOG_VERSION,
  });

  const roadmap = await roadmapRepository.regenerateRoadmap({
    userId: new Types.ObjectId(userId),
    prevVersion: active.version,
    version: active.version + 1,
    assessmentSnapshot,
    phases: generated.phases,
    goals: generated.goals,
    engineVersion: ENGINE_VERSION,
    catalogVersion: CATALOG_VERSION,
    reason: "MANUAL",
    generatedAt: new Date(),
  });

  const goals = await roadmapRepository.findGoalsByRoadmapId(roadmap._id);
  return toPublicRoadmap(roadmap, goals);
}

async function getActive(userId: string): Promise<PublicRoadmap> {
  const roadmap = await roadmapRepository.findActiveByUserId(userId);
  if (!roadmap) {
    throw roadmapErrors.noActiveRoadmap();
  }
  const goals = await roadmapRepository.findGoalsByRoadmapId(roadmap._id);
  return toPublicRoadmap(roadmap, goals);
}

async function getById(userId: string, roadmapId: string): Promise<PublicRoadmap> {
  const roadmap = await roadmapRepository.findByIdForUser(
    new Types.ObjectId(roadmapId),
    userId,
  );
  if (!roadmap) {
    throw roadmapErrors.roadmapNotFound();
  }
  const goals = await roadmapRepository.findGoalsByRoadmapId(roadmap._id);
  return toPublicRoadmap(roadmap, goals);
}

async function getHistory(userId: string): Promise<RoadmapHistoryEntry[]> {
  const roadmaps = await roadmapRepository.listHistory(userId);
  return roadmaps.map((roadmap) => ({
    id: roadmap._id.toString(),
    version: roadmap.version,
    status: roadmap.status,
    reason: roadmap.reason,
    generatedAt: roadmap.generatedAt.toISOString(),
  }));
}

async function compare(
  userId: string,
  fromVersion: number,
  toVersion: number,
): Promise<RoadmapDiff> {
  const from = await roadmapRepository.findByUserIdAndVersion(userId, fromVersion);
  const to = await roadmapRepository.findByUserIdAndVersion(userId, toVersion);
  if (!from || !to) {
    throw roadmapErrors.roadmapNotFound();
  }

  const [fromGoals, toGoals] = await Promise.all([
    roadmapRepository.findGoalsByRoadmapId(from._id),
    roadmapRepository.findGoalsByRoadmapId(to._id),
  ]);

  const fromByKey = new Map<string, GoalInstanceDocument>(
    fromGoals.map((goal) => [goal.templateKey, goal]),
  );
  const toByKey = new Map<string, GoalInstanceDocument>(
    toGoals.map((goal) => [goal.templateKey, goal]),
  );

  const phaseStructureChanged =
    from.phases.map((phase) => phase.key).join(",") !==
    to.phases.map((phase) => phase.key).join(",");

  const addedGoals = toGoals
    .filter((goal) => !fromByKey.has(goal.templateKey))
    .map(toPublicGoalInstance);
  const removedGoals = fromGoals
    .filter((goal) => !toByKey.has(goal.templateKey))
    .map(toPublicGoalInstance);
  const unchangedGoals = toGoals
    .filter((goal) => fromByKey.has(goal.templateKey))
    .map(toPublicGoalInstance);

  return { fromVersion, toVersion, phaseStructureChanged, addedGoals, removedGoals, unchangedGoals };
}

export const roadmapService = {
  generate,
  regenerate,
  getActive,
  getById,
  getHistory,
  compare,
};
