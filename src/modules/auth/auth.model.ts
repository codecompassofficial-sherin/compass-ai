import { Schema, model } from "mongoose";
import type { Model, Types } from "mongoose";

export interface UserSessionDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  refreshTokenHash: string;
  device: string;
  ip: string;
  userAgent: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailVerificationTokenDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

export interface PasswordResetTokenDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

const userSessionSchema = new Schema<UserSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refreshTokenHash: { type: String, required: true, unique: true, index: true },
    device: { type: String, default: "unknown", maxlength: 200 },
    ip: { type: String, default: "unknown", maxlength: 64 },
    userAgent: { type: String, default: "unknown", maxlength: 500 },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date },
  },
  { timestamps: true, collection: "userSessions" },
);

const emailVerificationTokenSchema = new Schema<EmailVerificationTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date },
  },
  { timestamps: true, collection: "emailVerificationTokens" },
);

const passwordResetTokenSchema = new Schema<PasswordResetTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date },
  },
  { timestamps: true, collection: "passwordResetTokens" },
);

export const UserSessionModel: Model<UserSessionDocument> = model<UserSessionDocument>(
  "UserSession",
  userSessionSchema,
  "userSessions",
);

export const EmailVerificationTokenModel: Model<EmailVerificationTokenDocument> =
  model<EmailVerificationTokenDocument>(
    "EmailVerificationToken",
    emailVerificationTokenSchema,
    "emailVerificationTokens",
  );

export const PasswordResetTokenModel: Model<PasswordResetTokenDocument> =
  model<PasswordResetTokenDocument>(
    "PasswordResetToken",
    passwordResetTokenSchema,
    "passwordResetTokens",
  );
