import { Types } from "mongoose";
import { UserModel } from "../users/user.model.js";
import type { UserDocument } from "../users/user.model.js";
import {
  EmailVerificationTokenModel,
  PasswordResetTokenModel,
  UserSessionModel,
} from "./auth.model.js";
import type {
  EmailVerificationTokenDocument,
  PasswordResetTokenDocument,
  UserSessionDocument,
} from "./auth.model.js";
import { authErrors } from "./auth.errors.js";

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}

export const authRepository = {
  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email });
  },

  async findUserById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id);
  },

  async createUser(input: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
  }): Promise<UserDocument> {
    try {
      return await UserModel.create(input);
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        throw authErrors.emailAlreadyExists();
      }
      throw err;
    }
  },

  async setEmailVerified(userId: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { isEmailVerified: true } });
  },

  async updateLastLogin(userId: string, at: Date): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { lastLoginAt: at } });
  },

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { passwordHash } });
  },

  async createSession(input: {
    userId: Types.ObjectId;
    refreshTokenHash: string;
    device: string;
    ip: string;
    userAgent: string;
    expiresAt: Date;
  }): Promise<UserSessionDocument> {
    return UserSessionModel.create(input);
  },

  async findSessionByTokenHash(refreshTokenHash: string): Promise<UserSessionDocument | null> {
    return UserSessionModel.findOne({ refreshTokenHash });
  },

  async revokeSession(sessionId: Types.ObjectId, at: Date): Promise<void> {
    await UserSessionModel.updateOne({ _id: sessionId }, { $set: { revokedAt: at } });
  },

  async revokeAllUserSessions(userId: string): Promise<void> {
    await UserSessionModel.updateMany(
      { userId: new Types.ObjectId(userId), revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  },

  async createEmailVerificationToken(input: {
    userId: Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await EmailVerificationTokenModel.create(input);
  },

  async findEmailVerificationToken(
    tokenHash: string,
  ): Promise<EmailVerificationTokenDocument | null> {
    return EmailVerificationTokenModel.findOne({ tokenHash });
  },

  async markEmailVerificationTokenUsed(id: Types.ObjectId, at: Date): Promise<void> {
    await EmailVerificationTokenModel.updateOne({ _id: id }, { $set: { usedAt: at } });
  },

  async createPasswordResetToken(input: {
    userId: Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await PasswordResetTokenModel.create(input);
  },

  async findPasswordResetToken(
    tokenHash: string,
  ): Promise<PasswordResetTokenDocument | null> {
    return PasswordResetTokenModel.findOne({ tokenHash });
  },

  async markPasswordResetTokenUsed(id: Types.ObjectId, at: Date): Promise<void> {
    await PasswordResetTokenModel.updateOne({ _id: id }, { $set: { usedAt: at } });
  },
};
