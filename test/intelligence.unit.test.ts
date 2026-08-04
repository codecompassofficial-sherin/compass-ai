import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeIntelligence } from "../src/modules/intelligence/intelligence.rules.js";
import type {
  IntelligenceGoalInput,
  IntelligenceInput,
  IntelligencePhaseInput,
} from "../src/modules/intelligence/intelligence.types.js";

const PHASES: IntelligencePhaseInput[] = [
  { key: "foundation", order: 1 },
  { key: "core-skills", order: 2 },
  { key: "projects", order: 3 },
  { key: "interview-prep", order: 4 },
];

function goal(
  id: string,
  phaseKey: string,
  order: number,
  status: string,
  templateKey: string,
  skillTargets: string[],
): IntelligenceGoalInput {
  return { id, phaseKey, order, status, templateKey, title: `Goal ${id}`, skillTargets };
}

function input(overrides: Partial<IntelligenceInput> = {}): IntelligenceInput {
  return {
    hasAssessment: false,
    hasRoadmap: false,
    targetRole: null,
    currentSkills: [],
    phases: [],
    goals: [],
    projects: [],
    ...overrides,
  };
}

function backendGoals(): IntelligenceGoalInput[] {
  return [
    goal("g-git", "foundation", 1, "draft", "git-and-github-basics", ["Git"]),
    goal("g-http", "foundation", 2, "draft", "http-and-rest-fundamentals", ["REST APIs"]),
    goal("g-ts", "core-skills", 1, "draft", "typescript-fundamentals", ["TypeScript"]),
    goal("g-node", "core-skills", 2, "draft", "node-and-express-apis", ["Node.js", "Express"]),
    goal("g-sql", "core-skills", 3, "draft", "sql-and-postgresql", ["SQL", "PostgreSQL"]),
    goal("g-mongo", "core-skills", 4, "draft", "mongodb-data-modeling", ["MongoDB"]),
    goal("g-docker", "core-skills", 5, "draft", "docker-containerization", ["Docker"]),
  ];
}

function backendInput(overrides: Partial<IntelligenceInput> = {}): IntelligenceInput {
  return input({
    hasAssessment: true,
    hasRoadmap: true,
    targetRole: "Backend Developer",
    phases: PHASES,
    goals: backendGoals(),
    ...overrides,
  });
}

describe("career intelligence", () => {
  it("returns empty defaults for an empty account", () => {
    const data = computeIntelligence(input());
    assert.equal(data.nextBestAction.action, "COMPLETE_ASSESSMENT");
    assert.deepEqual(data.skillGap, { acquiredSkills: [], missingSkills: [], recommendedSkills: [] });
    assert.deepEqual(data.learning, []);
    assert.deepEqual(data.projects, []);
    assert.deepEqual(data.roadmap, {
      overallProgress: 0,
      totalGoals: 0,
      completedGoals: 0,
      remainingGoals: 0,
      currentPhase: null,
      currentGoal: null,
      readinessSummary: "Your roadmap does not have any goals yet.",
    });
  });

  it("recommends completing the assessment before any roadmap exists", () => {
    const data = computeIntelligence(input({ hasAssessment: false, hasRoadmap: true, phases: PHASES }));
    assert.equal(data.nextBestAction.action, "COMPLETE_ASSESSMENT");
    assert.equal(data.nextBestAction.goalId, undefined);
  });

  it("recommends generating a roadmap once the assessment exists", () => {
    const data = computeIntelligence(
      input({ hasAssessment: true, targetRole: "Backend Developer", currentSkills: ["JavaScript"] }),
    );
    assert.equal(data.nextBestAction.action, "GENERATE_ROADMAP");
    assert.deepEqual(data.skillGap.missingSkills, []);
    assert.deepEqual(data.projects, []);
  });

  it("recommends activating the first draft goal by phase order", () => {
    const data = computeIntelligence(backendInput());
    assert.equal(data.nextBestAction.action, "ACTIVATE_GOAL");
    assert.equal(data.nextBestAction.goalId, "g-git");
    assert.match(data.nextBestAction.description, /Goal g-git/);
  });

  it("recommends continuing a goal when every goal is active", () => {
    const goals = backendGoals().map((item) => ({ ...item, status: "active" }));
    const data = computeIntelligence(backendInput({ goals }));
    assert.equal(data.nextBestAction.action, "CONTINUE_GOAL");
    assert.equal(data.nextBestAction.goalId, "g-git");
  });

  it("prefers an active goal over a draft goal", () => {
    const goals = backendGoals().map((item) => ({ ...item, status: "draft" }));
    goals[1] = { ...goals[1]!, status: "active" };
    const data = computeIntelligence(backendInput({ goals }));
    assert.equal(data.nextBestAction.action, "CONTINUE_GOAL");
    assert.equal(data.nextBestAction.goalId, "g-http");
  });

  it("prefers the lowest-ordered active goal when multiple active and draft goals exist", () => {
    const goals = [
      goal("g-a", "foundation", 1, "completed", "git-and-github-basics", ["Git"]),
      goal("g-b", "core-skills", 1, "active", "typescript-fundamentals", ["TypeScript"]),
      goal("g-c", "core-skills", 2, "active", "node-and-express-apis", ["Node.js", "Express"]),
      goal("g-d", "projects", 1, "draft", "rest-api-service", ["REST APIs"]),
      goal("g-e", "projects", 2, "draft", "portfolio-site", ["HTML", "CSS"]),
    ];
    const data = computeIntelligence(backendInput({ goals }));
    assert.equal(data.nextBestAction.action, "CONTINUE_GOAL");
    assert.equal(data.nextBestAction.goalId, "g-b");
    assert.equal(data.roadmap.currentGoal, "Goal g-b");
    assert.equal(data.roadmap.currentPhase, "core-skills");
    assert.notEqual(data.nextBestAction.goalId, "g-c");
    assert.notEqual(data.nextBestAction.goalId, "g-d");
    assert.notEqual(data.nextBestAction.goalId, "g-e");
  });

  it("recommends starting a project once the roadmap is completed without a project", () => {
    const goals = backendGoals().map((item) => ({ ...item, status: "completed" }));
    const data = computeIntelligence(backendInput({ goals }));
    assert.equal(data.nextBestAction.action, "START_PROJECT");
    assert.equal(data.nextBestAction.projectTemplateKey, "rest-api-service");
  });

  it("recommends regenerating the roadmap once goals are completed and a project is active", () => {
    const goals = backendGoals().map((item) => ({ ...item, status: "completed" }));
    const data = computeIntelligence(
      backendInput({ goals, projects: [{ title: "REST API Service", status: "in_progress" }] }),
    );
    assert.equal(data.nextBestAction.action, "REGENERATE_ROADMAP");
    assert.equal(data.nextBestAction.projectTemplateKey, undefined);
  });

  it("computes the skill gap from current skills, completed goals, and roadmap targets", () => {
    const goals = [
      goal("g-git", "foundation", 1, "draft", "git-and-github-basics", ["Git"]),
      goal("g-http", "foundation", 2, "completed", "http-and-rest-fundamentals", ["REST APIs"]),
      goal("g-ts", "core-skills", 1, "completed", "typescript-fundamentals", ["TypeScript"]),
      goal("g-node", "core-skills", 2, "active", "node-and-express-apis", ["Node.js", "Express"]),
      goal("g-sql", "core-skills", 3, "draft", "sql-and-postgresql", ["SQL", "PostgreSQL"]),
      goal("g-mongo", "core-skills", 4, "draft", "mongodb-data-modeling", ["MongoDB"]),
      goal("g-docker", "core-skills", 5, "draft", "docker-containerization", ["Docker"]),
    ];
    const data = computeIntelligence(
      backendInput({ currentSkills: ["JavaScript", "HTML/CSS"], goals }),
    );
    assert.deepEqual(data.skillGap.acquiredSkills, ["JavaScript", "TypeScript", "HTML/CSS", "REST APIs"]);
    assert.deepEqual(data.skillGap.missingSkills, [
      "Node.js",
      "Express",
      "SQL",
      "MongoDB",
      "PostgreSQL",
      "Docker",
      "Git",
    ]);
    assert.deepEqual(data.skillGap.recommendedSkills, ["Node.js", "Express"]);
  });

  it("falls back to the first missing skills when the focus goal is already covered", () => {
    const data = computeIntelligence(backendInput({ currentSkills: ["Git"] }));
    assert.deepEqual(data.skillGap.recommendedSkills, ["TypeScript", "Node.js", "Express"]);
  });

  it("returns no learning recommendations when every goal is completed", () => {
    const goals = backendGoals().map((item) => ({ ...item, status: "completed" }));
    const data = computeIntelligence(backendInput({ goals }));
    assert.deepEqual(data.learning, []);
  });

  it("builds deterministic learning recommendations from missing skills", () => {
    const goals = [
      goal("g-git", "foundation", 1, "draft", "git-and-github-basics", ["Git"]),
      goal("g-http", "foundation", 2, "completed", "http-and-rest-fundamentals", ["REST APIs"]),
      goal("g-ts", "core-skills", 1, "completed", "typescript-fundamentals", ["TypeScript"]),
      goal("g-node", "core-skills", 2, "active", "node-and-express-apis", ["Node.js", "Express"]),
      goal("g-sql", "core-skills", 3, "draft", "sql-and-postgresql", ["SQL", "PostgreSQL"]),
      goal("g-mongo", "core-skills", 4, "draft", "mongodb-data-modeling", ["MongoDB"]),
      goal("g-docker", "core-skills", 5, "draft", "docker-containerization", ["Docker"]),
    ];
    const data = computeIntelligence(backendInput({ goals }));
    assert.equal(data.learning.length, 4);
    const top = data.learning[0];
    assert.ok(top);
    assert.equal(top.skill, "Node.js");
    assert.equal(top.goalKey, "node-and-express-apis");
    assert.equal(top.priority, "high");
    assert.match(top.reason, /current learning focus/);
    const keys = data.learning.map((entry) => entry.goalKey);
    assert.deepEqual(keys, [
      "node-and-express-apis",
      "sql-and-postgresql",
      "mongodb-data-modeling",
      "git-and-github-basics",
    ]);
  });

  it("ranks project recommendations by support for recommended and missing skills", () => {
    const goals = [
      goal("g-git", "foundation", 1, "draft", "git-and-github-basics", ["Git"]),
      goal("g-http", "foundation", 2, "completed", "http-and-rest-fundamentals", ["REST APIs"]),
      goal("g-ts", "core-skills", 1, "completed", "typescript-fundamentals", ["TypeScript"]),
      goal("g-node", "core-skills", 2, "active", "node-and-express-apis", ["Node.js", "Express"]),
      goal("g-sql", "core-skills", 3, "draft", "sql-and-postgresql", ["SQL", "PostgreSQL"]),
      goal("g-mongo", "core-skills", 4, "draft", "mongodb-data-modeling", ["MongoDB"]),
      goal("g-docker", "core-skills", 5, "draft", "docker-containerization", ["Docker"]),
    ];
    const data = computeIntelligence(backendInput({ goals }));
    assert.equal(data.projects.length, 3);
    const top = data.projects[0];
    const second = data.projects[1];
    const third = data.projects[2];
    assert.ok(top && second && third);
    assert.equal(top.templateKey, "rest-api-service");
    assert.equal(top.reason, "Supports the skills you are currently learning.");
    assert.equal(second.templateKey, "spring-boot-rest-service");
    assert.equal(third.templateKey, "django-blog-platform");
  });

  it("skips project templates the user has already started", () => {
    const data = computeIntelligence(
      backendInput({ projects: [{ title: "REST API Service", status: "planned" }] }),
    );
    assert.ok(!data.projects.some((entry) => entry.templateKey === "rest-api-service"));
    const top = data.projects[0];
    assert.ok(top);
    assert.equal(top.templateKey, "spring-boot-rest-service");
  });

  it("aggregates roadmap insights from goal statuses", () => {
    const goals = [
      goal("g-git", "foundation", 1, "completed", "git-and-github-basics", ["Git"]),
      goal("g-http", "foundation", 2, "draft", "http-and-rest-fundamentals", ["REST APIs"]),
      goal("g-node", "core-skills", 1, "active", "node-and-express-apis", ["Node.js", "Express"]),
    ];
    const data = computeIntelligence(backendInput({ goals }));
    assert.equal(data.roadmap.totalGoals, 3);
    assert.equal(data.roadmap.completedGoals, 1);
    assert.equal(data.roadmap.remainingGoals, 2);
    assert.equal(data.roadmap.overallProgress, 33);
    assert.equal(data.roadmap.currentPhase, "foundation");
    assert.equal(data.roadmap.currentGoal, "Goal g-http");
    assert.match(data.roadmap.readinessSummary, /1 of 3 goals/);
    assert.match(data.roadmap.readinessSummary, /2 remain/);
  });

  it("reports full readiness when every goal is completed", () => {
    const goals = backendGoals().map((item) => ({ ...item, status: "completed" }));
    const data = computeIntelligence(backendInput({ goals }));
    assert.equal(data.roadmap.overallProgress, 100);
    assert.equal(data.roadmap.remainingGoals, 0);
    assert.equal(data.roadmap.currentPhase, null);
    assert.equal(data.roadmap.currentGoal, null);
    assert.match(data.roadmap.readinessSummary, /ready for the next step/);
  });

  it("is deterministic across repeated calls", () => {
    const first = computeIntelligence(backendInput());
    const second = computeIntelligence(backendInput());
    assert.deepEqual(first, second);
  });
});
