import { describe, expect, it } from "vitest";
import { ActionType, Direction } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, placeHero } from "./testHelpers.js";

describe("legal move preview", () => {
  it("solo control returns legal targets only for the visible card actions", () => {
    const { service, room } = createStartedRoom(1);
    room.session.players[0].assignedActionCard = { actionCardId: "explore", imageKey: "x.png", actions: [ActionType.ExploreTile], label: "Explore", icons: [] };

    const result = service.getLegalMoves({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage" });

    expect(result.currentCellId).toBe("tile1A-start-mage");
    expect(result.targets).toEqual([]);

    service.cycleSoloAction({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, targetAction: ActionType.MoveNorth });
    const northResult = service.getLegalMoves({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage" });

    expect(northResult.targets.map((target) => target.cellId)).toEqual(["tile1A-1-0"]);
    expect(result.targets.some((target) => target.cellId === "tile1A-start-mage")).toBe(false);
  });

  it("only returns targets for the player's movement directions", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);

    const northOnly = service.getLegalMoves({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage" });
    expect(northOnly.targets.every((target) => target.direction === Direction.North)).toBe(true);
    expect(northOnly.targets.map((target) => target.cellId)).toEqual(["tile1A-1-0"]);

    givePlayerAction(room, 0, ActionType.MoveEast);
    placeHero(room, "hero-mage", "tile1A-1-0");
    const eastOnly = service.getLegalMoves({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage" });
    expect(eastOnly.targets.every((target) => target.direction === Direction.East)).toBe(true);
    expect(eastOnly.targets.map((target) => target.cellId)).toEqual(["tile1A-2-0", "tile1A-3-0"]);
  });

  it("does not include occupied cells or cells behind occupied heroes", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveEast);
    placeHero(room, "hero-mage", "tile1A-1-0");
    placeHero(room, "hero-elf", "tile1A-2-0");

    const result = service.getLegalMoves({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage" });

    expect(result.targets.map((target) => target.cellId)).not.toContain("tile1A-2-0");
    expect(result.targets.map((target) => target.cellId)).not.toContain("tile1A-3-0");
  });

  it("does not include wall-blocked cells", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);
    room.session.board.cells["tile1A-start-mage"].walls.push(Direction.North);

    const result = service.getLegalMoves({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage" });

    expect(result.targets).toHaveLength(0);
  });

  it("uses starter tile wall metadata from the tile image", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveSouth);
    placeHero(room, "hero-mage", "tile1A-0-1");

    const result = service.getLegalMoves({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage" });

    expect(result.targets.map((target) => target.cellId)).not.toContain("tile1A-0-2");
    expect(() =>
      service.moveHeroTo({
        roomCode: room.roomCode,
        playerId: room.session.players[0].playerId,
        heroId: "hero-mage",
        direction: Direction.South,
        targetCellId: "tile1A-0-2",
      }),
    ).toThrow();
  });

  it("does not allow moving down into the starter tile compass artwork cell", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveSouth);
    placeHero(room, "hero-elf", "tile1A-3-2");

    const result = service.getLegalMoves({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-elf" });

    expect(result.targets.map((target) => target.cellId)).not.toContain("tile1A-3-3");
    expect(() =>
      service.moveHeroTo({
        roomCode: room.roomCode,
        playerId: room.session.players[0].playerId,
        heroId: "hero-elf",
        direction: Direction.South,
        targetCellId: "tile1A-3-3",
      }),
    ).toThrow();
  });

  it("does not include guard-occupied cells", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);
    room.session.challengeState.guards = [{ guardId: "guard-1", currentCellId: "tile1A-1-0", patrolCellIds: ["tile1A-1-0"], patrolIndex: 0, isActive: true }];

    const result = service.getLegalMoves({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage" });

    expect(result.targets).toHaveLength(0);
  });

  it("moveHeroTo accepts a returned target and rejects a target not returned by legalMoves", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);
    const result = service.getLegalMoves({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage" });

    expect(result.targets[0]).toMatchObject({ cellId: "tile1A-1-0", direction: Direction.North });
    service.moveHeroTo({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: result.targets[0].direction, targetCellId: result.targets[0].cellId });

    expect(() => service.moveHeroTo({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North, targetCellId: "tile1A-start-dwarf" })).toThrow();
  });

  it("respects the Dwarf orange-wall exception", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);
    placeHero(room, "hero-dwarf", "tile1A-start-mage");
    room.session.board.cells["tile1A-start-mage"].orangeWallDirections = [Direction.North];

    let result = service.getLegalMoves({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-dwarf" });
    expect(result.targets.map((target) => target.cellId)).not.toContain("tile1A-1-0");

    room.session.scenario.ruleFlags.dwarfCanPassOrangeWalls = true;
    result = service.getLegalMoves({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-dwarf" });
    expect(result.targets.map((target) => target.cellId)).toContain("tile1A-1-0");
  });

  it("returns no targets when the player has no movement action", () => {
    const { service, room } = createStartedRoom();
    room.session.players[0].assignedActionCard = { actionCardId: "explore", imageKey: "x.png", actions: [ActionType.ExploreTile], label: "Explore", icons: [] };

    const result = service.getLegalMoves({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage" });

    expect(result.targets).toEqual([]);
  });
});
