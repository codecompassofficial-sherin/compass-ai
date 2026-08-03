import type { TargetRole } from "../../modules/assessment/assessment.types.js";
import type { StackKey } from "./goalTemplates.js";
import type { PhaseKey } from "./phaseTemplates.js";
import type { SkillKey } from "./roleProfiles.js";

export interface ProjectTemplate {
  key: string;
  phaseKey: PhaseKey;
  title: string;
  description: string;
  skillTargets: readonly SkillKey[];
  prerequisites: readonly SkillKey[];
  stacks?: readonly StackKey[];
  applicableRoles?: readonly TargetRole[];
  estimatedEffortHours: number;
}

export const PROJECT_TEMPLATES: readonly ProjectTemplate[] = [
  {
    key: "portfolio-website",
    phaseKey: "projects",
    title: "Portfolio Website",
    description: "Ship a polished personal site that showcases your projects and writing.",
    skillTargets: ["HTML/CSS", "JavaScript"],
    prerequisites: [],
    applicableRoles: ["Frontend Developer", "Full Stack Developer"],
    estimatedEffortHours: 20,
  },
  {
    key: "mern-ecommerce-app",
    phaseKey: "projects",
    title: "MERN E-Commerce App",
    description: "Full stack storefront with authentication, catalog, and cart flows.",
    skillTargets: ["React", "Node.js", "Express", "MongoDB"],
    prerequisites: ["JavaScript"],
    stacks: ["MERN"],
    applicableRoles: ["Full Stack Developer"],
    estimatedEffortHours: 35,
  },
  {
    key: "rest-api-service",
    phaseKey: "projects",
    title: "REST API Service",
    description: "Production-style REST API with validation, tests, and documentation.",
    skillTargets: ["Node.js", "Express", "SQL", "PostgreSQL"],
    prerequisites: ["JavaScript"],
    applicableRoles: ["Backend Developer", "Full Stack Developer"],
    estimatedEffortHours: 25,
  },
  {
    key: "spring-boot-rest-service",
    phaseKey: "projects",
    title: "Spring Boot REST Service",
    description: "Secured Java REST service with Spring Boot and a data layer.",
    skillTargets: ["Java", "Spring Boot"],
    prerequisites: ["Java"],
    stacks: ["Spring Boot"],
    applicableRoles: ["Backend Developer"],
    estimatedEffortHours: 28,
  },
  {
    key: "django-blog-platform",
    phaseKey: "projects",
    title: "Django Blog Platform",
    description: "Content platform with authentication, comments, and an admin panel.",
    skillTargets: ["Python", "Django"],
    prerequisites: ["Python"],
    stacks: ["Django"],
    applicableRoles: ["Backend Developer"],
    estimatedEffortHours: 24,
  },
  {
    key: "react-native-mobile-app",
    phaseKey: "projects",
    title: "React Native Mobile App",
    description: "Cross-platform app with offline support and native integrations.",
    skillTargets: ["React Native"],
    prerequisites: ["React"],
    stacks: ["React Native"],
    applicableRoles: ["Mobile Developer"],
    estimatedEffortHours: 22,
  },
  {
    key: "flutter-weather-app",
    phaseKey: "projects",
    title: "Flutter Weather App",
    description: "Location-aware weather app with live API data and clean UI.",
    skillTargets: ["Flutter"],
    prerequisites: [],
    stacks: ["Flutter"],
    applicableRoles: ["Mobile Developer"],
    estimatedEffortHours: 20,
  },
  {
    key: "devops-cicd-pipeline",
    phaseKey: "projects",
    title: "DevOps CI/CD Pipeline",
    description: "Automated build, test, and deploy pipeline for a sample service.",
    skillTargets: ["CI/CD", "Docker"],
    prerequisites: ["Git", "Docker"],
    applicableRoles: ["DevOps Engineer"],
    estimatedEffortHours: 24,
  },
  {
    key: "cloud-deployed-service",
    phaseKey: "projects",
    title: "Cloud-Deployed Service",
    description: "Containerized service deployed to a managed cloud with monitoring.",
    skillTargets: ["AWS", "Docker", "CI/CD"],
    prerequisites: ["Docker"],
    applicableRoles: ["DevOps Engineer"],
    estimatedEffortHours: 26,
  },
  {
    key: "ml-model-deployment",
    phaseKey: "projects",
    title: "ML Model Deployment",
    description: "Train a model and expose it through a small serving API.",
    skillTargets: ["Python", "Machine Learning"],
    prerequisites: ["Python"],
    applicableRoles: ["AI/ML Engineer"],
    estimatedEffortHours: 30,
  },
  {
    key: "data-analysis-portfolio",
    phaseKey: "projects",
    title: "Data Analysis Portfolio",
    description: "End-to-end analysis notebook with visualizations and a writeup.",
    skillTargets: ["Data Analysis", "Python"],
    prerequisites: ["Python"],
    applicableRoles: ["AI/ML Engineer"],
    estimatedEffortHours: 16,
  },
];
