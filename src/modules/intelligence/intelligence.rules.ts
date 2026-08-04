import { GOAL_TEMPLATES } from "../../planning/catalog/goalTemplates.js";
import type { GoalTemplate } from "../../planning/catalog/goalTemplates.js";
import { PROJECT_TEMPLATES } from "../../planning/catalog/projectTemplates.js";
import type { ProjectTemplate } from "../../planning/catalog/projectTemplates.js";
import { SKILL_KEYS } from "../../planning/catalog/roleProfiles.js";
import { computeCurrentPhaseAndGoal } from "../dashboard/dashboard.stats.js";
import type { TargetRole } from "../assessment/assessment.types.js";
import type {
  IntelligenceData,
  IntelligenceGoalInput,
  IntelligenceInput,
  LearningPriority,
  LearningRecommendation,
  NextBestAction,
  ProjectRecommendation,
  RoadmapInsights,
  SkillGapAnalysis,
} from "./intelligence.types.js";

const MAX_LEARNING_RECOMMENDATIONS = 5;
const MAX_PROJECT_RECOMMENDATIONS = 3;
const RECOMMENDED_SKILL_CAP = 3;

const CATALOG_INDEX = new Map<string, number>(SKILL_KEYS.map((skill, index) => [skill, index]));

function skillIndex(skill: string): number {
  return CATALOG_INDEX.get(skill) ?? SKILL_KEYS.length;
}

function orderedUnion(skills: Iterable<string>): string[] {
  return [...new Set(skills)].sort((a, b) => skillIndex(a) - skillIndex(b));
}

function orderedGoals(input: IntelligenceInput): IntelligenceGoalInput[] {
  const phaseOrder = new Map(input.phases.map((phase) => [phase.key, phase.order]));
  return [...input.goals].sort(
    (a, b) =>
      (phaseOrder.get(a.phaseKey) ?? Number.MAX_SAFE_INTEGER) -
        (phaseOrder.get(b.phaseKey) ?? Number.MAX_SAFE_INTEGER) || a.order - b.order,
  );
}

function computeSkillGap(input: IntelligenceInput): SkillGapAnalysis {
  const targetSkills = orderedUnion(input.goals.flatMap((goal) => goal.skillTargets));
  const completedSkills = orderedUnion(
    input.goals
      .filter((goal) => goal.status === "completed")
      .flatMap((goal) => goal.skillTargets),
  );
  const acquiredSkills = orderedUnion([...input.currentSkills, ...completedSkills]);
  const missingSkills = targetSkills.filter((skill) => !acquiredSkills.includes(skill));

  const ordered = orderedGoals(input);
  const focus =
    ordered.find((goal) => goal.status === "active") ?? ordered.find((goal) => goal.status === "draft");
  const inFocus = focus ? focus.skillTargets.filter((skill) => missingSkills.includes(skill)) : [];
  const recommendedSkills =
    inFocus.length > 0 ? inFocus : missingSkills.slice(0, RECOMMENDED_SKILL_CAP);

  return { acquiredSkills, missingSkills, recommendedSkills };
}

function findApplicableGoalTemplate(
  skill: string,
  targetRole: TargetRole | null,
): GoalTemplate | undefined {
  return GOAL_TEMPLATES.find(
    (template) =>
      (template.skillTargets as readonly string[]).includes(skill) &&
      (template.applicableRoles === undefined ||
        (targetRole !== null && template.applicableRoles.includes(targetRole))),
  );
}

function computeLearningRecommendations(
  input: IntelligenceInput,
  skillGap: SkillGapAnalysis,
): LearningRecommendation[] {
  const results: LearningRecommendation[] = [];
  const addRecommendation = (
    skill: string,
    priority: LearningPriority,
    reason: string,
  ): void => {
    if (results.length >= MAX_LEARNING_RECOMMENDATIONS) {
      return;
    }
    const template = findApplicableGoalTemplate(skill, input.targetRole);
    if (!template) {
      return;
    }
    if (results.some((result) => result.goalKey === template.key)) {
      return;
    }
    results.push({ skill, goalKey: template.key, goalTitle: template.title, reason, priority });
  };

  for (const skill of skillGap.recommendedSkills) {
    addRecommendation(skill, "high", "Supports your current learning focus.");
  }
  for (const skill of skillGap.missingSkills) {
    addRecommendation(skill, "medium", "Closes a gap in your roadmap skills.");
  }
  return results.slice(0, MAX_LEARNING_RECOMMENDATIONS);
}

function projectScore(
  template: ProjectTemplate,
  skillGap: SkillGapAnalysis,
): number {
  let score = 0;
  if (template.skillTargets.some((skill) => skillGap.recommendedSkills.includes(skill))) {
    score += 2;
  }
  if (template.skillTargets.some((skill) => skillGap.missingSkills.includes(skill))) {
    score += 1;
  }
  return score;
}

function computeProjectRecommendations(
  input: IntelligenceInput,
  skillGap: SkillGapAnalysis,
): ProjectRecommendation[] {
  if (!input.hasRoadmap) {
    return [];
  }
  const existingTitles = new Set(input.projects.map((project) => project.title));
  const candidates = PROJECT_TEMPLATES.filter(
    (template) =>
      (template.applicableRoles === undefined ||
        (input.targetRole !== null && template.applicableRoles.includes(input.targetRole))) &&
      !existingTitles.has(template.title),
  );
  const ranked = [...candidates].sort(
    (a, b) =>
      projectScore(b, skillGap) - projectScore(a, skillGap) ||
      PROJECT_TEMPLATES.indexOf(a) - PROJECT_TEMPLATES.indexOf(b),
  );
  return ranked.slice(0, MAX_PROJECT_RECOMMENDATIONS).map((template) => ({
    templateKey: template.key,
    title: template.title,
    description: template.description,
    skillTargets: [...template.skillTargets],
    estimatedEffortHours: template.estimatedEffortHours,
    reason: template.skillTargets.some((skill) => skillGap.recommendedSkills.includes(skill))
      ? "Supports the skills you are currently learning."
      : "Applies skills from your roadmap in a hands-on project.",
  }));
}

function computeNextBestAction(
  input: IntelligenceInput,
  recommendedProject: ProjectRecommendation | null,
): NextBestAction {
  if (!input.hasAssessment) {
    return {
      action: "COMPLETE_ASSESSMENT",
      title: "Complete your career assessment",
      description: "Share your current skills and target role to unlock a personalized plan.",
    };
  }

  if (!input.hasRoadmap) {
    return {
      action: "GENERATE_ROADMAP",
      title: "Generate your learning roadmap",
      description: "Create a personalized roadmap based on your career assessment.",
    };
  }

  const ordered = orderedGoals(input);
  const active = ordered.find((goal) => goal.status === "active");
  if (active) {
    return {
      action: "CONTINUE_GOAL",
      title: "Continue your current goal",
      description: `Keep working on "${active.title}".`,
      goalId: active.id,
    };
  }

  const draft = ordered.find((goal) => goal.status === "draft");
  if (draft) {
    return {
      action: "ACTIVATE_GOAL",
      title: "Start your next learning goal",
      description: `Begin "${draft.title}" to make progress on your roadmap.`,
      goalId: draft.id,
    };
  }

  const allGoalsCompleted =
    input.goals.length > 0 && input.goals.every((goal) => goal.status === "completed");
  const hasActiveProject = input.projects.some((project) => project.status === "in_progress");

  if (!hasActiveProject) {
    return {
      action: "START_PROJECT",
      title: "Start a hands-on project",
      description: recommendedProject
        ? `Build "${recommendedProject.title}" to apply what you have learned.`
        : "Build a portfolio project to apply what you have learned.",
      ...(recommendedProject ? { projectTemplateKey: recommendedProject.templateKey } : {}),
    };
  }

  if (allGoalsCompleted) {
    return {
      action: "REGENERATE_ROADMAP",
      title: "Generate your next roadmap",
      description: "You have completed every goal in your current roadmap. Generate a new one to keep advancing.",
    };
  }

  return {
    action: "REGENERATE_ROADMAP",
    title: "Generate your next roadmap",
    description: "Refresh your roadmap to keep your plan aligned with your goals.",
  };
}

function computeRoadmapInsights(input: IntelligenceInput): RoadmapInsights {
  const totalGoals = input.goals.length;
  const completedGoals = input.goals.filter((goal) => goal.status === "completed").length;
  const remainingGoals = totalGoals - completedGoals;
  const overallProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const current = computeCurrentPhaseAndGoal(input.phases, input.goals);

  let readinessSummary: string;
  if (totalGoals === 0) {
    readinessSummary = "Your roadmap does not have any goals yet.";
  } else if (overallProgress === 100) {
    readinessSummary = "You have completed every goal in your roadmap and are ready for the next step.";
  } else {
    readinessSummary = `You have completed ${completedGoals} of ${totalGoals} goals. ${remainingGoals} remain before you are ready for the next step.`;
  }

  return {
    overallProgress,
    totalGoals,
    completedGoals,
    remainingGoals,
    currentPhase: current.currentPhase,
    currentGoal: current.currentGoal,
    readinessSummary,
  };
}

export function computeIntelligence(input: IntelligenceInput): IntelligenceData {
  const skillGap = computeSkillGap(input);
  const projects = computeProjectRecommendations(input, skillGap);
  const nextBestAction = computeNextBestAction(input, projects[0] ?? null);
  const learning = computeLearningRecommendations(input, skillGap);
  const roadmap = computeRoadmapInsights(input);
  return { nextBestAction, skillGap, learning, projects, roadmap };
}
