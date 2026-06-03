import { describe, expect, it } from "vitest";
import { ActionType, CellType, Direction, HeroType } from "../game/gameTypes.js";
import { applyDefeat } from "../rules/victoryDefeatRules.js";
import { createStartedRoom, givePlayerAction, markAllButMageEscaped, placeHero, setTheftReadyExceptMage } from "./testHelpers.js";

describe("game effects", () => {
  it("tile placement produces TilePlaced effect", () => {
    const { service, room } = createStartedRoom(5);
    room.session.tileDeck.remainingTileIds = ["tile2"];
    room.session.players[4].assignedActionCard = { actionCardId: "explore", imageKey: "x.png", actions: [ActionType.ExploreTile], label: "Explore", icons: [] };
    placeHero(room, "hero-elf", "tile1A-3-2");
    service.explorePlaceTile({ roomCode: room.roomCode, playerId: room.session.players[4].playerId, heroId: "hero-elf", explorationCellId: "tile1A-3-2", boardX: 1, boardY: 0, rotation: 180 });
    expect(room.session.effectLog.some((effect) => effect.effectType === "TilePlaced")).toBe(true);
  });

  it("theft produces TheftTriggered effect", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);
    setTheftReadyExceptMage(room);
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North });
    expect(room.session.effectLog.some((effect) => effect.effectType === "TheftTriggered")).toBe(true);
  });

  it("vortex and escalator produce effects", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.UseVortex);
    room.session.board.cells.vortex = { cellId: "vortex", tileId: "test", x: 1, y: 1, type: CellType.Vortex, walls: [], neighborCellIds: {}, vortexForHeroType: HeroType.Mage };
    service.useVortex({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", targetCellId: "vortex" });
    givePlayerAction(room, 0, ActionType.TakeEscalator);
    room.session.board.cells["esc-a"] = { cellId: "esc-a", tileId: "test", x: 2, y: 2, type: CellType.Escalator, walls: [], neighborCellIds: {}, escalatorGroupId: "e" };
    room.session.board.cells["esc-b"] = { cellId: "esc-b", tileId: "test", x: 3, y: 2, type: CellType.Escalator, walls: [], neighborCellIds: {}, escalatorGroupId: "e" };
    placeHero(room, "hero-mage", "esc-a");
    service.takeEscalator({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage" });
    expect(room.session.effectLog.some((effect) => effect.effectType === "VortexUsed")).toBe(true);
    expect(room.session.effectLog.some((effect) => effect.effectType === "EscalatorUsed")).toBe(true);
  });

  it("victory and defeat produce effects", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveSouth);
    markAllButMageEscaped(room);
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.South });
    expect(room.session.effectLog.some((effect) => effect.effectType === "Victory")).toBe(true);

    const second = createStartedRoom().room;
    applyDefeat(second.session, "Test defeat");
    expect(second.session.effectLog.some((effect) => effect.effectType === "Defeat")).toBe(true);
  });
});




