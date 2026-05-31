import { describe, expect, it } from "vitest";
import { ActionType, Direction, GameStatus } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, placeHero, setTheftReadyExceptMage } from "./testHelpers.js";

describe("sand timer difficulty", () => {
  it.each([
    ["Easy", 240],
    ["Normal", 180],
    ["Hard", 120],
  ] as const)("resets to %s difficulty time", (difficulty, expected) => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    room.session.difficultySettings.difficulty = difficulty;
    room.session.difficultySettings.timeLimitSeconds = expected;
    room.session.sandTimer.remainingSeconds = 3;
    placeHero(room, "hero-mage", "tile1A-1-0");
    service.activateSandTimer({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", cellId: "tile1A-1-0" });
    expect(room.session.sandTimer.remainingSeconds).toBe(expected);
  });

  it("auto-flips when movement lands on an unused timer", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    givePlayerAction(room, 0, ActionType.MoveNorth);
    placeHero(room, "hero-mage", "tile1A-start-mage");
    room.session.sandTimer.remainingSeconds = 5;
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North });
    expect(room.session.sandTimer.usedSandTimerCellIds).toContain("tile1A-1-0");
    expect(room.session.communicationState.reason).toBe("SandTimer");
  });

  it("does not auto-flip used timer or timer during Escape", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    givePlayerAction(room, 0, ActionType.MoveNorth);
    placeHero(room, "hero-mage", "tile1A-start-mage");
    room.session.sandTimer.usedSandTimerCellIds.push("tile1A-1-0");
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North });
    expect(room.session.communicationState.reason).not.toBe("SandTimer");

    const other = createStartedRoom();
    givePlayerAction(other.room, 0, ActionType.MoveNorth);
    placeHero(other.room, "hero-mage", "tile1A-start-mage");
    other.room.session.status = GameStatus.Escape;
    other.service.moveHero({ roomCode: other.room.roomCode, playerId: other.room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North });
    expect(other.room.session.sandTimer.usedSandTimerCellIds).not.toContain("tile1A-1-0");
  });

  it("cannot flip after theft final countdown", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    setTheftReadyExceptMage(room);
    givePlayerAction(room, 0, ActionType.MoveNorth);
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North });
    placeHero(room, "hero-mage", "tile1A-1-0");
    expect(() => service.activateSandTimer({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", cellId: "tile1A-1-0" })).toThrow();
  });
});



