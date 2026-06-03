import { describe, expect, it } from "vitest";
import { ActionType, CommunicationMode, Direction, GameStatus } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, placeHeroOnSandTimer, setTheftReadyExceptMage } from "./testHelpers.js";

describe("sand timer rules", () => {
  it("starts discussion and locks actions when activated", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    const timerCellId = placeHeroOnSandTimer(room);

    service.activateSandTimer({
      roomCode: room.roomCode,
      playerId: room.session.players[0].playerId,
      heroId: "hero-mage",
      cellId: timerCellId,
    });

    expect(room.session.status).toBe(GameStatus.InProgress);
    expect(room.session.actionsLocked).toBe(false);
    expect(room.session.communicationState.actionsLocked).toBe(false);
    expect(room.session.communicationState.mode).toBe(CommunicationMode.DiscussionOpen);
    expect(room.session.communicationState.reason).toBe("SandTimer");
    expect(room.session.communicationState.autoCloseOnNextGameAction).toBe(true);
    expect(room.session.sandTimer.remainingSeconds).toBe(1);
    expect(room.session.sandTimer.usedSandTimerCellIds).toContain(timerCellId);
  });

  it("flips to elapsed sand instead of resetting to full time", () => {
    const { service, room } = createStartedRoom();
    room.session.sandTimer.remainingSeconds = 125;
    const timerCellId = placeHeroOnSandTimer(room);

    service.activateSandTimer({
      roomCode: room.roomCode,
      playerId: room.session.players[0].playerId,
      heroId: "hero-mage",
      cellId: timerCellId,
    });

    expect(room.session.sandTimer.remainingSeconds).toBe(55);
  });

  it("adds time when the sand timer is almost empty", () => {
    const { service, room } = createStartedRoom();
    room.session.sandTimer.remainingSeconds = 2;
    const timerCellId = placeHeroOnSandTimer(room);

    service.activateSandTimer({
      roomCode: room.roomCode,
      playerId: room.session.players[0].playerId,
      heroId: "hero-mage",
      cellId: timerCellId,
    });

    expect(room.session.sandTimer.remainingSeconds).toBe(178);
  });

  it("cannot be flipped after theft", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    givePlayerAction(room, 0, ActionType.MoveNorth);
    setTheftReadyExceptMage(room);
    service.moveHero({
      roomCode: room.roomCode,
      playerId: room.session.players[0].playerId,
      heroId: "hero-mage",
      direction: Direction.North,
    });

    expect(() =>
      service.activateSandTimer({
        roomCode: room.roomCode,
        playerId: room.session.players[0].playerId,
        heroId: "hero-mage",
        cellId: "tile1A-1-0",
      }),
    ).toThrow();
  });
});


