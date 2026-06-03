import { describe, expect, it } from "vitest";
import { findPlayerIdBySocket, roomPayloadForPlayer } from "../socket/payloads.js";
import { createRoomService } from "./testHelpers.js";

describe("socket payloads", () => {
  it("builds room:create payload with explicit player id", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host", socketId: "socket-host" });
    const playerId = findPlayerIdBySocket(room, "socket-host");

    const payload = roomPayloadForPlayer(room, playerId);

    expect(payload).toEqual({ roomCode: room.roomCode, playerId, session: room.session });
  });

  it("builds room:join payload for the joining socket", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host", socketId: "socket-host" });
    service.joinRoom({ roomCode: room.roomCode, nickname: "Guest", socketId: "socket-guest" });
    const playerId = findPlayerIdBySocket(room, "socket-guest");

    const payload = roomPayloadForPlayer(room, playerId);

    expect(payload.playerId).toBe(room.session.players[1].playerId);
    expect(payload.session).toBe(room.session);
  });
});


