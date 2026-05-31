import { describe, expect, it } from "vitest";
import { ActionType, CellType } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, placeHero } from "./testHelpers.js";

function createExplorationReadyRoom() {
  const context = createStartedRoom(5);
  context.room.session.tileDeck.remainingTileIds = ["tile2", "tile3", "tile4", "tile5", "tile6", "tile7", "tile8", "tile9"];
  const explorer = context.room.session.players[4];
  explorer.assignedActionCard = {
    actionCardId: "test-explore",
    imageKey: "ActionCard9.png",
    actions: [ActionType.ExploreTile],
    label: "Explore",
    icons: ["search"],
  };
  placeHero(context.room, "hero-elf", "tile1A-3-2");
  return { ...context, explorer };
}

describe("tile placement rules", () => {
  it("rejects tile placement when the player lacks ExploreTile", () => {
    const { service, room } = createExplorationReadyRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);

    expect(() =>
      service.explorePlaceTile({
        roomCode: room.roomCode,
        playerId: room.session.players[0].playerId,
        heroId: "hero-elf",
        explorationCellId: "tile1A-3-2",
        boardX: 1,
        boardY: 0,
        rotation: 180,
      }),
    ).toThrow("explore action");
  });

  it("rejects tile placement when the hero is not on the exploration cell", () => {
    const { service, room, explorer } = createExplorationReadyRoom();
    placeHero(room, "hero-elf", "tile1A-start-elf");

    expect(() =>
      service.explorePlaceTile({
        roomCode: room.roomCode,
        playerId: explorer.playerId,
        heroId: "hero-elf",
        explorationCellId: "tile1A-3-2",
        boardX: 1,
        boardY: 0,
        rotation: 0,
      }),
    ).toThrow("not standing");
  });

  it("rejects tile placement with the wrong hero colour", () => {
    const { service, room, explorer } = createExplorationReadyRoom();
    placeHero(room, "hero-mage", "tile1A-3-2");

    expect(() =>
      service.explorePlaceTile({
        roomCode: room.roomCode,
        playerId: explorer.playerId,
        heroId: "hero-mage",
        explorationCellId: "tile1A-3-2",
        boardX: 1,
        boardY: 0,
        rotation: 0,
      }),
    ).toThrow("colour");
  });

  it("rejects reuse of an exploration cell", () => {
    const { service, room, explorer } = createExplorationReadyRoom();
    room.session.board.cells["tile1A-3-2"].explorationUsed = true;

    expect(() =>
      service.explorePlaceTile({
        roomCode: room.roomCode,
        playerId: explorer.playerId,
        heroId: "hero-elf",
        explorationCellId: "tile1A-3-2",
        boardX: 1,
        boardY: 0,
        rotation: 0,
      }),
    ).toThrow("already used");
  });

  it("rejects placement that does not follow the exploration arrow", () => {
    const { service, room, explorer } = createExplorationReadyRoom();

    expect(() =>
      service.explorePlaceTile({
        roomCode: room.roomCode,
        playerId: explorer.playerId,
        heroId: "hero-elf",
        explorationCellId: "tile1A-3-2",
        boardX: -1,
        boardY: 0,
        rotation: 180,
      }),
    ).toThrow("arrow");
  });

  it("places a tile with a supported rotation when the rotated entry aligns", () => {
    const { service, room, explorer } = createExplorationReadyRoom();

    const result = service.explorePlaceTile({
      roomCode: room.roomCode,
      playerId: explorer.playerId,
      heroId: "hero-elf",
      explorationCellId: "tile1A-3-2",
      boardX: 1,
      boardY: 0,
      rotation: 180,
    });

    expect(result.placedTile.rotation).toBe(180);
  });

  it("rejects placement when the next tile lacks a physically aligned entry", () => {
    const { service, room, explorer } = createExplorationReadyRoom();
    room.session.tileDeck.remainingTileIds = ["tile1B"];

    expect(() =>
      service.explorePlaceTile({
        roomCode: room.roomCode,
        playerId: explorer.playerId,
        heroId: "hero-elf",
        explorationCellId: "tile1A-3-2",
        boardX: 1,
        boardY: 0,
        rotation: 0,
      }),
    ).toThrow("physically aligned");
  });

  it("places the next tile and connects it to the exploration cell", () => {
    const { service, room, explorer } = createExplorationReadyRoom();

    const result = service.explorePlaceTile({
      roomCode: room.roomCode,
      playerId: explorer.playerId,
      heroId: "hero-elf",
      explorationCellId: "tile1A-3-2",
      boardX: 1,
      boardY: 0,
      rotation: 180,
    });

    expect(result.placedTile.tileId).toBe("tile2");
    expect(result.placedTile.rotation).toBe(180);
    expect(room.session.tileDeck.remainingTileIds).toEqual(["tile3", "tile4", "tile5", "tile6", "tile7", "tile8", "tile9"]);
    expect(room.session.tileDeck.usedTileIds).toEqual(["tile2"]);
    expect(room.session.placedTiles.some((tile) => tile.tileId === "tile2" && tile.boardX === 4 && tile.boardY === 1)).toBe(true);
    expect(result.createdCellIds).toContain("tile2:tile2-3-2");
    expect(room.session.board.cells["tile2:tile2-3-2"].type).toBe(CellType.Normal);
    expect(room.session.board.cells["tile1A-3-2"].explorationUsed).toBe(true);
    expect(room.session.board.cells["tile1A-3-2"].neighborCellIds.East).toBe("tile2:tile2-3-2");
    expect(room.session.board.cells["tile2:tile2-3-2"].neighborCellIds.West).toBe("tile1A-3-2");
  });

  it("places the next tile from the solo Search action on the starter mage exploration space", () => {
    const { service, room } = createStartedRoom(1);
    room.session.tileDeck.remainingTileIds = ["tile2", "tile3", "tile4", "tile5", "tile6", "tile7", "tile8", "tile9"];
    const player = room.session.players[0];

    service.cycleSoloAction({
      roomCode: room.roomCode,
      playerId: player.playerId,
      targetAction: ActionType.ExploreTile,
    });
    placeHero(room, "hero-mage", "tile1A-0-1");

    const result = service.explorePlaceTile({
      roomCode: room.roomCode,
      playerId: player.playerId,
      heroId: "hero-mage",
      explorationCellId: "tile1A-0-1",
      boardX: -1,
      boardY: 0,
      rotation: 0,
    });

    expect(result.placedTile.tileId).toBe("tile2");
    expect(room.session.placedTiles.some((tile) => tile.tileId === "tile2" && tile.boardX === -4 && tile.boardY === -1)).toBe(true);
    expect(room.session.board.cells["tile1A-0-1"].explorationUsed).toBe(true);
    expect(room.session.board.cells["tile1A-0-1"].neighborCellIds.West).toBe("tile2:tile2-3-2");
    expect(room.session.board.cells["tile2:tile2-3-2"].neighborCellIds.East).toBe("tile1A-0-1");
  });

  it("places the next tile from the solo Search action on the starter dwarf exploration space", () => {
    const { service, room } = createStartedRoom(1);
    room.session.tileDeck.remainingTileIds = ["tile2", "tile3", "tile4", "tile5", "tile6", "tile7", "tile8", "tile9"];
    const player = room.session.players[0];

    service.cycleSoloAction({
      roomCode: room.roomCode,
      playerId: player.playerId,
      targetAction: ActionType.ExploreTile,
    });
    placeHero(room, "hero-dwarf", "tile1A-2-0");

    const result = service.explorePlaceTile({
      roomCode: room.roomCode,
      playerId: player.playerId,
      heroId: "hero-dwarf",
      explorationCellId: "tile1A-2-0",
      boardX: 0,
      boardY: -1,
      rotation: 90,
    });

    expect(result.placedTile.tileId).toBe("tile2");
    expect(room.session.placedTiles.some((tile) => tile.tileId === "tile2" && tile.boardX === 1 && tile.boardY === -4)).toBe(true);
    expect(room.session.board.cells["tile1A-2-0"].explorationUsed).toBe(true);
    expect(room.session.board.cells["tile1A-2-0"].neighborCellIds.North).toBe("tile2:tile2-3-2");
    expect(room.session.board.cells["tile2:tile2-3-2"].neighborCellIds.South).toBe("tile1A-2-0");
  });
});



