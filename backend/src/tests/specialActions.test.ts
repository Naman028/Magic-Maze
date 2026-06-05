import { describe, expect, it } from "vitest";
import { ActionType, CellType, GameStatus, HeroType } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, placeHero } from "./testHelpers.js";

describe("special actions", () => {
  it("rejects vortex when player lacks UseVortex", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);
    room.session.board.cells["vortex-mage"] = { cellId: "vortex-mage", tileId: "test", x: 9, y: 9, type: CellType.Vortex, walls: [], neighborCellIds: {}, vortexForHeroType: HeroType.Mage };

    expect(() => service.useVortex({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", targetCellId: "vortex-mage" })).toThrow("vortex action");
  });

  it("rejects vortex during Escape", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.UseVortex);
    room.session.status = GameStatus.Escape;
    room.session.board.cells["vortex-mage"] = { cellId: "vortex-mage", tileId: "test", x: 9, y: 9, type: CellType.Vortex, walls: [], neighborCellIds: {}, vortexForHeroType: HeroType.Mage };

    expect(() => service.useVortex({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", targetCellId: "vortex-mage" })).toThrow("in progress");
  });

  it("rejects wrong-colour and occupied vortex targets", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.UseVortex);
    room.session.board.cells["vortex-elf"] = { cellId: "vortex-elf", tileId: "test", x: 9, y: 9, type: CellType.Vortex, walls: [], neighborCellIds: {}, vortexForHeroType: HeroType.Elf };
    room.session.board.cells["vortex-mage"] = { cellId: "vortex-mage", tileId: "test", x: 10, y: 9, type: CellType.Vortex, walls: [], neighborCellIds: {}, vortexForHeroType: HeroType.Mage, occupiedByHeroId: "hero-elf" };

    expect(() => service.useVortex({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", targetCellId: "vortex-elf" })).toThrow("colour");
    expect(() => service.useVortex({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", targetCellId: "vortex-mage" })).toThrow("occupied");
  });

  it("moves a hero to a valid same-colour vortex", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.UseVortex);
    room.session.board.cells["vortex-mage"] = { cellId: "vortex-mage", tileId: "test", x: 9, y: 9, type: CellType.Vortex, walls: [], neighborCellIds: {}, vortexForHeroType: HeroType.Mage };

    service.useVortex({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", targetCellId: "vortex-mage" });

    expect(room.session.heroes[0].positionCellId).toBe("vortex-mage");
    expect(room.session.board.cells["vortex-mage"].occupiedByHeroId).toBe("hero-mage");
  });

  it("validates and takes escalators", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);
    room.session.board.cells["escalator-a"] = { cellId: "escalator-a", tileId: "test", x: 20, y: 20, type: CellType.Escalator, walls: [], neighborCellIds: {}, escalatorGroupId: "pair" };
    room.session.board.cells["escalator-b"] = { cellId: "escalator-b", tileId: "test", x: 21, y: 20, type: CellType.Escalator, walls: [], neighborCellIds: {}, escalatorGroupId: "pair" };
    placeHero(room, "hero-mage", "escalator-a");

    expect(() => service.takeEscalator({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage" })).toThrow("escalator action");

    givePlayerAction(room, 0, ActionType.TakeEscalator);
    service.takeEscalator({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", targetCellId: "escalator-b" });

    expect(room.session.heroes[0].positionCellId).toBe("escalator-b");
  });

  it("rejects an explicit escalator target outside the current pair", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.TakeEscalator);
    room.session.board.cells["escalator-a"] = { cellId: "escalator-a", tileId: "test", x: 20, y: 20, type: CellType.Escalator, walls: [], neighborCellIds: {}, escalatorGroupId: "pair" };
    room.session.board.cells["not-paired"] = { cellId: "not-paired", tileId: "test", x: 22, y: 20, type: CellType.Escalator, walls: [], neighborCellIds: {}, escalatorGroupId: "other-pair" };
    placeHero(room, "hero-mage", "escalator-a");

    expect(() => service.takeEscalator({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", targetCellId: "not-paired" })).toThrow("paired escalator");
    expect(room.session.heroes[0].positionCellId).toBe("escalator-a");
  });

  it("ignores stale encoded escalator cells when visual endpoints are known", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.TakeEscalator);
    room.session.board.cells["tile7:tile7-2-1"] = { cellId: "tile7:tile7-2-1", tileId: "tile7", x: 20, y: 20, type: CellType.Escalator, walls: [], neighborCellIds: {}, escalatorGroupId: "old-group-a" };
    room.session.board.cells["tile7:tile7-1-3"] = { cellId: "tile7:tile7-1-3", tileId: "tile7", x: 19, y: 22, type: CellType.Escalator, walls: [], neighborCellIds: {}, escalatorGroupId: "old-group-b" };
    room.session.board.cells["tile7:tile7-1-2"] = { cellId: "tile7:tile7-1-2", tileId: "tile7", x: 19, y: 21, type: CellType.Escalator, walls: [], neighborCellIds: {}, escalatorGroupId: "old-group-b" };
    placeHero(room, "hero-mage", "tile7:tile7-2-1");

    expect(() => service.takeEscalator({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", targetCellId: "tile7:tile7-1-2" })).toThrow("paired escalator");
    service.takeEscalator({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", targetCellId: "tile7:tile7-1-3" });
    expect(room.session.heroes[0].positionCellId).toBe("tile7:tile7-1-3");
  });

  it("uses the visual tile2 escalator endpoint instead of the stale middle cell", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.TakeEscalator);
    room.session.board.cells["tile2:tile2-0-1"] = { cellId: "tile2:tile2-0-1", tileId: "tile2", x: 20, y: 20, type: CellType.Normal, walls: [], neighborCellIds: {}, escalatorGroupId: "old-group-a" };
    room.session.board.cells["tile2:tile2-1-2"] = { cellId: "tile2:tile2-1-2", tileId: "tile2", x: 21, y: 21, type: CellType.Escalator, walls: [], neighborCellIds: {}, escalatorGroupId: "old-group-a" };
    room.session.board.cells["tile2:tile2-1-3"] = { cellId: "tile2:tile2-1-3", tileId: "tile2", x: 21, y: 22, type: CellType.Normal, walls: [], neighborCellIds: {} };
    placeHero(room, "hero-mage", "tile2:tile2-0-1");

    expect(() => service.takeEscalator({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", targetCellId: "tile2:tile2-1-2" })).toThrow("paired escalator");
    service.takeEscalator({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", targetCellId: "tile2:tile2-1-3" });
    expect(room.session.heroes[0].positionCellId).toBe("tile2:tile2-1-3");
  });

  it("takes an escalator from a cell that also has another board function", () => {
    const { service, room } = createStartedRoom();
    room.session.board.cells["search-elevator"] = {
      cellId: "search-elevator",
      tileId: "test",
      x: 20,
      y: 20,
      type: CellType.Exploration,
      walls: [],
      neighborCellIds: {},
      explorationForHeroType: HeroType.Dwarf,
      escalatorGroupId: "shared-pair",
    };
    room.session.board.cells["normal-elevator"] = {
      cellId: "normal-elevator",
      tileId: "test",
      x: 21,
      y: 20,
      type: CellType.Normal,
      walls: [],
      neighborCellIds: {},
      escalatorGroupId: "shared-pair",
    };
    placeHero(room, "hero-dwarf", "search-elevator");
    givePlayerAction(room, 0, ActionType.TakeEscalator);

    service.takeEscalator({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-dwarf" });

    expect(room.session.heroes.find((hero) => hero.heroId === "hero-dwarf")?.positionCellId).toBe("normal-elevator");
  });
});


