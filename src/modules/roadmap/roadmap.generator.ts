import {
  GOAL_TEMPLATES,
  PHASE_TEMPLATES,
  PROJECT_TEMPLATES,
  getRoleProfile,
} from "../../planning/catalog/index.js";
import type { AssessmentSnapshot, GeneratedGoal, GeneratedRoadmap } from "./roadmap.types.js";

export interface GenerateRoadmapInput {
  assessment: AssessmentSnapshot;
  engineVersion: string;
  catalogVersion: string;
}

function isApplicableToRole(
  applicableRoles: readonly string[] | undefined,
  role: string,
): boolean {
  return applicableRoles === undefined || applicableRoles.includes(role);
}

function isMastered(skillTargets: readonly string[], currentSkills: readonly string[]): boolean {
  return skillTargets.every((skill) => currentSkills.includes(skill));
}

function computeBindings(
  skillTargets: readonly string[],
  stacks: readonly string[] | undefined,
  assessment: AssessmentSnapshot,
) {
  const technologyPreferences = stacks
    ? assessment.technologyPreferences.filter((preference) => stacks.includes(preference))
    : [];
  const currentSkills = assessment.currentSkills.filter((skill) => skillTargets.includes(skill));
  return { technologyPreferences, currentSkills };
}

export function generateRoadmap(input: GenerateRoadmapInput): GeneratedRoadmap {
  const { assessment, engineVersion, catalogVersion } = input;

  if (!engineVersion || !catalogVersion) {
    throw new Error("engineVersion and catalogVersion are required to generate a roadmap");
  }

  const roleProfile = getRoleProfile(assessment.targetRole);
  if (!roleProfile) {
    throw new Error(`No role profile registered for target role "${assessment.targetRole}"`);
  }

  const phases = PHASE_TEMPLATES.map((phase) => ({
    key: phase.key,
    name: phase.name,
    description: phase.description,
    order: phase.order,
  }));

  const goals: GeneratedGoal[] = [];
  for (const phase of PHASE_TEMPLATES) {
    const templates = [
      ...GOAL_TEMPLATES.filter((template) => template.phaseKey === phase.key),
      ...PROJECT_TEMPLATES.filter((template) => template.phaseKey === phase.key),
    ];

    let order = 1;
    for (const template of templates) {
      if (!isApplicableToRole(template.applicableRoles, assessment.targetRole)) {
        continue;
      }
      if (
        template.skillTargets.length > 0 &&
        isMastered(template.skillTargets, assessment.currentSkills)
      ) {
        continue;
      }

      goals.push({
        phaseKey: phase.key,
        order,
        templateKey: template.key,
        templateVersion: catalogVersion,
        title: template.title,
        description: template.description,
        skillTargets: [...template.skillTargets],
        prerequisites: [...template.prerequisites],
        estimatedEffortHours: template.estimatedEffortHours,
        bindings: computeBindings(template.skillTargets, template.stacks, assessment),
      });
      order += 1;
    }
  }

  return { phases, goals };
}
