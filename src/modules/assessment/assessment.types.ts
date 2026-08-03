import {
  CURRENT_SKILLS,
  EXPERIENCE_LEVELS,
  PRIMARY_CAREER_GOALS,
  TARGET_ROLES,
  TARGET_TIMELINES,
  TECHNOLOGY_PREFERENCES,
} from "./assessment.constants.js";

export type TargetRole = (typeof TARGET_ROLES)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type TechnologyPreference = (typeof TECHNOLOGY_PREFERENCES)[number];
export type CurrentSkill = (typeof CURRENT_SKILLS)[number];
export type PrimaryCareerGoal = (typeof PRIMARY_CAREER_GOALS)[number];
export type TargetTimeline = (typeof TARGET_TIMELINES)[number];

export interface PublicAssessment {
  id: string;
  targetRole: TargetRole;
  experienceLevel: ExperienceLevel;
  technologyPreferences: TechnologyPreference[];
  currentSkills: CurrentSkill[];
  primaryCareerGoal: PrimaryCareerGoal;
  additionalNotes?: string;
  targetTimeline: TargetTimeline;
  createdAt: string;
  updatedAt: string;
}
