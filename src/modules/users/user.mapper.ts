import type { UserDocument } from "./user.model.js";
import type { PublicUser } from "./user.types.js";

export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    ...(user.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
    createdAt: user.createdAt.toISOString(),
  };
}
