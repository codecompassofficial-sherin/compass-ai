import type { Request, Response } from "express";
import { success } from "../../shared/common/ApiResponse.js";
import { profileService } from "./profile.service.js";
import type { UpdateProfileInput } from "./profile.validation.js";

export const profileController = {
  getProfile: async (req: Request, res: Response): Promise<void> => {
    const user = await profileService.getProfile(req.auth!.user.id);
    res.status(200).json(success({ user }));
  },

  updateProfile: async (req: Request, res: Response): Promise<void> => {
    const user = await profileService.updateProfile(
      req.auth!.user.id,
      req.body as UpdateProfileInput,
    );
    res.status(200).json(success({ user }, "Profile updated successfully."));
  },
};
