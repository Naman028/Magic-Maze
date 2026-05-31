import { describe, expect, it } from "vitest";
import { RoomCleanupService } from "../rooms/roomCleanupService.js";
import { RoomService } from "../rooms/roomService.js";
import { RoomStore } from "../rooms/roomStore.js";
import { SandTimerService } from "../timers/sandTimerService.js";
import { TimerRegistry } from "../timers/timerRegistry.js";

function createCleanupHarness(ttlMs = 1_000) {
  const store = new RoomStore();
  const roomService = new RoomService(store);
  const timerService = new SandTimerService(store, new TimerRegistry());
  const cleanupService = new RoomCleanupService(store, timerService, ttlMs, 60_000);
  return { store, roomService, cleanupService };
}

describe("room cleanup service", () => {
  it("deletes stale rooms with no connected players", () => {
    const { store, roomService, cleanupService } = createCleanupHarness();
    const room = roomService.createRoom({ nickname: "Host" });
    room.session.players[0].isConnected = false;
    room.session.updatedAt = Date.now() - 2_000;

    expect(cleanupService.cleanup()).toBe(1);
    expect(store.get(room.roomCode)).toBeUndefined();
  });

  it("keeps stale rooms that still have a connected active game", () => {
    const { store, roomService, cleanupService } = createCleanupHarness();
    const room = roomService.createRoom({ nickname: "Host" });
    roomService.startGame(room.roomCode, room.session.players[0].playerId);
    room.session.updatedAt = Date.now() - 2_000;

    expect(cleanupService.cleanup()).toBe(0);
    expect(store.get(room.roomCode)).toBe(room);
  });
});
