import { GameStatus } from "../game/gameTypes.js";
import { SandTimerService } from "../timers/sandTimerService.js";
import { logger } from "../utils/logger.js";
import { RoomStore } from "./roomStore.js";

export class RoomCleanupService {
  private cleanupTimer?: NodeJS.Timeout;

  constructor(
    private readonly store: RoomStore,
    private readonly timerService: SandTimerService,
    private readonly ttlMs: number,
    private readonly intervalMs: number,
  ) {}

  start(): void {
    this.stop();
    this.cleanupTimer = setInterval(() => this.cleanup(), this.intervalMs);
    this.cleanupTimer.unref();
  }

  stop(): void {
    if (!this.cleanupTimer) return;
    clearInterval(this.cleanupTimer);
    this.cleanupTimer = undefined;
  }

  cleanup(now = Date.now()): number {
    let deletedCount = 0;
    for (const room of this.store.all()) {
      const inactiveForMs = now - room.session.updatedAt;
      if (inactiveForMs < this.ttlMs) continue;

      const hasConnectedPlayers = room.session.players.some((player) => player.isConnected);
      const isGameRunning = [GameStatus.InProgress, GameStatus.Discussion, GameStatus.Escape].includes(room.session.status);
      if (hasConnectedPlayers && isGameRunning) continue;

      this.timerService.stop(room.roomCode);
      if (this.store.delete(room.roomCode)) {
        deletedCount += 1;
        logger.info(`Cleaned up inactive room ${room.roomCode}.`);
      }
    }
    return deletedCount;
  }
}
