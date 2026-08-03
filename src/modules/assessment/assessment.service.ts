import { Types } from "mongoose";
import { assessmentErrors } from "./assessment.errors.js";
import type { AssessmentDocument } from "./assessment.model.js";
import { assessmentRepository } from "./assessment.repository.js";
import type { PublicAssessment } from "./assessment.types.js";
import type { CreateAssessmentInput, UpdateAssessmentInput } from "./assessment.validation.js";

function toPublicAssessment(assessment: AssessmentDocument): PublicAssessment {
  return {
    id: assessment._id.toString(),
    targetRole: assessment.targetRole,
    experienceLevel: assessment.experienceLevel,
    technologyPreferences: assessment.technologyPreferences,
    currentSkills: assessment.currentSkills,
    primaryCareerGoal: assessment.primaryCareerGoal,
    ...(assessment.additionalNotes ? { additionalNotes: assessment.additionalNotes } : {}),
    targetTimeline: assessment.targetTimeline,
    createdAt: assessment.createdAt.toISOString(),
    updatedAt: assessment.updatedAt.toISOString(),
  };
}

async function createAssessment(
  userId: string,
  input: CreateAssessmentInput,
): Promise<PublicAssessment> {
  const existing = await assessmentRepository.findByUserId(userId);
  if (existing) {
    throw assessmentErrors.assessmentAlreadyExists();
  }

  const assessment = await assessmentRepository.create({
    userId: new Types.ObjectId(userId),
    ...input,
  });

  return toPublicAssessment(assessment);
}

async function getAssessment(userId: string): Promise<PublicAssessment> {
  const assessment = await assessmentRepository.findByUserId(userId);
  if (!assessment) {
    throw assessmentErrors.assessmentNotFound();
  }
  return toPublicAssessment(assessment);
}

async function updateAssessment(
  userId: string,
  input: UpdateAssessmentInput,
): Promise<PublicAssessment> {
  const assessment = await assessmentRepository.updateByUserId(userId, input);
  if (!assessment) {
    throw assessmentErrors.assessmentNotFound();
  }
  return toPublicAssessment(assessment);
}

export const assessmentService = {
  create: createAssessment,
  get: getAssessment,
  update: updateAssessment,
};
