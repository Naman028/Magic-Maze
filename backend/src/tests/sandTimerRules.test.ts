import { describe, expect, it } from "vitest";
import { ActionType, CommunicationMode, Direction, GameStatus } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, placeHero, setTheftReadyExceptMage } from "./testHelpers.js";

describe("sand timer rules", () => {
  it("starts discussion and locks actions when activated", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    placeHero(room, "hero-mage", "tile1A-1-0");

    service.activateSandTimer({
      roomCode: room.roomCode,
      playerId: room.session.players[0].playerId,
      heroId: "hero-mage",
      cellId: "tile1A-1-0",
    });

    expect(room.session.status).toBe(GameStatus.InProgress);
    expect(room.session.actionsLocked).toBe(false);
    expect(room.session.communicationState.actionsLocked).toBe(false);
    expect(room.session.communicationState.mode).toBe(CommunicationMode.DiscussionOpen);
    expect(room.session.communicationState.reason).toBe("SandTimer");
    expect(room.session.communicationState.autoCloseOnNextGameAction).toBe(true);
    expect(room.session.sandTimer.remainingSeconds).toBe(180);
    expect(room.session.sandTimer.usedSandTimerCellIds).toContain("tile1A-1-0");
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


