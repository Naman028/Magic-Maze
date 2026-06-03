import { describe, expect, it } from "vitest";
import { MALL_TILES, TILE_SIZE } from "../data/mallTiles.js";
import { CellType, Direction, HeroType } from "../game/gameTypes.js";
import { createStartedRoom } from "./testHelpers.js";

const deltaByDirection = {
  [Direction.North]: { dx: 0, dy: -1 },
  [Direction.South]: { dx: 0, dy: 1 },
  [Direction.East]: { dx: 1, dy: 0 },
  [Direction.West]: { dx: -1, dy: 0 },
};

const startCells = {
  "tile1A-start-mage": { localX: 1, localY: 1, heroType: HeroType.Mage, heroId: "hero-mage" },
  "tile1A-start-dwarf": { localX: 2, localY: 1, heroType: HeroType.Dwarf, heroId: "hero-dwarf" },
  "tile1A-start-barbarian": { localX: 1, localY: 2, heroType: HeroType.Barbarian, heroId: "hero-barbarian" },
  "tile1A-start-elf": { localX: 2, localY: 2, heroType: HeroType.Elf, heroId: "hero-elf" },
} as const;

describe("tile graph consistency", () => {
  for (const tile of Object.values(MALL_TILES)) {
    it(`${tile.tileId} has 4x4-valid local coordinates`, () => {
      for (const cell of tile.cells) {
        expect(cell.localX).toBeGreaterThanOrEqual(0);
        expect(cell.localX).toBeLessThan(TILE_SIZE);
        expect(cell.localY).toBeGreaterThanOrEqual(0);
        expect(cell.localY).toBeLessThan(TILE_SIZE);
      }
    });

    it(`${tile.tileId} has physically adjacent neighbor links`, () => {
      const byId = new Map(tile.cells.map((cell) => [cell.localCellId, cell]));

      for (const cell of tile.cells) {
        for (const [directionRaw, neighborId] of Object.entries(cell.neighborLocalCellIds ?? {})) {
          const direction = directionRaw as Direction;
          const neighbor = byId.get(neighborId);

          expect(neighbor, `${tile.tileId}:${cell.localCellId} ${direction} -> ${neighborId}`).toBeDefined();

          const delta = deltaByDirection[direction];

          expect(neighbor!.localX).toBe(cell.localX + delta.dx);
          expect(neighbor!.localY).toBe(cell.localY + delta.dy);
        }
      }
    });

    it(`${tile.tileId} does not have duplicate local coordinates`, () => {
      const seen = new Set<string>();

      for (const cell of tile.cells) {
        const key = `${cell.localX},${cell.localY}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
    });
  }

  it("defines the four central starter cells", () => {
    const cellsById = new Map(MALL_TILES.tile1A.cells.map((cell) => [cell.localCellId, cell]));

    for (const [cellId, expected] of Object.entries(startCells)) {
      const cell = cellsById.get(cellId);
      expect(cell).toBeDefined();
      expect(cell?.localX).toBe(expected.localX);
      expect(cell?.localY).toBe(expected.localY);
    }
  });

  it("matches tile1A visible hero-colour spaces to metadata", () => {
    const cellsById = new Map(MALL_TILES.tile1A.cells.map((cell) => [cell.localCellId, cell]));

    expect(cellsById.get("tile1A-2-0")).toMatchObject({
      type: CellType.Exploration,
      explorationForHeroType: HeroType.Dwarf,
      explorationDirection: Direction.North,
    });
    expect(cellsById.get("tile1A-0-1")).toMatchObject({
      type: CellType.Exploration,
      explorationForHeroType: HeroType.Mage,
      explorationDirection: Direction.West,
    });
    expect(cellsById.get("tile1A-3-2")).toMatchObject({
      type: CellType.Exploration,
      explorationForHeroType: HeroType.Elf,
      explorationDirection: Direction.East,
    });
    expect(cellsById.get("tile1A-1-3")).toMatchObject({
      type: CellType.Exploration,
      explorationForHeroType: HeroType.Barbarian,
      explorationDirection: Direction.South,
    });
    expect(cellsById.get("tile1A-3-1")).toMatchObject({
      type: CellType.Vortex,
      vortexForHeroType: HeroType.Barbarian,
    });
    expect(cellsById.get("tile1A-0-2")).toMatchObject({
      type: CellType.Vortex,
      vortexForHeroType: HeroType.Dwarf,
    });
  });

  it("starts all heroes on the expected occupied starter cells", () => {
    const { room } = createStartedRoom();

    for (const [cellId, expected] of Object.entries(startCells)) {
      const hero = room.session.heroes.find((candidate) => candidate.heroType === expected.heroType);
      expect(hero?.positionCellId).toBe(cellId);
      expect(room.session.board.cells[cellId]?.occupiedByHeroId).toBe(expected.heroId);
    }

    const occupiedStarterCells = Object.keys(startCells).filter((cellId) => room.session.board.cells[cellId]?.occupiedByHeroId);
    expect(new Set(occupiedStarterCells).size).toBe(4);
  });
});
