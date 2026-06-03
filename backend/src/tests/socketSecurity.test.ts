import { describe, expect, it } from "vitest";
import { ActionType, Direction } from "../game/gameTypes.js";
import { syncRequestSchema } from "../validators/actionRequestValidator.js";
import { createRoomService, givePlayerAction } from "./testHelpers.js";

describe("socket identity validation", () => {
  it("rejects a socket trying to act as another player", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host", socketId: "socket-host" });
    service.joinRoom({ roomCode: room.roomCode, nickname: "Guest", socketId: "socket-guest" });
    service.startGame({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, socketId: "socket-host" });
    givePlayerAction(room, 0, ActionType.MoveNorth);

    expect(() =>
      service.moveHero({
        roomCode: room.roomCode,
        playerId: room.session.players[0].playerId,
        socketId: "socket-guest",
        heroId: "hero-mage",
        direction: Direction.North,
      }),
    ).toThrow("Socket is not allowed");
  });

  it("marks a player disconnected by socket id", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host", socketId: "socket-host" });

    const changedRooms = service.disconnectSocket("socket-host");

    expect(changedRooms).toHaveLength(1);
    expect(room.session.players[0].isConnected).toBe(false);
  });

  it("returns current state for a valid sync request", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host", socketId: "socket-host" });

    const synced = service.syncState(room.roomCode, room.session.players[0].playerId, "socket-host");

    expect(synced.session).toBe(room.session);
  });

  it("allows a disconnected player to reconnect with a new socket id", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host", socketId: "old-socket" });
    const playerId = room.session.players[0].playerId;
    service.disconnectSocket("old-socket");

    const synced = service.syncState(room.roomCode, playerId, "new-socket");

    expect(synced.session.players[0].socketId).toBe("new-socket");
    expect(synced.session.players[0].isConnected).toBe(true);
  });

  it("rejects reconnect hijacking while the player is connected elsewhere", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host", socketId: "owner-socket" });

    expect(() => service.syncState(room.roomCode, room.session.players[0].playerId, "attacker-socket")).toThrow("Socket is not allowed");
  });

  it("rejects sync requests without a player id", () => {
    expect(() => syncRequestSchema.parse({ roomCode: "ABC123" })).toThrow();
  });
});


