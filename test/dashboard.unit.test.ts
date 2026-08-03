import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeCurrentPhaseAndGoal,
  computeEmptyStats,
  computeRoadmap,
  computeStats,
} from "../src/modules/dashboard/dashboard.stats.js";
import type { DashboardStatsInput, GoalStatInput } from "../src/modules/dashboard/dashboard.types.js";

const PHASES = [
  { key: "foundation", order: 1 },
  { key: "core-skills", order: 2 },
  { key: "projects", order: 3 },
  { key: "interview-prep", order: 4 },
];

function goal(id: string, phaseKey: string, order: number, status: string): GoalStatInput {
  return { id, phaseKey, order, status };
}

function input(overrides: Partial<DashboardStatsInput> = {}): DashboardStatsInput {
  return {
    phases: PHASES,
    goals: [],
    totalProjects: 0,
    completedProjects: 0,
    accountCreatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("dashboard statistics", () => {
  it("returns empty defaults when there are no goals", () => {
    const computed = computeStats(input());
    assert.deepEqual(computed.goals, { totalGoals: 0, draft: 0, active: 0, completed: 0, progress: 0 });
    assert.equal(computed.roadmap.progress, 0);
    assert.equal(computed.roadmap.completedPhases, 0);
    assert.equal(computed.statistics.totalGoals, 0);
    assert.equal(computed.statistics.completedGoals, 0);
    assert.equal(computed.statistics.currentPhase, null);
    assert.equal(computed.statistics.currentGoal, null);
  });

  it("counts goal statuses and computes goal progress", () => {
    const goals = [
      goal("g1", "foundation", 1, "completed"),
      goal("g2", "foundation", 2, "completed"),
      goal("g3", "core-skills", 1, "active"),
      goal("g4", "core-skills", 2, "draft"),
    ];
    const computed = computeStats(input({ goals }));
    assert.deepEqual(computed.goals, { totalGoals: 4, draft: 1, active: 1, completed: 2, progress: 50 });
    assert.equal(computed.statistics.totalGoals, 4);
    assert.equal(computed.statistics.completedGoals, 2);
    assert.equal(computed.statistics.activeGoals, 1);
  });

  it("counts a phase as complete only when all of its goals are completed", () => {
    const allDone = computeRoadmap(PHASES, [
      goal("g1", "foundation", 1, "completed"),
      goal("g2", "foundation", 2, "completed"),
      goal("g3", "core-skills", 1, "completed"),
    ]);
    assert.equal(allDone.completedPhases, 2);
    assert.equal(allDone.progress, 50);

    const partial = computeRoadmap(PHASES, [
      goal("g1", "foundation", 1, "completed"),
      goal("g2", "foundation", 2, "draft"),
    ]);
    assert.equal(partial.completedPhases, 0);
    assert.equal(partial.progress, 0);
  });

  it("treats a phase with no goals as incomplete", () => {
    const roadmap = computeRoadmap(PHASES, [goal("g1", "foundation", 1, "completed")]);
    assert.equal(roadmap.completedPhases, 1);
    assert.equal(roadmap.progress, 25);
    assert.equal(roadmap.totalPhases, 4);
  });

  it("reports the current phase and goal by phase order", () => {
    const goals = [
      goal("g1", "foundation", 1, "completed"),
      goal("g2", "foundation", 2, "draft"),
      goal("g3", "core-skills", 1, "active"),
    ];
    const current = computeCurrentPhaseAndGoal(PHASES, goals);
    assert.equal(current.currentPhase, "foundation");
    assert.equal(current.currentGoal, "g2");
  });

  it("prefers an active goal within the same phase", () => {
    const goals = [
      goal("g1", "foundation", 1, "draft"),
      goal("g2", "foundation", 2, "active"),
    ];
    const current = computeCurrentPhaseAndGoal(PHASES, goals);
    assert.equal(current.currentPhase, "foundation");
    assert.equal(current.currentGoal, "g2");
  });

  it("returns nulls when every goal is completed", () => {
    const goals = [
      goal("g1", "foundation", 1, "completed"),
      goal("g2", "core-skills", 1, "completed"),
      goal("g3", "projects", 1, "completed"),
      goal("g4", "interview-prep", 1, "completed"),
    ];
    const current = computeCurrentPhaseAndGoal(PHASES, goals);
    assert.equal(current.currentPhase, null);
    assert.equal(current.currentGoal, null);
  });

  it("orders goals by phase even when phase keys are unordered", () => {
    const goals = [
      goal("g-late", "interview-prep", 1, "draft"),
      goal("g-early", "foundation", 1, "draft"),
    ];
    const current = computeCurrentPhaseAndGoal(PHASES, goals);
    assert.equal(current.currentPhase, "foundation");
    assert.equal(current.currentGoal, "g-early");
  });

  it("aggregates project counts into statistics", () => {
    const computed = computeStats(input({ totalProjects: 7, completedProjects: 3 }));
    assert.equal(computed.statistics.totalProjects, 7);
    assert.equal(computed.statistics.completedProjects, 3);
  });

  it("carries accountCreatedAt through to statistics", () => {
    const computed = computeStats(input());
    assert.equal(computed.statistics.accountCreatedAt, "2026-01-01T00:00:00.000Z");
  });

  it("returns empty defaults for a missing roadmap", () => {
    const empty = computeEmptyStats("2026-01-01T00:00:00.000Z");
    assert.deepEqual(empty.goals, { totalGoals: 0, draft: 0, active: 0, completed: 0, progress: 0 });
    assert.equal(empty.statistics.totalProjects, 0);
    assert.equal(empty.statistics.currentPhase, null);
    assert.equal(empty.statistics.currentGoal, null);
    assert.equal(empty.statistics.accountCreatedAt, "2026-01-01T00:00:00.000Z");
  });
});
