import { oppositeDirection } from "../data/starterBoard.js";
import { Direction, GameSession, Hero, HeroType, LegalMoveTarget, MazeCell, Player } from "../game/gameTypes.js";
import { assertCellHasNoGuard } from "./guardRules.js";
import { movementDirectionsForPlayer } from "./movementRules.js";

const DIRECTION_DELTAS: Record<Direction, { dx: number; dy: number }> = {
  [Direction.North]: { dx: 0, dy: -1 },
  [Direction.South]: { dx: 0, dy: 1 },
  [Direction.East]: { dx: 1, dy: 0 },
  [Direction.West]: { dx: -1, dy: 0 },
};

export function findCellAt(session: GameSession, x: number, y: number): MazeCell | undefined {
  return Object.values(session.board.cells).find((cell) => cell.x === x && cell.y === y);
}

export function isPhysicallyAdjacent(a: MazeCell, b: MazeCell): boolean {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return dx + dy === 1;
}

export function directionBetweenAdjacentCells(from: MazeCell, to: MazeCell): Direction | undefined {
  if (from.x === to.x && from.y - 1 === to.y) return Direction.North;
  if (from.x === to.x && from.y + 1 === to.y) return Direction.South;
  if (from.x + 1 === to.x && from.y === to.y) return Direction.East;
  if (from.x - 1 === to.x && from.y === to.y) return Direction.West;
  return undefined;
}

export function hasBlockingWall(session: GameSession, hero: Hero, from: MazeCell, to: MazeCell, direction: Direction): boolean {
  const opposite = oppositeDirection(direction);

  const normalWall = from.walls.includes(direction) || to.walls.includes(opposite);
  const orangeWall = from.orangeWallDirections?.includes(direction) || to.orangeWallDirections?.includes(opposite);

  if (orangeWall) {
    const dwarfCanPass = session.scenario.ruleFlags.dwarfCanPassOrangeWalls && hero.heroType === HeroType.Dwarf;
    return !dwarfCanPass;
  }

  return normalWall;
}

export function isCellOccupiedByAnotherHero(cell: MazeCell, hero: Hero): boolean {
  return Boolean(cell.occupiedByHeroId && cell.occupiedByHeroId !== hero.heroId);
}

export function canStepIntoCell(session: GameSession, hero: Hero, from: MazeCell, to: MazeCell, direction: Direction): boolean {
  if (!isPhysicallyAdjacent(from, to)) return false;

  const actualDirection = directionBetweenAdjacentCells(from, to);
  if (actualDirection !== direction) return false;

  if (hasBlockingWall(session, hero, from, to, direction)) return false;

  try {
    assertCellHasNoGuard(session, to.cellId);
  } catch {
    return false;
  }

  if (isCellOccupiedByAnotherHero(to, hero)) return false;

  return true;
}

export function getLegalMoveTargetsFromGrid(session: GameSession, player: Player, hero: Hero): LegalMoveTarget[] {
  if (hero.hasEscaped || !hero.positionCellId) {
    return [];
  }

  const startCell = session.board.cells[hero.positionCellId];
  if (!startCell) {
    return [];
  }

  const targets: LegalMoveTarget[] = [];

  for (const direction of movementDirectionsForPlayer(player)) {
    const delta = DIRECTION_DELTAS[direction];
    let cursor = startCell;
    let distance = 0;

    while (true) {
      const next = findCellAt(session, cursor.x + delta.dx, cursor.y + delta.dy);
      if (!next) break;

      if (!canStepIntoCell(session, hero, cursor, next, direction)) break;

      distance += 1;
      targets.push({
        cellId: next.cellId,
        direction,
        distance,
      });

      cursor = next;
    }
  }

  return targets;
}

export function assertTargetIsLegalMove(
  session: GameSession,
  player: Player,
  hero: Hero,
  direction: Direction,
  targetCellId: string,
): { currentCell: MazeCell; targetCell: MazeCell } {
  if (!hero.positionCellId) {
    throw new Error("Hero is not on the board.");
  }

  const currentCell = session.board.cells[hero.positionCellId];
  if (!currentCell) {
    throw new Error("Current cell does not exist.");
  }

  const legalTargets = getLegalMoveTargetsFromGrid(session, player, hero);
  const legalTarget = legalTargets.find((target) => target.cellId === targetCellId && target.direction === direction);

  if (!legalTarget) {
    throw new Error("Target cell is not a legal move for this player and hero.");
  }

  const targetCell = session.board.cells[targetCellId];
  if (!targetCell) {
    throw new Error("Target cell does not exist.");
  }

  return { currentCell, targetCell };
}
