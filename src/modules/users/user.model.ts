import { Schema, model } from "mongoose";
import type { Model, Types } from "mongoose";
import type { Role } from "./user.types.js";

export interface UserDocument {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Role;
  isEmailVerified: boolean;
  avatarUrl?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["USER", "ADMIN"] as Role[], default: "USER" },
    isEmailVerified: { type: Boolean, default: false },
    avatarUrl: { type: String, maxlength: 500 },
    lastLoginAt: { type: Date },
  },
  { timestamps: true, collection: "users" },
);

export const UserModel: Model<UserDocument> = model<UserDocument>(
  "User",
  userSchema,
  "users",
);
