import { describe, expect, it } from "vitest";
import { GameStatus } from "../game/gameTypes.js";
import { createRoomService } from "./testHelpers.js";

describe("room security", () => {
  it("makes the first player host and rejects non-host start", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host" });
    service.joinRoom({ roomCode: room.roomCode, nickname: "Guest" });

    expect(room.roomCode).toMatch(/^[A-Z0-9]{6}$/);
    expect(room.session.players[0].isHost).toBe(true);
    expect(room.session.players[0].isConnected).toBe(true);
    expect(() => service.startGame(room.roomCode, room.session.players[1].playerId)).toThrow("Only the host");
  });

  it("rejects empty nicknames and joins after game start", () => {
    const service = createRoomService();
    expect(() => service.createRoom({ nickname: " " })).toThrow("nickname");

    const room = service.createRoom({ nickname: "Host" });
    room.session.status = GameStatus.InProgress;
    expect(() => service.joinRoom({ roomCode: room.roomCode, nickname: "Late" })).toThrow("Cannot join after the game has started.");
  });

  it("rejects joining a non-existing room", () => {
    const service = createRoomService();
    expect(() => service.joinRoom({ roomCode: "ABC123", nickname: "Guest" })).toThrow("does not exist");
  });
});


