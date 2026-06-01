import { describe, expect, it } from "vitest";
import { MALL_TILES } from "../data/mallTiles.js";
import { ActionType, CellType, Direction, HeroType } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, placeHero } from "./testHelpers.js";

function createExplorationReadyRoom(explorationCellId: string, direction: Direction, boardX: number, boardY: number, heroType = HeroType.Mage, heroId = "hero-mage") {
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

  const cell = context.room.session.board.cells[explorationCellId];
  cell.type = CellType.Exploration;
  cell.explorationForHeroType = heroType;
  cell.explorationDirection = direction;
  cell.explorationUsed = false;
  placeHero(context.room, heroId, explorationCellId);

  return { ...context, explorer, boardX, boardY, heroId };
}

function placeFrom(explorationCellId: string, direction: Direction, boardX: number, boardY: number, rotation: 0 | 90 | 180 | 270 = 0) {
  const context = createExplorationReadyRoom(explorationCellId, direction, boardX, boardY);
  const result = context.service.explorePlaceTile({
    roomCode: context.room.roomCode,
    playerId: context.explorer.playerId,
    heroId: "hero-mage",
    explorationCellId,
    boardX,
    boardY,
    rotation,
  });
  return { ...context, result };
}

describe("tile placement physical adjacency", () => {
  it("placing east uses an entry at localX=0 and the same localY", () => {
    const { room } = placeFrom("tile1A-3-2", Direction.East, 1, 0, 180);
    const entry = room.session.board.cells[room.session.board.cells["tile1A-3-2"].neighborCellIds.East!];

    expect(entry.x).toBe(room.session.board.cells["tile1A-3-2"].x + 1);
    expect(entry.y).toBe(room.session.board.cells["tile1A-3-2"].y);
  });

  it("placing west uses an entry at localX=3 and the same localY", () => {
    const { room } = placeFrom("tile1A-0-1", Direction.West, -1, 0);
    const entry = room.session.board.cells[room.session.board.cells["tile1A-0-1"].neighborCellIds.West!];

    expect(entry.x).toBe(room.session.board.cells["tile1A-0-1"].x - 1);
    expect(entry.y).toBe(room.session.board.cells["tile1A-0-1"].y);
  });

  it("placing north uses an entry at localY=3 and the same localX", () => {
    const { room } = placeFrom("tile1A-1-0", Direction.North, 0, -1, 90);
    const entry = room.session.board.cells[room.session.board.cells["tile1A-1-0"].neighborCellIds.North!];

    expect(entry.x).toBe(room.session.board.cells["tile1A-1-0"].x);
    expect(entry.y).toBe(room.session.board.cells["tile1A-1-0"].y - 1);
  });

  it("placing south uses an entry at localY=0 and the same localX", () => {
    const { room } = placeFrom("tile1A-1-3", Direction.South, 0, 1, 270);
    const entry = room.session.board.cells[room.session.board.cells["tile1A-1-3"].neighborCellIds.South!];

    expect(entry.x).toBe(room.session.board.cells["tile1A-1-3"].x);
    expect(entry.y).toBe(room.session.board.cells["tile1A-1-3"].y + 1);
  });

  it("rejects a matching colored search arrow as the tile connection", () => {
    const context = createExplorationReadyRoom("tile1A-2-0", Direction.North, 1, -4, HeroType.Dwarf, "hero-dwarf");
    context.room.session.tileDeck.remainingTileIds = ["tile2"];

    expect(() =>
      context.service.explorePlaceTile({
        roomCode: context.room.roomCode,
        playerId: context.explorer.playerId,
        heroId: context.heroId,
        explorationCellId: "tile1A-2-0",
        boardX: 1,
        boardY: -4,
        rotation: 0,
      }),
    ).toThrow("entry arrow");
  });

  it("rejects placement if no physically aligned entry exists", () => {
    const context = createExplorationReadyRoom("tile1A-3-2", Direction.East, 1, 0);
    context.room.session.tileDeck.remainingTileIds = ["tile1B"];

    expect(() =>
      context.service.explorePlaceTile({
        roomCode: context.room.roomCode,
        playerId: context.explorer.playerId,
        heroId: "hero-mage",
        explorationCellId: "tile1A-3-2",
        boardX: 1,
        boardY: 0,
        rotation: 0,
      }),
    ).toThrow("physically aligned");
  });

  it("links the exploration cell and entry cell as mutual neighbours", () => {
    const { room } = placeFrom("tile1A-3-2", Direction.East, 1, 0, 180);
    const explorationCell = room.session.board.cells["tile1A-3-2"];
    const entryCell = room.session.board.cells[explorationCell.neighborCellIds.East!];

    expect(explorationCell.neighborCellIds.East).toBe(entryCell.cellId);
    expect(entryCell.neighborCellIds.West).toBe(explorationCell.cellId);
  });

  it("legal moves can cross from the old tile into the new tile when the action allows it", () => {
    const { service, room } = placeFrom("tile1A-3-2", Direction.East, 1, 0, 180);
    givePlayerAction(room, 0, ActionType.MoveEast);

    const moves = service.getLegalMoves({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage" });

    expect(moves.targets.map((target) => target.cellId)).toContain("tile2:tile2-3-2");
  });

  it("legal south moves can cross into a tile placed below the starter tile", () => {
    const { service, room } = placeFrom("tile1A-1-3", Direction.South, 0, 1, 270);
    givePlayerAction(room, 0, ActionType.MoveSouth);

    const moves = service.getLegalMoves({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage" });

    expect(moves.targets.map((target) => target.cellId)).toContain("tile2:tile2-3-2");
    expect(() =>
      service.moveHeroTo({
        roomCode: room.roomCode,
        playerId: room.session.players[0].playerId,
        heroId: "hero-mage",
        direction: Direction.South,
        targetCellId: "tile2:tile2-3-2",
      }),
    ).not.toThrow();
  });

  it("placeholder tiles all have sixteen cells", () => {
    for (const tileId of ["tile2", "tile3", "tile4", "tile5", "tile6", "tile7", "tile8", "tile9", "tile10", "tile11", "tile12", "tile13", "tile14", "tile15", "tile16", "tile17", "tile18", "tile19"]) {
      expect(MALL_TILES[tileId].cells).toHaveLength(16);
    }
  });
});

