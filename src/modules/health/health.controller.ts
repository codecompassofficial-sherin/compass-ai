import type { Request, Response } from "express";
import { AppError } from "../../shared/core/AppError.js";
import { success } from "../../shared/core/ApiResponse.js";
import { getMongoState } from "../../shared/database/mongo.js";

export const healthController = {
  getHealth: async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json(
      success({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      }),
    );
  },

  getReady: async (_req: Request, res: Response): Promise<void> => {
    const database = getMongoState();
    if (database !== "connected") {
      throw AppError.serviceUnavailable("Service is not ready", { details: { database } });
    }
    res.status(200).json(success({ status: "ready", database: "connected" }));
  },
};
