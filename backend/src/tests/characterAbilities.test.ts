import { describe, expect, it } from "vitest";
import { ActionType, CellType, Direction, HeroType } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, placeHero } from "./testHelpers.js";

describe("character abilities", () => {
  it("Dwarf can pass orange walls only when scenario flag is enabled", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    givePlayerAction(room, 0, ActionType.MoveNorth);
    placeHero(room, "hero-dwarf", "tile1A-start-mage");
    room.session.board.cells["tile1A-start-mage"].orangeWallDirections = [Direction.North];
    expect(() => service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-dwarf", direction: Direction.North })).toThrow("Dwarf");
    room.session.scenario.ruleFlags.dwarfCanPassOrangeWalls = true;
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-dwarf", direction: Direction.North });
    expect(room.session.heroes.find((hero) => hero.heroId === "hero-dwarf")?.positionCellId).toBe("tile1A-1-0");
  });

  it("Elf exploration starts discussion when enabled", () => {
    const { service, room } = createStartedRoom(5);
    room.session.tileDeck.remainingTileIds = ["tile2"];
    room.session.scenario.communicationAlwaysOpen = false;
    room.session.scenario.ruleFlags.elfExploreStartsDiscussion = true;
    room.session.players[4].assignedActionCard = { actionCardId: "explore", imageKey: "x.png", actions: [ActionType.ExploreTile], label: "Explore", icons: [] };
    room.session.board.cells["tile1A-3-2"].explorationForHeroType = HeroType.Elf;
    placeHero(room, "hero-elf", "tile1A-3-2");
    service.explorePlaceTile({ roomCode: room.roomCode, playerId: room.session.players[4].playerId, heroId: "hero-elf", explorationCellId: "tile1A-3-2", boardX: 1, boardY: 0, rotation: 180 });
    expect(room.session.status).toBe("InProgress");
    expect(room.session.communicationState.mode).toBe("DiscussionOpen");
    expect(room.session.communicationState.reason).toBe("ElfAbility");
  });

  it("Mage crystal ball can place a tile and marks crystal used", () => {
    const { service, room } = createStartedRoom(5);
    room.session.tileDeck.remainingTileIds = ["tile2"];
    room.session.scenario.communicationAlwaysOpen = false;
    room.session.scenario.ruleFlags.mageCrystalBallEnabled = true;
    room.session.players[4].assignedActionCard = { actionCardId: "explore", imageKey: "x.png", actions: [ActionType.ExploreTile], label: "Explore", icons: [] };
    room.session.board.cells.crystal = { cellId: "crystal", tileId: "test", x: 8, y: 8, type: CellType.CrystalBall, walls: [], neighborCellIds: {}, occupiedByHeroId: "hero-mage" };
    room.session.board.cells["tile1A-3-2"].explorationForHeroType = HeroType.Mage;
    placeHero(room, "hero-mage", "crystal");
    service.mageCrystalExplore({ roomCode: room.roomCode, playerId: room.session.players[4].playerId, heroId: "hero-mage", placements: [{ explorationCellId: "tile1A-3-2", boardX: 1, boardY: 0, rotation: 180 }] });
    expect(room.session.board.cells.crystal.crystalBallUsed).toBe(true);
  });

  it("Non-Mage cannot use crystal ball", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    room.session.scenario.ruleFlags.mageCrystalBallEnabled = true;
    room.session.players[0].assignedActionCard = { actionCardId: "explore", imageKey: "x.png", actions: [ActionType.ExploreTile], label: "Explore", icons: [] };
    room.session.board.cells.crystal = { cellId: "crystal", tileId: "test", x: 8, y: 8, type: CellType.CrystalBall, walls: [], neighborCellIds: {}, occupiedByHeroId: "hero-elf" };
    placeHero(room, "hero-elf", "crystal");
    expect(() => service.mageCrystalExplore({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-elf", placements: [{ explorationCellId: "tile1A-3-2", boardX: 1, boardY: 0, rotation: 0 }] })).toThrow("Mage");
  });
});



