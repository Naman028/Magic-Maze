import "dotenv/config";
import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { RoomCleanupService } from "./rooms/roomCleanupService.js";
import { createSocketServer } from "./socket/socketServer.js";
import { logger } from "./utils/logger.js";

const app = createApp();
const { httpServer, io, roomStore, timerService } = createSocketServer(app);
const cleanupService = new RoomCleanupService(roomStore, timerService, config.roomTtlMs, config.roomCleanupIntervalMs);

cleanupService.start();

httpServer.listen(config.port, () => {
  logger.info(`Magic Maze backend listening on port ${config.port}`);
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info(`Received ${signal}. Shutting down Magic Maze backend.`);
  cleanupService.stop();
  timerService.stopAll();
  io.close();
  httpServer.close((error) => {
    if (error) {
      logger.error("Error while closing HTTP server.", error);
      process.exit(1);
    }
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
