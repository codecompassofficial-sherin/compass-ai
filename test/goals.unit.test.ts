import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TASK_TEMPLATES } from "../src/planning/catalog/index.js";
import { TASK_GENERATOR_VERSION } from "../src/modules/goals/goals.constants.js";
import { generateTasks } from "../src/modules/goals/task.generator.js";
import type { TaskGenerationInput } from "../src/modules/goals/task.generator.js";

function input(overrides: Partial<TaskGenerationInput> = {}): TaskGenerationInput {
  return {
    templateKey: "git-and-github-basics",
    title: "Git & GitHub Fundamentals",
    description: "Version control workflow, branching, and collaboration on GitHub.",
    skillTargets: ["Git"],
    estimatedEffortHours: 6,
    ...overrides,
  };
}

describe("task generator", () => {
  it("is deterministic for identical inputs", () => {
    assert.deepEqual(generateTasks(input()), generateTasks(input()));
  });

  it("uses curated task templates when they exist for the goal", () => {
    const tasks = generateTasks(input());
    const curated = TASK_TEMPLATES["git-and-github-basics"];
    assert.ok(curated, "expected curated templates for git-and-github-basics");
    assert.equal(tasks.length, curated.length);
    assert.deepEqual(
      tasks.map((task) => task.title),
      curated.map((template) => template.title),
    );
    for (const task of tasks) {
      assert.equal(task.templateVersion, TASK_GENERATOR_VERSION);
      assert.ok(task.estimatedEffortHours > 0, "task effort must be positive");
    }
  });

  it("produces ordered tasks with effort split across the goal total", () => {
    const tasks = generateTasks(input({ estimatedEffortHours: 6 }));
    assert.deepEqual(
      tasks.map((task) => task.order),
      tasks.map((_task, index) => index + 1),
    );
    const total = tasks.reduce((sum, task) => sum + task.estimatedEffortHours, 0);
    assert.equal(total, 6);
  });

  it("falls back to Learn/Practice/Apply/Reflect tasks for uncurated goals", () => {
    const tasks = generateTasks(
      input({
        templateKey: "sql-and-postgresql",
        title: "SQL & PostgreSQL",
        skillTargets: ["SQL", "PostgreSQL"],
      }),
    );
    assert.equal(tasks.length, 4);
    assert.match(tasks[0]!.title, /^Learn /);
    assert.match(tasks[1]!.title, /^Practice /);
    assert.match(tasks[2]!.title, /^Apply /);
    assert.match(tasks[3]!.title, /^Reflect /);
    assert.match(tasks[0]!.description, /SQL and PostgreSQL/);
  });

  it("handles goals without skill targets", () => {
    const tasks = generateTasks(
      input({
        templateKey: "sql-and-postgresql",
        skillTargets: [],
        title: "Behavioral Interviews",
      }),
    );
    assert.equal(tasks.length, 4);
    assert.match(tasks[0]!.description, /concepts covered/);
  });
});
