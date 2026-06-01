import { describe, expect, it } from "vitest";
import { ActionType, Direction, GameStatus } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, markCellAsSandTimer, placeHero, placeHeroOnSandTimer, setTheftReadyExceptMage } from "./testHelpers.js";

describe("sand timer difficulty", () => {
  it.each([
    ["Easy", 240],
    ["Normal", 180],
    ["Hard", 120],
  ] as const)("flips %s timer to elapsed sand", (difficulty, expected) => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    room.session.difficultySettings.difficulty = difficulty;
    room.session.difficultySettings.timeLimitSeconds = expected;
    room.session.sandTimer.remainingSeconds = 3;
    const timerCellId = placeHeroOnSandTimer(room);
    service.activateSandTimer({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", cellId: timerCellId });
    expect(room.session.sandTimer.remainingSeconds).toBe(expected - 3);
  });

  it("auto-flips when movement lands on an unused timer", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    givePlayerAction(room, 0, ActionType.MoveNorth);
    const timerCellId = markCellAsSandTimer(room);
    placeHero(room, "hero-mage", "tile1A-start-mage");
    room.session.sandTimer.remainingSeconds = 5;
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North });
    expect(room.session.sandTimer.usedSandTimerCellIds).toContain(timerCellId);
    expect(room.session.sandTimer.remainingSeconds).toBe(175);
    expect(room.session.communicationState.reason).toBe("SandTimer");
  });

  it("does not auto-flip used timer or timer during Escape", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    givePlayerAction(room, 0, ActionType.MoveNorth);
    const timerCellId = markCellAsSandTimer(room);
    placeHero(room, "hero-mage", "tile1A-start-mage");
    room.session.sandTimer.usedSandTimerCellIds.push(timerCellId);
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North });
    expect(room.session.communicationState.reason).not.toBe("SandTimer");

    const other = createStartedRoom();
    givePlayerAction(other.room, 0, ActionType.MoveNorth);
    placeHero(other.room, "hero-mage", "tile1A-start-mage");
    other.room.session.status = GameStatus.Escape;
    other.service.moveHero({ roomCode: other.room.roomCode, playerId: other.room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North });
    expect(other.room.session.sandTimer.usedSandTimerCellIds).not.toContain(timerCellId);
  });

  it("cannot flip after theft final countdown", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    setTheftReadyExceptMage(room);
    givePlayerAction(room, 0, ActionType.MoveNorth);
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North });
    const timerCellId = placeHeroOnSandTimer(room);
    expect(() => service.activateSandTimer({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", cellId: timerCellId })).toThrow();
  });
});



