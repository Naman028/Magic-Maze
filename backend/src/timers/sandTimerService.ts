import { Server } from "socket.io";
import { GameStatus } from "../game/gameTypes.js";
import { RoomStore } from "../rooms/roomStore.js";
import { applyDefeat } from "../rules/victoryDefeatRules.js";
import { ServerEvent } from "../socket/serverEvents.js";
import { TimerRegistry } from "./timerRegistry.js";

export class SandTimerService {
  constructor(
    private readonly store: RoomStore,
    private readonly registry: TimerRegistry,
    private readonly io?: Server,
  ) {}

  start(roomCode: string): void {
    const room = this.store.get(roomCode);
    if (!room) {
      throw new Error("Room does not exist.");
    }
    room.session.sandTimer.isRunning = true;
    this.registry.set(
      roomCode,
      setInterval(() => {
        const activeRoom = this.store.get(roomCode);
        if (!activeRoom) {
          this.registry.clear(roomCode);
          return;
        }
        const timer = activeRoom.session.sandTimer;
        if (!timer.isRunning || [GameStatus.Victory, GameStatus.Defeat].includes(activeRoom.session.status)) {
          this.registry.clear(roomCode);
          return;
        }
        timer.remainingSeconds = Math.max(0, timer.remainingSeconds - 1);
        this.io?.to(roomCode).emit(ServerEvent.TimerUpdated, { roomCode, sandTimer: timer });
        if (timer.remainingSeconds === 0) {
          applyDefeat(activeRoom.session, "The sand timer reached zero.");
          this.io?.to(roomCode).emit(ServerEvent.GameDefeat, activeRoom.session.result);
          this.io?.to(roomCode).emit(ServerEvent.StateUpdated, activeRoom.session);
          this.registry.clear(roomCode);
        }
      }, 1000),
    );
  }

  stop(roomCode: string): void {
    this.registry.clear(roomCode);
    const room = this.store.get(roomCode);
    if (room) {
      room.session.sandTimer.isRunning = false;
    }
  }

  stopAll(): void {
    this.registry.clearAll();
    for (const room of this.store.all()) {
      room.session.sandTimer.isRunning = false;
    }
  }
}
