import { describe, expect, it } from "vitest";
import { ActionType, Direction, GameStatus } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, markAllButMageEscaped, placeHero } from "./testHelpers.js";

describe("movement rules", () => {
  it("rejects movement through a wall", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    givePlayerAction(room, 0, ActionType.MoveNorth);
    room.session.board.cells["tile1A-start-mage"].walls.push(Direction.North);

    expect(() =>
      service.moveHero({
        roomCode: room.roomCode,
        playerId: room.session.players[0].playerId,
        heroId: "hero-mage",
        direction: Direction.North,
      }),
    ).toThrow("wall");
  });

  it("rejects movement into occupied cells", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    givePlayerAction(room, 0, ActionType.MoveEast);

    expect(() =>
      service.moveHero({
        roomCode: room.roomCode,
        playerId: room.session.players[0].playerId,
        heroId: "hero-mage",
        direction: Direction.East,
      }),
    ).toThrow("occupied");
  });

  it("marks victory when the last hero escapes", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    givePlayerAction(room, 0, ActionType.MoveSouth);
    markAllButMageEscaped(room);

    const result = service.moveHero({
      roomCode: room.roomCode,
      playerId: room.session.players[0].playerId,
      heroId: "hero-mage",
      direction: Direction.South,
    });

    expect(result.victoryTriggered).toBe(true);
    expect(room.session.status).toBe(GameStatus.Victory);
    expect(room.session.result?.status).toBe(GameStatus.Victory);
  });

  it("allows the next movement after timer discussion and closes communication", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    givePlayerAction(room, 0, ActionType.MoveNorth);
    placeHero(room, "hero-mage", "tile1A-1-0");
    service.activateSandTimer({
      roomCode: room.roomCode,
      playerId: room.session.players[0].playerId,
      heroId: "hero-mage",
      cellId: "tile1A-1-0",
    });

    givePlayerAction(room, 0, ActionType.MoveEast);
    service.moveHero({
      roomCode: room.roomCode,
      playerId: room.session.players[0].playerId,
      heroId: "hero-mage",
      direction: Direction.East,
    });
    expect(room.session.communicationState.mode).toBe("SilentOnly");
  });
});


