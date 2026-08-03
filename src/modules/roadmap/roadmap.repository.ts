import type { Types } from "mongoose";
import { GoalInstanceModel } from "./goalInstance.model.js";
import { roadmapErrors } from "./roadmap.errors.js";
import { RoadmapModel } from "./roadmap.model.js";
import type { RoadmapDocument } from "./roadmap.model.js";
import type {
  AssessmentSnapshot,
  GeneratedGoal,
  GenerationReason,
  RoadmapPhase,
} from "./roadmap.types.js";

interface CreateRoadmapInput {
  userId: Types.ObjectId;
  version: number;
  assessmentSnapshot: AssessmentSnapshot;
  phases: RoadmapPhase[];
  engineVersion: string;
  catalogVersion: string;
  reason: GenerationReason;
  goals: GeneratedGoal[];
  generatedAt: Date;
}

interface RegenerateRoadmapInput extends CreateRoadmapInput {
  prevVersion: number;
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}

async function insertGoals(
  userId: Types.ObjectId,
  roadmapId: Types.ObjectId,
  goals: GeneratedGoal[],
  session: Awaited<ReturnType<typeof RoadmapModel.startSession>>,
): Promise<void> {
  await GoalInstanceModel.insertMany(
    goals.map((goal) => ({
      userId,
      roadmapId,
      phaseKey: goal.phaseKey,
      order: goal.order,
      templateKey: goal.templateKey,
      templateVersion: goal.templateVersion,
      title: goal.title,
      description: goal.description,
      skillTargets: goal.skillTargets,
      prerequisites: goal.prerequisites,
      estimatedEffortHours: goal.estimatedEffortHours,
      bindings: goal.bindings,
    })),
    { session },
  );
}

export const roadmapRepository = {
  async findActiveByUserId(userId: string): Promise<RoadmapDocument | null> {
    return RoadmapModel.findOne({ userId, status: "active" });
  },

  async findByIdForUser(id: Types.ObjectId, userId: string): Promise<RoadmapDocument | null> {
    return RoadmapModel.findOne({ _id: id, userId });
  },

  async findByUserIdAndVersion(
    userId: string,
    version: number,
  ): Promise<RoadmapDocument | null> {
    return RoadmapModel.findOne({ userId, version });
  },

  async listHistory(userId: string): Promise<RoadmapDocument[]> {
    return RoadmapModel.find({ userId }).sort({ version: -1 });
  },

  async findGoalsByRoadmapId(roadmapId: Types.ObjectId) {
    return GoalInstanceModel.find({ roadmapId }).sort({ order: 1 });
  },

  async createRoadmapWithGoals(input: CreateRoadmapInput): Promise<RoadmapDocument> {
    const session = await RoadmapModel.startSession();
    try {
      let created: RoadmapDocument | null = null;
      await session.withTransaction(async () => {
        const [roadmap] = await RoadmapModel.create(
          [
            {
              userId: input.userId,
              version: input.version,
              status: "active",
              assessmentSnapshot: input.assessmentSnapshot,
              phases: input.phases,
              engineVersion: input.engineVersion,
              catalogVersion: input.catalogVersion,
              reason: input.reason,
              generatedAt: input.generatedAt,
            },
          ],
          { session },
        );
        if (!roadmap) {
          throw new Error("Roadmap creation transaction did not produce a document");
        }
        await insertGoals(input.userId, roadmap._id, input.goals, session);
        created = roadmap;
      });
      if (!created) {
        throw new Error("Roadmap creation transaction did not complete");
      }
      return created;
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        throw roadmapErrors.roadmapAlreadyExists();
      }
      throw err;
    } finally {
      await session.endSession();
    }
  },

  async regenerateRoadmap(input: RegenerateRoadmapInput): Promise<RoadmapDocument> {
    const session = await RoadmapModel.startSession();
    try {
      let created: RoadmapDocument | null = null;
      await session.withTransaction(async () => {
        await RoadmapModel.updateOne(
          { userId: input.userId, status: "active", version: input.prevVersion },
          { status: "archived" },
          { session },
        );
        const [roadmap] = await RoadmapModel.create(
          [
            {
              userId: input.userId,
              version: input.version,
              status: "active",
              assessmentSnapshot: input.assessmentSnapshot,
              phases: input.phases,
              engineVersion: input.engineVersion,
              catalogVersion: input.catalogVersion,
              reason: input.reason,
              generatedAt: input.generatedAt,
            },
          ],
          { session },
        );
        if (!roadmap) {
          throw new Error("Roadmap regeneration transaction did not produce a document");
        }
        await insertGoals(input.userId, roadmap._id, input.goals, session);
        created = roadmap;
      });
      if (!created) {
        throw new Error("Roadmap regeneration transaction did not complete");
      }
      return created;
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        throw roadmapErrors.roadmapAlreadyExists();
      }
      throw err;
    } finally {
      await session.endSession();
    }
  },
};
