import { describe, expect, it } from "vitest";
import { createRoomService } from "./testHelpers.js";

describe("difficulty rules", () => {
  it("host can select Easy, Normal, and Hard before game", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host" });
    service.selectDifficulty({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, difficulty: "Easy" });
    expect(room.session.difficultySettings.timeLimitSeconds).toBe(240);
    service.selectDifficulty({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, difficulty: "Normal" });
    expect(room.session.difficultySettings.timeLimitSeconds).toBe(180);
    service.selectDifficulty({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, difficulty: "Hard" });
    expect(room.session.difficultySettings.timeLimitSeconds).toBe(120);
    expect(room.session.difficultySettings.extraGuardCount).toBe(1);
  });

  it("non-host cannot select difficulty", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host" });
    service.joinRoom({ roomCode: room.roomCode, nickname: "Guest" });
    expect(() => service.selectDifficulty({ roomCode: room.roomCode, playerId: room.session.players[1].playerId, difficulty: "Hard" })).toThrow("Only the host");
  });

  it("difficulty cannot change after start", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host" });
    service.startGame(room.roomCode, room.session.players[0].playerId);
    expect(() => service.selectDifficulty({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, difficulty: "Easy" })).toThrow("lobby or after game end");
  });
});


