import type { AssessmentDocument } from "../assessment/assessment.model.js";
import type { GoalInstanceDocument } from "../roadmap/goalInstance.model.js";
import type { RoadmapDocument } from "../roadmap/roadmap.model.js";
import { intelligenceRepository } from "./intelligence.repository.js";
import { computeIntelligence } from "./intelligence.rules.js";
import type { IntelligenceData, IntelligenceGoalInput, IntelligenceInput } from "./intelligence.types.js";

function toGoalInput(goal: GoalInstanceDocument): IntelligenceGoalInput {
  return {
    id: goal._id.toString(),
    phaseKey: goal.phaseKey,
    order: goal.order,
    status: goal.status,
    templateKey: goal.templateKey,
    title: goal.title,
    skillTargets: [...goal.skillTargets],
  };
}

function toInput(
  assessment: AssessmentDocument | null,
  roadmap: RoadmapDocument | null,
  goals: GoalInstanceDocument[],
  projects: Awaited<ReturnType<typeof intelligenceRepository.findProjects>>,
): IntelligenceInput {
  return {
    hasAssessment: assessment !== null,
    hasRoadmap: roadmap !== null,
    targetRole: assessment?.targetRole ?? null,
    currentSkills: assessment ? [...assessment.currentSkills] : [],
    phases: roadmap ? roadmap.phases.map((phase) => ({ key: phase.key, order: phase.order })) : [],
    goals: goals.map(toGoalInput),
    projects: projects.map((project) => ({ title: project.title, status: project.status })),
  };
}

async function getIntelligence(userId: string): Promise<IntelligenceData> {
  const [assessment, roadmap, projects] = await Promise.all([
    intelligenceRepository.findAssessment(userId),
    intelligenceRepository.findActiveRoadmap(userId),
    intelligenceRepository.findProjects(userId),
  ]);
  const goals = roadmap ? await intelligenceRepository.findGoalsByRoadmapId(roadmap._id) : [];
  return computeIntelligence(toInput(assessment, roadmap, goals, projects));
}

export const intelligenceService = {
  get: getIntelligence,
};
