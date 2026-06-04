import { describe, expect, it } from "vitest";
import { ACTION_CARDS } from "../data/actionCards.js";
import { MALL_TILES, visualEscalatorGroupId } from "../data/mallTiles.js";
import { SCENARIOS, STARTER_SCENARIO } from "../data/scenarios.js";
import { ActionType, CellType } from "../game/gameTypes.js";
import { createRoomService } from "./testHelpers.js";

describe("metadata alignment", () => {
  it("uses tile1A backed by tile0.jpg as the starting tile", () => {
    expect(STARTER_SCENARIO.startingTileId).toBe("tile1A");
    expect(MALL_TILES.tile1A.imageKey).toBe("tile0.jpg");

    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host" });

    expect(room.session.placedTiles[0]).toMatchObject({ tileId: "tile1A", imageKey: "tile0.jpg" });
  });

  it("sets Scenario 1 deck to tile2 through tile9", () => {
    expect(STARTER_SCENARIO.tileDeckIds).toEqual(["tile2", "tile3", "tile4", "tile5", "tile6", "tile7", "tile8", "tile9"]);
  });

  it("defines placeholder metadata for every Scenario 1 deck tile", () => {
    for (const tileId of STARTER_SCENARIO.tileDeckIds) {
      expect(MALL_TILES[tileId]).toBeDefined();
      expect(MALL_TILES[tileId].imageKey).toBe(`${tileId}.jpg`);
      expect(MALL_TILES[tileId].metadataStatus).toBeDefined();
      expect(MALL_TILES[tileId].cells.some((cell) => cell.isEntryPoint)).toBe(true);
    }
  });

  it("keeps placeholder tile coordinates inside the 4x4 playable grid", () => {
    for (const tile of Object.values(MALL_TILES)) {
      for (const cell of tile.cells) {
        expect(cell.localX, `${tile.tileId}:${cell.localCellId} localX`).toBeGreaterThanOrEqual(0);
        expect(cell.localX, `${tile.tileId}:${cell.localCellId} localX`).toBeLessThanOrEqual(3);
        expect(cell.localY, `${tile.tileId}:${cell.localCellId} localY`).toBeGreaterThanOrEqual(0);
        expect(cell.localY, `${tile.tileId}:${cell.localCellId} localY`).toBeLessThanOrEqual(3);
      }
    }
  });

  it("defines escalator metadata in usable pairs", () => {
    for (const tile of Object.values(MALL_TILES)) {
      const groups = new Map<string, number>();
      for (const cell of tile.cells) {
        if (!cell.escalatorGroupId) continue;
        groups.set(cell.escalatorGroupId, (groups.get(cell.escalatorGroupId) ?? 0) + 1);
      }

      for (const [groupId, count] of groups) {
        expect(count, `${tile.tileId}:${groupId}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("uses visual stair endpoints for elevator tiles", () => {
    const expected = {
      tile2: [
        ["tile2-0-1", "tile2-1-2"],
      ],
      tile7: [["tile7-2-1", "tile7-1-3"]],
      tile10: [["tile10-1-2", "tile10-2-1"]],
      tile12: [
        ["tile12-1-0", "tile12-2-1"],
        ["tile12-0-2", "tile12-1-3"],
      ],
      tile14: [["tile14-0-1", "tile14-2-2"]],
      tile15: [["tile15-0-1", "tile15-2-1"]],
      tile20: [["tile20-1-2", "tile20-2-1"]],
    } as const;

    for (const [tileId, pairs] of Object.entries(expected)) {
      const visualEndpointIds = new Set(pairs.flat());
      const metadataEndpointIds = MALL_TILES[tileId].cells.filter((cell) => cell.escalatorGroupId).map((cell) => cell.localCellId);
      expect(new Set(metadataEndpointIds), tileId).toEqual(visualEndpointIds);

      pairs.forEach((pair, index) => {
        const groupId = `${tileId}-visual-escalator-${index + 1}`;
        expect(pair.map((cellId) => visualEscalatorGroupId(tileId, cellId))).toEqual([groupId, groupId]);
      });
    }
  });

  it("maps uploaded action card images onto exact action lists", () => {
    expect(ACTION_CARDS).toHaveLength(9);
    expect(ACTION_CARDS.map((card) => ({ imageKey: card.imageKey, actions: card.actions }))).toEqual([
      { imageKey: "ActionCard1.png", actions: [ActionType.MoveEast] },
      { imageKey: "ActionCard2.png", actions: [ActionType.MoveWest, ActionType.UseVortex] },
      { imageKey: "ActionCard3.png", actions: [ActionType.MoveNorth, ActionType.MoveEast, ActionType.UseVortex] },
      { imageKey: "ActionCard4.png", actions: [ActionType.MoveNorth] },
      { imageKey: "ActionCard5.png", actions: [ActionType.MoveSouth] },
      { imageKey: "ActionCard6.png", actions: [ActionType.MoveNorth] },
      { imageKey: "ActionCard7.png", actions: [ActionType.MoveSouth, ActionType.ExploreTile] },
      { imageKey: "ActionCard8.png", actions: [ActionType.MoveEast, ActionType.TakeEscalator] },
      { imageKey: "ActionCard9.png", actions: [ActionType.MoveWest] },
    ]);
    expect(ACTION_CARDS.some((card) => card.actions.includes(ActionType.SendSignal))).toBe(false);
  });

  it("keeps tile1A and tile1B distinct and reference-backed", () => {
    expect(MALL_TILES.tile1A.imageKey).toBe("tile0.jpg");
    expect(MALL_TILES.tile1B.imageKey).toBe("tile1.jpg");
    expect(MALL_TILES.tile1A.metadataStatus).toBe("verified");
    expect(MALL_TILES.tile1B.metadataStatus).toBe("verified");
    expect(JSON.stringify(MALL_TILES.tile1A.cells)).not.toBe(JSON.stringify(MALL_TILES.tile1B.cells));
  });

  it("does not expose artificial exits on tile1A", () => {
    const exitHeroTypes = MALL_TILES.tile1A.cells.filter((cell) => cell.type === CellType.Exit).map((cell) => cell.exitForHeroType);
    expect(exitHeroTypes).toEqual([]);
  });

  it("uses the visual purple exit on tile20", () => {
    expect(MALL_TILES.tile20.cells.find((cell) => cell.localCellId === "tile20-3-3")).toMatchObject({
      type: CellType.Exit,
      exitForHeroType: "Mage",
    });
  });

  it("encodes Scenario 1 and Scenario 2 exit/communication rules", () => {
    expect(SCENARIOS.scenario1.matchingExitsRequired).toBe(false);
    expect(SCENARIOS.scenario1.communicationAlwaysOpen).toBe(false);
    expect(SCENARIOS.scenario2.matchingExitsRequired).toBe(true);
    expect(SCENARIOS.scenario2.communicationAlwaysOpen).toBe(false);
  });
});


