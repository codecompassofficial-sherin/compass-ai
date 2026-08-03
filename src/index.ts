import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { SHUTDOWN_TIMEOUT_MS } from "./config/constants.js";
import { connectMongo, disconnectMongo } from "./shared/database/mongo.js";
import { logger } from "./shared/logger/logger.js";

async function bootstrap(): Promise<void> {
  await connectMongo(env.mongodbUri);

  const server = createServer(createApp());

  server.listen(env.port, env.host, () => {
    logger.info({ host: env.host, port: env.port }, "Server started");
  });

  let shuttingDown = false;

  const shutdown = (signal: string): void => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    logger.info({ signal }, "Shutdown signal received; closing gracefully");

    const forceExitTimer = setTimeout(() => {
      logger.warn("Graceful shutdown timed out; forcing exit");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExitTimer.unref();

    server.close((err) => {
      if (err) {
        logger.error({ err }, "Error while closing HTTP server");
        process.exit(1);
      }
      disconnectMongo()
        .then(() => {
          logger.info("Graceful shutdown complete");
          process.exit(0);
        })
        .catch((disconnectErr: unknown) => {
          logger.error({ err: disconnectErr }, "Error while disconnecting MongoDB");
          process.exit(1);
        });
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  logger.fatal({ err }, "Failed to bootstrap application");
  process.exit(1);
});
