import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PROJECT_STATUS_TRANSITIONS } from "../src/modules/projects/projects.constants.js";
import type { ProjectStatus } from "../src/modules/projects/projects.constants.js";
import { AppError } from "../src/shared/common/AppError.js";
import { projectsService } from "../src/modules/projects/projects.service.js";

const STATUSES = Object.keys(PROJECT_STATUS_TRANSITIONS) as ProjectStatus[];

describe("project status transitions", () => {
  it("allows every declared forward transition", () => {
    for (const current of STATUSES) {
      for (const next of PROJECT_STATUS_TRANSITIONS[current]) {
        assert.doesNotThrow(() => projectsService.validateStatusTransition(current, next));
      }
    }
  });

  it("rejects every undeclared transition", () => {
    for (const current of STATUSES) {
      for (const next of STATUSES) {
        if (PROJECT_STATUS_TRANSITIONS[current].includes(next)) {
          continue;
        }
        assert.throws(
          () => projectsService.validateStatusTransition(current, next),
          (err: unknown) =>
            err instanceof AppError &&
            err.code === "INVALID_PROJECT_STATUS_TRANSITION",
          `expected ${current} -> ${next} to be rejected`,
        );
      }
    }
  });

  it("enforces the planned -> in_progress -> completed -> archived chain", () => {
    assert.deepEqual(PROJECT_STATUS_TRANSITIONS.planned, ["in_progress", "archived"]);
    assert.deepEqual(PROJECT_STATUS_TRANSITIONS.in_progress, ["completed", "archived"]);
    assert.deepEqual(PROJECT_STATUS_TRANSITIONS.completed, ["archived"]);
    assert.deepEqual(PROJECT_STATUS_TRANSITIONS.archived, []);
  });
});
