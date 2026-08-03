import type { AssessmentDocument } from "../assessment/assessment.model.js";
import { AssessmentModel } from "../assessment/assessment.model.js";
import type { GoalInstanceDocument } from "../roadmap/goalInstance.model.js";
import { GoalInstanceModel } from "../roadmap/goalInstance.model.js";
import type { RoadmapDocument } from "../roadmap/roadmap.model.js";
import { RoadmapModel } from "../roadmap/roadmap.model.js";
import type { ProjectDocument } from "../projects/project.model.js";
import { ProjectModel } from "../projects/project.model.js";
import type { UserDocument } from "../users/user.model.js";
import { UserModel } from "../users/user.model.js";

export const dashboardRepository = {
  async findUser(userId: string): Promise<UserDocument | null> {
    return UserModel.findById(userId);
  },

  async findAssessment(userId: string): Promise<AssessmentDocument | null> {
    return AssessmentModel.findOne({ userId });
  },

  async findActiveRoadmap(userId: string): Promise<RoadmapDocument | null> {
    return RoadmapModel.findOne({ userId, status: "active" });
  },

  async findGoalsByRoadmapId(roadmapId: RoadmapDocument["_id"]): Promise<GoalInstanceDocument[]> {
    return GoalInstanceModel.find({ roadmapId }).sort({ order: 1 });
  },

  async findProjects(userId: string): Promise<ProjectDocument[]> {
    return ProjectModel.find({ userId, status: { $ne: "archived" } });
  },
};
