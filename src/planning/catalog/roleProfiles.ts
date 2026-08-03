import type { TargetRole } from "../../modules/assessment/assessment.types.js";

export const SKILL_KEYS = [
  "JavaScript",
  "TypeScript",
  "HTML/CSS",
  "Python",
  "Java",
  "Go",
  "C#",
  "Ruby",
  "PHP",
  "React",
  "Angular",
  "Vue",
  "Node.js",
  "Next.js",
  "Express",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Git",
  "Machine Learning",
  "Data Analysis",
  "REST APIs",
  "GraphQL",
  "Kotlin",
  "Swift",
  "Flutter",
  "React Native",
  "Django",
  "Spring Boot",
  "CI/CD",
  "Terraform",
  "Deep Learning",
  "NLP",
  "Linux",
] as const;

export type SkillKey = (typeof SKILL_KEYS)[number];

export interface RoleProfile {
  role: TargetRole;
  title: string;
  summary: string;
  targetSkills: readonly SkillKey[];
}

export const ROLE_PROFILES: readonly RoleProfile[] = [
  {
    role: "Frontend Developer",
    title: "Frontend Developer",
    summary: "Build responsive, accessible, and polished user interfaces.",
    targetSkills: ["HTML/CSS", "JavaScript", "TypeScript", "React", "Next.js", "REST APIs", "Git"],
  },
  {
    role: "Backend Developer",
    title: "Backend Developer",
    summary: "Design and operate reliable, secure APIs and data systems.",
    targetSkills: [
      "JavaScript",
      "TypeScript",
      "Node.js",
      "Express",
      "SQL",
      "PostgreSQL",
      "MongoDB",
      "REST APIs",
      "Docker",
      "Git",
    ],
  },
  {
    role: "Full Stack Developer",
    title: "Full Stack Developer",
    summary: "Own features end to end across frontend, backend, and infrastructure.",
    targetSkills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Express",
      "SQL",
      "MongoDB",
      "REST APIs",
      "Git",
    ],
  },
  {
    role: "Mobile Developer",
    title: "Mobile Developer",
    summary: "Craft native-quality mobile experiences across platforms.",
    targetSkills: [
      "JavaScript",
      "TypeScript",
      "React Native",
      "Flutter",
      "Kotlin",
      "Swift",
      "REST APIs",
      "Git",
    ],
  },
  {
    role: "DevOps Engineer",
    title: "DevOps Engineer",
    summary: "Automate, deploy, and monitor reliable cloud infrastructure.",
    targetSkills: ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Git"],
  },
  {
    role: "AI/ML Engineer",
    title: "AI/ML Engineer",
    summary: "Build data-driven models and production machine learning systems.",
    targetSkills: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "NLP",
      "Data Analysis",
      "SQL",
      "Docker",
      "Git",
    ],
  },
];

export function getRoleProfile(role: TargetRole): RoleProfile | undefined {
  return ROLE_PROFILES.find((profile) => profile.role === role);
}
