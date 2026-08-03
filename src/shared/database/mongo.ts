import mongoose from "mongoose";
import {
  MONGO_RETRY_ATTEMPTS,
  MONGO_RETRY_DELAY_MS,
  MONGO_SERVER_SELECTION_TIMEOUT_MS,
} from "../../config/constants.js";
import { logger } from "../logger/logger.js";

export type MongoState =
  | "uninitialized"
  | "connecting"
  | "connected"
  | "disconnecting"
  | "disconnected";

mongoose.connection.on("connected", () => {
  logger.info("MongoDB connection established");
});

mongoose.connection.on("error", (err) => {
  logger.error({ err }, "MongoDB connection error");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

export function getMongoState(): MongoState {
  switch (mongoose.connection.readyState) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "uninitialized";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectMongo(uri: string): Promise<void> {
  for (let attempt = 1; attempt <= MONGO_RETRY_ATTEMPTS; attempt += 1) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: MONGO_SERVER_SELECTION_TIMEOUT_MS,
      });
      return;
    } catch (err) {
      if (attempt === MONGO_RETRY_ATTEMPTS) {
        throw err;
      }
      logger.warn(
        { err, attempt, maxAttempts: MONGO_RETRY_ATTEMPTS },
        "MongoDB connection attempt failed; retrying",
      );
      await sleep(MONGO_RETRY_DELAY_MS);
    }
  }
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
