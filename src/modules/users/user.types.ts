export type Role = "USER" | "ADMIN";

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
}
