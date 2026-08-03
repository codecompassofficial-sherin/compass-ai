import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TARGET_ROLES } from "../src/modules/assessment/assessment.constants.js";
import {
  CATALOG_VERSION,
  GOAL_TEMPLATES,
  PHASE_TEMPLATES,
  PROJECT_TEMPLATES,
  ROLE_PROFILES,
  SKILL_KEYS,
  STACK_KEYS,
} from "../src/planning/catalog/index.js";
import { ENGINE_VERSION } from "../src/modules/roadmap/roadmap.constants.js";
import { generateRoadmap } from "../src/modules/roadmap/roadmap.generator.js";
import type { AssessmentSnapshot } from "../src/modules/roadmap/roadmap.types.js";

const PHASE_KEYS = PHASE_TEMPLATES.map((phase) => phase.key);
const SKILL_SET = new Set<string>(SKILL_KEYS);
const STACK_SET = new Set<string>(STACK_KEYS);
const ROLE_SET = new Set<string>(TARGET_ROLES);

function snapshot(overrides: Partial<AssessmentSnapshot> = {}): AssessmentSnapshot {
  return {
    targetRole: "Backend Developer",
    experienceLevel: "Beginner",
    technologyPreferences: ["MERN"],
    currentSkills: [],
    primaryCareerGoal: "First Tech Role",
    targetTimeline: "6 Months",
    ...overrides,
  };
}

function generatedGoals(overrides: Partial<AssessmentSnapshot> = {}) {
  return generateRoadmap({
    assessment: snapshot(overrides),
    engineVersion: ENGINE_VERSION,
    catalogVersion: CATALOG_VERSION,
  });
}

describe("catalog integrity", () => {
  it("declares unique skill keys", () => {
    assert.equal(new Set(SKILL_KEYS).size, SKILL_KEYS.length);
  });

  it("declares a role profile for every assessment target role", () => {
    const profileRoles = new Set(ROLE_PROFILES.map((profile) => profile.role));
    for (const role of TARGET_ROLES) {
      assert.ok(profileRoles.has(role), `missing role profile for ${role}`);
    }
  });

  it("keeps role profile target skills within the skill registry", () => {
    for (const profile of ROLE_PROFILES) {
      for (const skill of profile.targetSkills) {
        assert.ok(SKILL_SET.has(skill), `unknown skill "${skill}" in ${profile.role}`);
      }
    }
  });

  it("keeps goal and project template keys unique", () => {
    const goalKeys = GOAL_TEMPLATES.map((template) => template.key);
    assert.equal(new Set(goalKeys).size, goalKeys.length);

    const projectKeys = PROJECT_TEMPLATES.map((template) => template.key);
    assert.equal(new Set(projectKeys).size, projectKeys.length);
  });

  it("keeps goal and project templates within the phase registry", () => {
    for (const template of [...GOAL_TEMPLATES, ...PROJECT_TEMPLATES]) {
      assert.ok(PHASE_KEYS.includes(template.phaseKey), `${template.key} has bad phase`);
    }
  });

  it("keeps goal and project skills, prerequisites, and stacks within the registries", () => {
    for (const template of [...GOAL_TEMPLATES, ...PROJECT_TEMPLATES]) {
      for (const skill of [...template.skillTargets, ...template.prerequisites]) {
        assert.ok(SKILL_SET.has(skill), `unknown skill "${skill}" in ${template.key}`);
      }
      if (template.stacks) {
        for (const stack of template.stacks) {
          assert.ok(STACK_SET.has(stack), `unknown stack "${stack}" in ${template.key}`);
        }
      }
      if (template.applicableRoles) {
        for (const role of template.applicableRoles) {
          assert.ok(ROLE_SET.has(role), `unknown role "${role}" in ${template.key}`);
        }
      }
      assert.ok(
        template.estimatedEffortHours > 0,
        `${template.key} must have a positive estimated effort`,
      );
    }
  });
});

describe("roadmap generator", () => {
  it("is deterministic for identical inputs", () => {
    const first = generatedGoals();
    const second = generatedGoals();
    assert.deepEqual(first, second);
  });

  it("produces different roadmaps for different target roles", () => {
    const backend = generatedGoals();
    const frontend = generatedGoals({ targetRole: "Frontend Developer" });
    assert.notDeepEqual(backend, frontend);
  });

  it("emits phases in catalog order", () => {
    const { phases } = generatedGoals();
    assert.deepEqual(
      phases.map((phase) => phase.key),
      PHASE_KEYS,
    );
  });

  it("emits goals grouped by phase in catalog order with ascending order", () => {
    const { phases, goals } = generatedGoals();
    assert.ok(goals.length > 0);

    const phaseOrder = new Map(phases.map((phase) => [phase.key, phase.order]));
    for (let index = 0; index < goals.length - 1; index += 1) {
      const current = goals[index]!;
      const next = goals[index + 1]!;
      const currentPhase = phaseOrder.get(current.phaseKey)!;
      const nextPhase = phaseOrder.get(next.phaseKey)!;
      assert.ok(
        currentPhase < nextPhase || (currentPhase === nextPhase && current.order < next.order),
        "goals are not ordered by phase and order",
      );
    }

    for (const phase of phases) {
      const phaseGoals = goals.filter((goal) => goal.phaseKey === phase.key);
      assert.deepEqual(
        phaseGoals.map((goal) => goal.order),
        phaseGoals.map((_goal, index) => index + 1),
        `${phase.key} orders must be sequential from 1`,
      );
    }
  });

  it("pins every goal to the active catalog version", () => {
    const { goals } = generatedGoals();
    assert.ok(goals.length > 0);
    for (const goal of goals) {
      assert.equal(goal.templateVersion, CATALOG_VERSION);
    }
  });

  it("skips goals the user has already mastered", () => {
    const baseline = generatedGoals({ targetRole: "Full Stack Developer" });
    const mastered = generatedGoals({
      targetRole: "Full Stack Developer",
      currentSkills: ["Git", "JavaScript", "TypeScript", "React"],
    });

    const baselineKeys = new Set(baseline.goals.map((goal) => goal.templateKey));
    const masteredKeys = new Set(mastered.goals.map((goal) => goal.templateKey));

    assert.ok(baselineKeys.has("git-and-github-basics"));
    assert.ok(!masteredKeys.has("git-and-github-basics"));
    assert.ok(!masteredKeys.has("modern-javascript-essentials"));
    assert.ok(!masteredKeys.has("typescript-fundamentals"));
    assert.ok(!masteredKeys.has("react-fundamentals"));
    assert.ok(masteredKeys.has("algorithms-and-data-structures"));
    assert.ok(mastered.goals.length < baseline.goals.length);
  });

  it("binds preferred stacks and existing skills to the goals that use them", () => {
    const { goals } = generatedGoals({
      targetRole: "Full Stack Developer",
      technologyPreferences: ["MERN"],
      currentSkills: ["JavaScript", "Node.js"],
    });

    const nodeGoal = goals.find((goal) => goal.templateKey === "node-and-express-apis");
    assert.ok(nodeGoal, "expected node-and-express-apis goal to be present");
    assert.deepEqual(nodeGoal!.bindings.technologyPreferences, ["MERN"]);
    assert.deepEqual(nodeGoal!.bindings.currentSkills, ["Node.js"]);

    const gitGoal = goals.find((goal) => goal.templateKey === "git-and-github-basics");
    assert.ok(gitGoal, "expected git-and-github-basics goal to be present");
    assert.deepEqual(gitGoal!.bindings.technologyPreferences, []);
  });

  it("produces a non-empty roadmap for every target role", () => {
    for (const role of TARGET_ROLES) {
      const { phases, goals } = generatedGoals({ targetRole: role });
      assert.ok(goals.length > 0, `${role} roadmap must not be empty`);
      for (const phase of phases) {
        const phaseGoals = goals.filter((goal) => goal.phaseKey === phase.key);
        assert.ok(phaseGoals.length > 0, `${role} phase "${phase.key}" must not be empty`);
      }
    }
  });
});
