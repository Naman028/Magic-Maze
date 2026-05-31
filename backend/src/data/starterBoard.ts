import { Direction, MazeBoard } from "../game/gameTypes.js";
import { getMallTile, globalCellId } from "./mallTiles.js";

export function createStarterBoard(): MazeBoard {
  const tile = getMallTile("tile1A");
  const cells: MazeBoard["cells"] = {};
  for (const definition of tile.cells) {
    const cellId = globalCellId(tile.tileId, definition.localCellId);
    cells[cellId] = {
      cellId,
      tileId: tile.tileId,
      x: definition.localX,
      y: definition.localY,
      type: definition.type,
      walls: [...definition.walls],
      orangeWallDirections: definition.orangeWallDirections ? [...definition.orangeWallDirections] : undefined,
      neighborCellIds: Object.fromEntries(
        Object.entries(definition.neighborLocalCellIds ?? {}).map(([direction, localCellId]) => [direction, globalCellId(tile.tileId, localCellId)]),
      ),
      itemForHeroType: definition.itemForHeroType,
      exitForHeroType: definition.exitForHeroType,
      vortexForHeroType: definition.vortexForHeroType,
      explorationForHeroType: definition.explorationForHeroType,
      explorationDirection: definition.explorationDirection,
      explorationUsed: definition.type === "Exploration" ? false : undefined,
      escalatorGroupId: definition.escalatorGroupId,
    };
  }
  cells["tile1A-start-mage"].occupiedByHeroId = "hero-mage";
  cells["tile1A-start-dwarf"].occupiedByHeroId = "hero-dwarf";
  cells["tile1A-start-barbarian"].occupiedByHeroId = "hero-barbarian";
  cells["tile1A-start-elf"].occupiedByHeroId = "hero-elf";
  return { cells };
}

export function oppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case Direction.North:
      return Direction.South;
    case Direction.South:
      return Direction.North;
    case Direction.East:
      return Direction.West;
    case Direction.West:
      return Direction.East;
  }
}
