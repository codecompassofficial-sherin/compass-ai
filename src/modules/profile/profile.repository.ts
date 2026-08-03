import type { UpdateQuery } from "mongoose";
import { UserModel } from "../users/user.model.js";
import type { UserDocument } from "../users/user.model.js";
import type { UpdateProfileInput } from "./profile.validation.js";

export const profileRepository = {
  async findUserById(userId: string): Promise<UserDocument | null> {
    return UserModel.findById(userId);
  },

  async updateUser(userId: string, input: UpdateProfileInput): Promise<UserDocument | null> {
    const $set: Partial<Pick<UserDocument, "firstName" | "lastName" | "avatarUrl">> = {};
    let unsetAvatar = false;

    if (input.firstName !== undefined) {
      $set.firstName = input.firstName;
    }
    if (input.lastName !== undefined) {
      $set.lastName = input.lastName;
    }
    if (input.avatarUrl !== undefined) {
      if (input.avatarUrl === null) {
        unsetAvatar = true;
      } else {
        $set.avatarUrl = input.avatarUrl;
      }
    }

    const update: UpdateQuery<UserDocument> = { $set };
    if (unsetAvatar) {
      update.$unset = { avatarUrl: "" };
    }

    return UserModel.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
  },
};
