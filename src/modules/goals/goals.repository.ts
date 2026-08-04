import { Types } from "mongoose";
import { GoalInstanceModel } from "../roadmap/goalInstance.model.js";
import type { GoalInstanceDocument } from "../roadmap/goalInstance.model.js";
import { RoadmapModel } from "../roadmap/roadmap.model.js";
import type { RoadmapDocument } from "../roadmap/roadmap.model.js";
import { goalsErrors } from "./goals.errors.js";
import type { GeneratedTask } from "./goals.types.js";
import { TaskInstanceModel } from "./taskInstance.model.js";
import type { TaskInstanceDocument } from "./taskInstance.model.js";

interface ActivateGoalResult {
  goal: GoalInstanceDocument;
  tasks: TaskInstanceDocument[];
}

async function findGoalForUser(
  goalId: Types.ObjectId,
  userId: string,
): Promise<GoalInstanceDocument | null> {
  return GoalInstanceModel.findOne({ _id: goalId, userId });
}

async function findGoalForUserInSession(
  goalId: Types.ObjectId,
  userId: string,
  session: Awaited<ReturnType<typeof TaskInstanceModel.startSession>>,
): Promise<GoalInstanceDocument | null> {
  return GoalInstanceModel.findOne({ _id: goalId, userId }).session(session);
}

export const goalsRepository = {
  async findActiveRoadmap(userId: string): Promise<RoadmapDocument | null> {
    return RoadmapModel.findOne({ userId, status: "active" });
  },

  async findGoalsByRoadmapId(roadmapId: Types.ObjectId) {
    return GoalInstanceModel.find({ roadmapId }).sort({ order: 1 });
  },

  async findGoalForUser(
    goalId: Types.ObjectId,
    userId: string,
  ): Promise<GoalInstanceDocument | null> {
    return findGoalForUser(goalId, userId);
  },

  async findTasksByGoalId(goalId: Types.ObjectId) {
    return TaskInstanceModel.find({ goalId }).sort({ order: 1 });
  },

  async findTasksByGoalIds(goalIds: Types.ObjectId[]) {
    return TaskInstanceModel.find({ goalId: { $in: goalIds } }).sort({ order: 1 });
  },

  async findTaskForUser(
    taskId: Types.ObjectId,
    goalId: Types.ObjectId,
    userId: string,
  ): Promise<TaskInstanceDocument | null> {
    return TaskInstanceModel.findOne({ _id: taskId, goalId, userId });
  },

  async updateTaskStatus(input: {
    taskId: Types.ObjectId;
    goalId: Types.ObjectId;
    userId: string;
    status: TaskInstanceDocument["status"];
  }): Promise<TaskInstanceDocument | null> {
    return TaskInstanceModel.findOneAndUpdate(
      { _id: input.taskId, goalId: input.goalId, userId: input.userId },
      { status: input.status },
      { new: true },
    );
  },

  async activateGoalWithTasks(input: {
    goalId: Types.ObjectId;
    userId: string;
    roadmapId: Types.ObjectId;
    tasks: GeneratedTask[];
  }): Promise<ActivateGoalResult> {
    const session = await TaskInstanceModel.startSession();
    try {
      let goal: GoalInstanceDocument | null = null;
      let tasks: TaskInstanceDocument[] = [];
      await session.withTransaction(async () => {
        const current = await findGoalForUserInSession(input.goalId, input.userId, session);
        if (!current) {
          throw goalsErrors.goalNotFound();
        }
        if (current.status === "active") {
          goal = current;
          tasks = await TaskInstanceModel.find({ goalId: current._id })
            .sort({ order: 1 })
            .session(session);
          return;
        }
        if (current.status === "completed") {
          throw goalsErrors.goalAlreadyCompleted();
        }

        await TaskInstanceModel.insertMany(
          input.tasks.map((task) => ({
            userId: current.userId,
            roadmapId: input.roadmapId,
            goalId: current._id,
            order: task.order,
            title: task.title,
            description: task.description,
            estimatedEffortHours: task.estimatedEffortHours,
            templateVersion: task.templateVersion,
          })),
          { session },
        );

        const updated = await GoalInstanceModel.findOneAndUpdate(
          { _id: current._id, status: "draft" },
          { status: "active", activatedAt: new Date() },
          { new: true, session },
        );
        if (!updated) {
          throw goalsErrors.goalAlreadyActive();
        }
        goal = updated;
        tasks = await TaskInstanceModel.find({ goalId: current._id })
          .sort({ order: 1 })
          .session(session);
      });
      if (!goal) {
        throw goalsErrors.goalNotFound();
      }
      return { goal, tasks };
    } finally {
      await session.endSession();
    }
  },

  async completeGoal(input: {
    goalId: Types.ObjectId;
    userId: string;
  }): Promise<GoalInstanceDocument> {
    const session = await TaskInstanceModel.startSession();
    try {
      let goal: GoalInstanceDocument | null = null;
      await session.withTransaction(async () => {
        const current = await findGoalForUserInSession(input.goalId, input.userId, session);
        if (!current) {
          throw goalsErrors.goalNotFound();
        }
        if (current.status === "completed") {
          goal = current;
          return;
        }
        if (current.status !== "active") {
          throw goalsErrors.goalNotActive();
        }
        const updated = await GoalInstanceModel.findOneAndUpdate(
          { _id: current._id, status: "active" },
          { status: "completed", completedAt: new Date() },
          { new: true, session },
        );
        if (!updated) {
          throw goalsErrors.goalNotActive();
        }
        goal = updated;
      });
      if (!goal) {
        throw goalsErrors.goalNotFound();
      }
      return goal;
    } finally {
      await session.endSession();
    }
  },
};
