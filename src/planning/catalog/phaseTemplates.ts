export const PHASE_ORDER = ["foundation", "core-skills", "projects", "interview-prep"] as const;

export type PhaseKey = (typeof PHASE_ORDER)[number];

export interface PhaseTemplate {
  key: PhaseKey;
  name: string;
  description: string;
  order: number;
}

export const PHASE_TEMPLATES: readonly PhaseTemplate[] = [
  {
    key: "foundation",
    name: "Foundations",
    description: "Baseline tools and concepts every professional needs.",
    order: 1,
  },
  {
    key: "core-skills",
    name: "Core Skills",
    description: "The role-defining technical skills of your target path.",
    order: 2,
  },
  {
    key: "projects",
    name: "Project Work",
    description: "Hands-on builds that prove your skills to employers.",
    order: 3,
  },
  {
    key: "interview-prep",
    name: "Interview Prep",
    description: "Practice that converts skills into offers.",
    order: 4,
  },
];
