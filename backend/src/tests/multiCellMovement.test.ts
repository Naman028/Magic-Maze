import { describe, expect, it } from "vitest";
import { ActionType, Direction } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, placeHero } from "./testHelpers.js";

describe("multi-cell movement", () => {
  it("moves two cells in one direction", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);

    service.moveHeroTo({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North, targetCellId: "tile1A-1-0" });

    expect(room.session.heroes[0].positionCellId).toBe("tile1A-1-0");
  });

  it("rejects diagonal or off-axis targets", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);

    expect(() => service.moveHeroTo({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North, targetCellId: "tile1A-start-dwarf" })).toThrow("not a legal move");
  });

  it("rejects moving through a wall", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);
    room.session.board.cells["tile1A-start-mage"].walls.push(Direction.North);

    expect(() => service.moveHeroTo({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North, targetCellId: "tile1A-1-0" })).toThrow("not a legal move");
  });

  it("rejects moving through an occupied hero", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);
    placeHero(room, "hero-elf", "tile1A-1-0");

    expect(() => service.moveHeroTo({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North, targetCellId: "tile1A-1-0" })).toThrow("not a legal move");
  });
});


