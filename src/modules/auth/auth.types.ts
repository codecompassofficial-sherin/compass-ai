export type Role = "USER" | "ADMIN";

export interface AuthUser {
  id: string;
  role: Role;
}

export interface AuthContext {
  user: AuthUser;
}

export interface SessionContext {
  device: string;
  ip: string;
  userAgent: string;
}

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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSessionResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}
