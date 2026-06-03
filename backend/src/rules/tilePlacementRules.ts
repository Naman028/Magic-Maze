import { getMallTile, globalCellId, TILE_SIZE } from "../data/mallTiles.js";
import { ActionType, CellType, Direction, GameSession, GameStatus, Hero, MazeCell, Player, PlacedTile, TileCellDefinition } from "../game/gameTypes.js";
import { oppositeDirection } from "../data/starterBoard.js";

export interface TilePlacementResult {
  placedTile: PlacedTile;
  createdCellIds: string[];
}

export function assertCanExplore(session: GameSession, playerId: string, heroId: string, explorationCellId: string): { player: Player; hero: Hero; explorationCell: MazeCell } {
  if (session.status !== GameStatus.InProgress) {
    throw new Error("Tile exploration is only allowed while the game is in progress.");
  }
  if (session.actionsLocked) {
    throw new Error("Actions are locked.");
  }
  const player = session.players.find((candidate) => candidate.playerId === playerId);
  if (!player) {
    throw new Error("Player does not belong to this room.");
  }
  if (!player.assignedActionCard?.actions.includes(ActionType.ExploreTile)) {
    throw new Error("Player is not assigned the explore action.");
  }
  const hero = session.heroes.find((candidate) => candidate.heroId === heroId);
  if (!hero) {
    throw new Error("Hero does not exist.");
  }
  if (hero.positionCellId !== explorationCellId) {
    throw new Error("Hero is not standing on the exploration cell.");
  }
  const explorationCell = session.board.cells[explorationCellId];
  if (!explorationCell || explorationCell.type !== CellType.Exploration) {
    throw new Error("Cell is not an exploration space.");
  }
  if (explorationCell.explorationForHeroType !== hero.heroType) {
    throw new Error("Hero colour does not match this exploration space.");
  }
  if (explorationCell.explorationUsed) {
    throw new Error("Exploration space was already used.");
  }
  if (session.tileDeck.remainingTileIds.length === 0) {
    throw new Error("Tile deck is empty.");
  }
  return { player, hero, explorationCell };
}

export function getNextTileFromDeck(session: GameSession, selectedTileId?: string) {
  const nextTileId = selectedTileId ?? session.tileDeck.remainingTileIds[0];
  if (!nextTileId) {
    throw new Error("Tile deck is empty.");
  }
  if (!session.tileDeck.remainingTileIds.includes(nextTileId)) {
    throw new Error("Selected tile is not in the remaining tile deck.");
  }
  return getMallTile(nextTileId);
}

function rotateDirection(direction: Direction, rotation: 0 | 90 | 180 | 270): Direction {
  const clockwise: Record<Direction, Direction> = {
    [Direction.North]: Direction.East,
    [Direction.East]: Direction.South,
    [Direction.South]: Direction.West,
    [Direction.West]: Direction.North,
  };
  let current = direction;
  for (let turns = 0; turns < rotation / 90; turns += 1) {
    current = clockwise[current];
  }
  return current;
}

function rotateLocalCoordinate(x: number, y: number, rotation: 0 | 90 | 180 | 270): { x: number; y: number } {
  switch (rotation) {
    case 90:
      return { x: TILE_SIZE - 1 - y, y: x };
    case 180:
      return { x: TILE_SIZE - 1 - x, y: TILE_SIZE - 1 - y };
    case 270:
      return { x: y, y: TILE_SIZE - 1 - x };
    case 0:
      return { x, y };
  }
}

function rotateTileCells(cells: TileCellDefinition[], rotation: 0 | 90 | 180 | 270): TileCellDefinition[] {
  if (rotation === 0) return cells;

  return cells.map((cell) => {
    const rotated = rotateLocalCoordinate(cell.localX, cell.localY, rotation);
    const neighborLocalCellIds = Object.fromEntries(
      Object.entries(cell.neighborLocalCellIds ?? {}).map(([direction, neighborId]) => [rotateDirection(direction as Direction, rotation), neighborId]),
    );
    return {
      ...cell,
      localX: rotated.x,
      localY: rotated.y,
      walls: cell.walls.map((direction) => rotateDirection(direction, rotation)),
      orangeWallDirections: cell.orangeWallDirections?.map((direction) => rotateDirection(direction, rotation)),
      neighborLocalCellIds,
      entryDirection: cell.entryDirection ? rotateDirection(cell.entryDirection, rotation) : undefined,
      explorationDirection: cell.explorationDirection ? rotateDirection(cell.explorationDirection, rotation) : undefined,
    };
  });
}

export function assertPlacementFollowsArrow(session: GameSession, explorationCell: MazeCell, boardX: number, boardY: number): void {
  const placedTile = session.placedTiles.find((tile) => tile.tileId === explorationCell.tileId);
  if (!placedTile) {
    throw new Error("Exploration tile is not placed.");
  }
  const sourceMinX = placedTile.boardX;
  const sourceMaxX = placedTile.boardX + TILE_SIZE - 1;
  const sourceMinY = placedTile.boardY;
  const sourceMaxY = placedTile.boardY + TILE_SIZE - 1;

  switch (explorationCell.explorationDirection) {
    case Direction.North:
      if (boardY + TILE_SIZE - 1 !== explorationCell.y - 1 || boardX > explorationCell.x || boardX + TILE_SIZE - 1 < explorationCell.x || boardY > sourceMinY) throw new Error("Tile placement does not follow the exploration arrow.");
      return;
    case Direction.South:
      if (boardY !== explorationCell.y + 1 || boardX > explorationCell.x || boardX + TILE_SIZE - 1 < explorationCell.x || boardY < sourceMaxY) throw new Error("Tile placement does not follow the exploration arrow.");
      return;
    case Direction.East:
      if (boardX !== explorationCell.x + 1 || boardY > explorationCell.y || boardY + TILE_SIZE - 1 < explorationCell.y || boardX < sourceMaxX) throw new Error("Tile placement does not follow the exploration arrow.");
      return;
    case Direction.West:
      if (boardX + TILE_SIZE - 1 !== explorationCell.x - 1 || boardY > explorationCell.y || boardY + TILE_SIZE - 1 < explorationCell.y || boardX > sourceMinX) throw new Error("Tile placement does not follow the exploration arrow.");
      return;
    default:
      throw new Error("Exploration space has no arrow direction.");
  }
}

export function assertTileDoesNotOverlap(session: GameSession, boardX: number, boardY: number): void {
  const overlaps = session.placedTiles.some((tile) => {
    return boardX < tile.boardX + TILE_SIZE && boardX + TILE_SIZE > tile.boardX && boardY < tile.boardY + TILE_SIZE && boardY + TILE_SIZE > tile.boardY;
  });

  if (overlaps) {
    throw new Error("Tile placement overlaps an existing tile.");
  }
}

function requiredEntryPositionForArrow(explorationCell: MazeCell, direction: Direction): { localX: number; localY: number; entryDirection: Direction } {
  const sourceLocalX = ((explorationCell.x % TILE_SIZE) + TILE_SIZE) % TILE_SIZE;
  const sourceLocalY = ((explorationCell.y % TILE_SIZE) + TILE_SIZE) % TILE_SIZE;

  switch (direction) {
    case Direction.East:
      return {
        localX: 0,
        localY: sourceLocalY,
        entryDirection: Direction.West,
      };
    case Direction.West:
      return {
        localX: TILE_SIZE - 1,
        localY: sourceLocalY,
        entryDirection: Direction.East,
      };
    case Direction.North:
      return {
        localX: sourceLocalX,
        localY: TILE_SIZE - 1,
        entryDirection: Direction.South,
      };
    case Direction.South:
      return {
        localX: sourceLocalX,
        localY: 0,
        entryDirection: Direction.North,
      };
  }
}

function getCompatibleEntryLocalCellId(cells: TileCellDefinition[], explorationCell: MazeCell, direction: Direction): string {
  const required = requiredEntryPositionForArrow(explorationCell, direction);
  const entry = cells.find((cell) => {
    const isPhysicalEntry = cell.isEntryPoint === true && cell.entryDirection === required.entryDirection;
    return isPhysicalEntry;
  });

  if (!entry) {
    throw new Error(`New tile does not have a physically aligned ${required.entryDirection} entry arrow.`);
  }

  return entry.localCellId;
}

const directionDelta: Record<Direction, { dx: number; dy: number }> = {
  [Direction.North]: { dx: 0, dy: -1 },
  [Direction.South]: { dx: 0, dy: 1 },
  [Direction.East]: { dx: 1, dy: 0 },
  [Direction.West]: { dx: -1, dy: 0 },
};

function originForEntry(explorationCell: MazeCell, entry: TileCellDefinition, direction: Direction): { boardX: number; boardY: number } {
  const delta = directionDelta[direction];
  return {
    boardX: explorationCell.x + delta.dx - entry.localX,
    boardY: explorationCell.y + delta.dy - entry.localY,
  };
}

function legacySlotPlacementFollowsArrow(session: GameSession, explorationCell: MazeCell, boardX: number, boardY: number): boolean {
  const placedTile = session.placedTiles.find((tile) => tile.tileId === explorationCell.tileId);
  if (!placedTile) return false;

  const sourceSlotX = Math.trunc(placedTile.boardX / TILE_SIZE);
  const sourceSlotY = Math.trunc(placedTile.boardY / TILE_SIZE);

  switch (explorationCell.explorationDirection) {
    case Direction.North:
      return boardX === sourceSlotX && boardY === sourceSlotY - 1;
    case Direction.South:
      return boardX === sourceSlotX && boardY === sourceSlotY + 1;
    case Direction.East:
      return boardX === sourceSlotX + 1 && boardY === sourceSlotY;
    case Direction.West:
      return boardX === sourceSlotX - 1 && boardY === sourceSlotY;
    default:
      return false;
  }
}

export function placeNextTile(
  session: GameSession,
  playerId: string,
  heroId: string,
  explorationCellId: string,
  boardX: number,
  boardY: number,
  rotation: 0 | 90 | 180 | 270,
  selectedTileId?: string,
): TilePlacementResult {
  const { explorationCell } = assertCanExplore(session, playerId, heroId, explorationCellId);

  const tile = getNextTileFromDeck(session, selectedTileId);
  const tileCells = rotateTileCells(tile.cells, rotation);
  const direction = explorationCell.explorationDirection;
  if (!direction) {
    throw new Error("Exploration space has no arrow direction.");
  }
  const entryLocalCellId = getCompatibleEntryLocalCellId(tileCells, explorationCell, direction);
  const entryDefinition = tileCells.find((cell) => cell.localCellId === entryLocalCellId);
  if (!entryDefinition) {
    throw new Error("New tile cannot connect to this exploration space.");
  }
  const expectedOrigin = originForEntry(explorationCell, entryDefinition, direction);
  const finalBoardX = legacySlotPlacementFollowsArrow(session, explorationCell, boardX, boardY) ? expectedOrigin.boardX : boardX;
  const finalBoardY = legacySlotPlacementFollowsArrow(session, explorationCell, boardX, boardY) ? expectedOrigin.boardY : boardY;

  if (finalBoardX !== expectedOrigin.boardX || finalBoardY !== expectedOrigin.boardY) {
    throw new Error("Tile placement does not follow the exploration arrow.");
  }

  assertPlacementFollowsArrow(session, explorationCell, finalBoardX, finalBoardY);
  assertTileDoesNotOverlap(session, finalBoardX, finalBoardY);

  const placedTile: PlacedTile = { tileId: tile.tileId, imageKey: tile.imageKey, boardX: finalBoardX, boardY: finalBoardY, rotation };
  const createdCellIds: string[] = [];

  for (const definition of tileCells) {
    const cellId = globalCellId(tile.tileId, definition.localCellId);
    session.board.cells[cellId] = {
      cellId,
      tileId: tile.tileId,
      x: finalBoardX + definition.localX,
      y: finalBoardY + definition.localY,
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
      explorationUsed: definition.type === CellType.Exploration ? false : undefined,
      escalatorGroupId: definition.escalatorGroupId,
    };
    createdCellIds.push(cellId);
  }

  const entryCellId = globalCellId(tile.tileId, entryLocalCellId);
  const entryCell = session.board.cells[entryCellId] ?? session.board.cells[createdCellIds[0]];
  if (!entryCell) {
    throw new Error("New tile cannot connect to this exploration space.");
  }

  const dx = Math.abs(explorationCell.x - entryCell.x);
  const dy = Math.abs(explorationCell.y - entryCell.y);

  if (dx + dy !== 1) {
    throw new Error("New tile entry is not physically adjacent to the exploration space.");
  }

  explorationCell.neighborCellIds[direction] = entryCell.cellId;
  entryCell.neighborCellIds[oppositeDirection(direction)] = explorationCell.cellId;
  explorationCell.explorationUsed = true;

  session.tileDeck.remainingTileIds.splice(session.tileDeck.remainingTileIds.indexOf(tile.tileId), 1);
  session.tileDeck.usedTileIds.push(tile.tileId);
  session.placedTiles.push(placedTile);
  session.updatedAt = Date.now();

  return { placedTile, createdCellIds };
}
