import { Types } from "mongoose";
import { AssessmentModel } from "./assessment.model.js";
import type { AssessmentDocument } from "./assessment.model.js";
import { assessmentErrors } from "./assessment.errors.js";
import type { CreateAssessmentInput, UpdateAssessmentInput } from "./assessment.validation.js";

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}

export const assessmentRepository = {
  async findByUserId(userId: string): Promise<AssessmentDocument | null> {
    return AssessmentModel.findOne({ userId });
  },

  async create(
    input: { userId: Types.ObjectId } & CreateAssessmentInput,
  ): Promise<AssessmentDocument> {
    try {
      return await AssessmentModel.create(input);
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        throw assessmentErrors.assessmentAlreadyExists();
      }
      throw err;
    }
  },

  async updateByUserId(
    userId: string,
    input: UpdateAssessmentInput,
  ): Promise<AssessmentDocument | null> {
    return AssessmentModel.findOneAndUpdate({ userId }, input, {
      new: true,
      runValidators: true,
    });
  },
};
