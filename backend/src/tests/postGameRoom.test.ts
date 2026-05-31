import { describe, expect, it } from "vitest";
import { ActionType, Direction } from "../game/gameTypes.js";
import { applyDefeat } from "../rules/victoryDefeatRules.js";
import { createStartedRoom, createRoomService, givePlayerAction, markAllButMageEscaped } from "./testHelpers.js";

function makeVictory() {
  const { service, room } = createStartedRoom();
  givePlayerAction(room, 0, ActionType.MoveSouth);
  markAllButMageEscaped(room);
  service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.South });
  return { service, room };
}

describe("post-game room reuse", () => {
  it("post-game communication is open after victory and defeat", () => {
    const victory = makeVictory().room;
    expect(victory.session.communicationState.mode).toBe("Open");
    expect(victory.session.communicationState.reason).toBe("PostGame");

    const defeated = createStartedRoom().room;
    applyDefeat(defeated.session, "Test defeat");
    expect(defeated.session.communicationState.reason).toBe("PostGame");
  });

  it("host can play again after victory while preserving room and players", () => {
    const { service, room } = makeVictory();
    const roomCode = room.roomCode;
    const playerIds = room.session.players.map((player) => player.playerId);
    const reset = service.playAgain({ roomCode, playerId: room.session.players[0].playerId, keepScenario: true, keepDifficulty: true });
    expect(reset.roomCode).toBe(roomCode);
    expect(reset.session.status).toBe("Waiting");
    expect(reset.session.result).toBeUndefined();
    expect(reset.session.players.map((player) => player.playerId)).toEqual(playerIds);
    expect(reset.session.communicationState.reason).toBe("Lobby");
  });

  it("host can play again after defeat and non-host cannot reset", () => {
    const { service, room } = createStartedRoom(2);
    applyDefeat(room.session, "Test defeat");
    expect(() => service.playAgain({ roomCode: room.roomCode, playerId: room.session.players[1].playerId, keepScenario: true, keepDifficulty: true })).toThrow("Only the host");
    const reset = service.playAgain({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, keepScenario: false, keepDifficulty: false });
    expect(reset.session.status).toBe("Waiting");
  });

  it("host can change scenario and difficulty after game end", () => {
    const { service, room } = makeVictory();
    service.selectScenario({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, scenarioId: "scenario2_several_exits" });
    service.selectDifficulty({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, difficulty: "Hard" });
    expect(room.session.scenario.scenarioId).toBe("scenario2_several_exits");
    expect(room.session.difficultySettings.difficulty).toBe("Hard");
  });

  it("player can toggle ready in lobby but not during active game", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host" });
    service.setPlayerReady({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, isReady: true });
    expect(room.session.players[0].isReady).toBe(true);
    service.startGame(room.roomCode, room.session.players[0].playerId);
    expect(() => service.setPlayerReady({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, isReady: false })).toThrow("lobby");
  });
});

