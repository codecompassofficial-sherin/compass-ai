import { authErrors } from "../auth/auth.errors.js";
import { toPublicUser } from "../users/user.mapper.js";
import type { PublicUser } from "../users/user.types.js";
import { profileRepository } from "./profile.repository.js";
import type { UpdateProfileInput } from "./profile.validation.js";

async function getProfile(userId: string): Promise<PublicUser> {
  const user = await profileRepository.findUserById(userId);
  if (!user) {
    throw authErrors.invalidAccessToken();
  }
  return toPublicUser(user);
}

async function updateProfile(userId: string, input: UpdateProfileInput): Promise<PublicUser> {
  const user = await profileRepository.updateUser(userId, input);
  if (!user) {
    throw authErrors.invalidAccessToken();
  }
  return toPublicUser(user);
}

export const profileService = {
  getProfile,
  updateProfile,
};
