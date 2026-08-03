import { TASK_TEMPLATES } from "../../planning/catalog/taskTemplates.js";
import { TASK_GENERATOR_VERSION } from "./goals.constants.js";
import type { GeneratedTask } from "./goals.types.js";

export interface TaskGenerationInput {
  templateKey: string;
  title: string;
  description: string;
  skillTargets: readonly string[];
  estimatedEffortHours: number;
}

function allocateEffort(totalHours: number, taskCount: number): number[] {
  if (taskCount <= 0) {
    return [];
  }
  const base = Math.floor(totalHours / taskCount);
  const remainder = totalHours - base * taskCount;
  return Array.from({ length: taskCount }, (_unused, index) => base + (index < remainder ? 1 : 0));
}

function describeSkillTargets(skillTargets: readonly string[]): string {
  if (skillTargets.length === 0) {
    return "the concepts covered by this goal";
  }
  if (skillTargets.length === 1) {
    return skillTargets[0] ?? "the concepts covered by this goal";
  }
  const last = skillTargets[skillTargets.length - 1] ?? "";
  return `${skillTargets.slice(0, -1).join(", ")} and ${last}`;
}

function buildFallbackTasks(input: TaskGenerationInput): GeneratedTask[] {
  const templates = [
    {
      title: `Learn ${input.title} fundamentals`,
      description: `Build a working understanding of ${describeSkillTargets(input.skillTargets)}.`,
    },
    {
      title: `Practice ${input.title} hands-on`,
      description: `Complete exercises that apply ${describeSkillTargets(input.skillTargets)}.`,
    },
    {
      title: `Apply ${input.title} to a small project`,
      description: `Use ${describeSkillTargets(input.skillTargets)} to build something real.`,
    },
    {
      title: `Reflect on ${input.title}`,
      description: "Review what you learned and identify gaps to revisit.",
    },
  ];
  const effort = allocateEffort(input.estimatedEffortHours, templates.length);
  return templates.map((template, index) => ({
    order: index + 1,
    title: template.title,
    description: template.description,
    estimatedEffortHours: effort[index] ?? 1,
    templateVersion: TASK_GENERATOR_VERSION,
  }));
}

export function generateTasks(input: TaskGenerationInput): GeneratedTask[] {
  const curated = TASK_TEMPLATES[input.templateKey];
  if (curated && curated.length > 0) {
    const effort = allocateEffort(input.estimatedEffortHours, curated.length);
    return curated.map((template, index) => ({
      order: index + 1,
      title: template.title,
      description: template.description,
      estimatedEffortHours: effort[index] ?? template.estimatedEffortHours,
      templateVersion: TASK_GENERATOR_VERSION,
    }));
  }
  return buildFallbackTasks(input);
}
