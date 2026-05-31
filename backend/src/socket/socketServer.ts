import { createServer } from "node:http";
import { Server } from "socket.io";
import { Express } from "express";
import { config } from "../config/env.js";
import { RoomService } from "../rooms/roomService.js";
import { RoomStore } from "../rooms/roomStore.js";
import { SandTimerService } from "../timers/sandTimerService.js";
import { TimerRegistry } from "../timers/timerRegistry.js";
import { registerSocketHandlers } from "./handlers.js";

export function createSocketServer(app: Express) {
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: config.corsOrigin },
  });
  const roomStore = new RoomStore();
  const roomService = new RoomService(roomStore);
  const timerService = new SandTimerService(roomStore, new TimerRegistry(), io);

  io.on("connection", (socket) => {
    registerSocketHandlers(io, socket, roomService, timerService);
  });

  return { httpServer, io, roomStore, roomService, timerService };
}
