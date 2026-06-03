import { ActionType, Direction, GameSession, Hero, HeroType, LegalMoveTarget, MazeCell, Player } from "../game/gameTypes.js";
import { oppositeDirection } from "../data/starterBoard.js";
import { assertCellHasNoGuard } from "./guardRules.js";
import { assertTargetIsLegalMove, getLegalMoveTargetsFromGrid } from "./gridMovementEngine.js";

export function assertHeroCanMove(hero: Hero): void {
  if (hero.hasEscaped) {
    throw new Error("Hero has already escaped.");
  }
  if (!hero.positionCellId) {
    throw new Error("Hero is not on the board.");
  }
}

export function getCurrentAndTargetCells(session: GameSession, hero: Hero, direction: Direction): { currentCell: MazeCell; targetCell: MazeCell } {
  assertHeroCanMove(hero);
  const positionCellId = hero.positionCellId;
  if (!positionCellId) {
    throw new Error("Hero is not on the board.");
  }
  const currentCell = session.board.cells[positionCellId];
  if (!currentCell) {
    throw new Error("Current cell does not exist.");
  }
  const targetCellId = currentCell.neighborCellIds[direction];
  if (!targetCellId) {
    throw new Error("Target cell does not exist.");
  }
  const targetCell = session.board.cells[targetCellId];
  if (!targetCell) {
    throw new Error("Target cell does not exist.");
  }
  assertCellHasNoGuard(session, targetCell.cellId);
  return { currentCell, targetCell };
}

export function assertMovementDoesNotCrossWall(currentCell: MazeCell, targetCell: MazeCell, direction: Direction): void {
  if (currentCell.walls.includes(direction) || targetCell.walls.includes(oppositeDirection(direction))) {
    throw new Error("Movement through a wall is not allowed.");
  }
}

export function assertMovementAllowedForHero(session: GameSession, hero: Hero, currentCell: MazeCell, targetCell: MazeCell, direction: Direction): void {
  const crossesOrangeWall = currentCell.orangeWallDirections?.includes(direction) || targetCell.orangeWallDirections?.includes(oppositeDirection(direction));
  if (crossesOrangeWall) {
    if (!session.scenario.ruleFlags.dwarfCanPassOrangeWalls || hero.heroType !== HeroType.Dwarf) {
      throw new Error("Only the Dwarf can pass orange walls in this scenario.");
    }
    return;
  }
  assertMovementDoesNotCrossWall(currentCell, targetCell, direction);
}

export function assertTargetNotOccupied(targetCell: MazeCell): void {
  if (targetCell.occupiedByHeroId) {
    throw new Error("Target cell is occupied.");
  }
}

export function moveHero(hero: Hero, currentCell: MazeCell, targetCell: MazeCell): void {
  delete currentCell.occupiedByHeroId;
  targetCell.occupiedByHeroId = hero.heroId;
  hero.positionCellId = targetCell.cellId;
  hero.isOnItemSpace = targetCell.itemForHeroType === hero.heroType;
}

export function getReachableTargetCell(session: GameSession, player: Player, hero: Hero, direction: Direction, targetCellId: string): { currentCell: MazeCell; targetCell: MazeCell } {
  return assertTargetIsLegalMove(session, player, hero, direction, targetCellId);
}

export function movementDirectionsForPlayer(player: Player): Direction[] {
  const actions = player.assignedActionCard?.actions ?? [];
  const pairs: Array<[ActionType, Direction]> = [
    [ActionType.MoveNorth, Direction.North],
    [ActionType.MoveSouth, Direction.South],
    [ActionType.MoveEast, Direction.East],
    [ActionType.MoveWest, Direction.West],
  ];
  return pairs.filter(([action]) => actions.includes(action)).map(([, direction]) => direction);
}

export function getLegalMoveTargets(session: GameSession, player: Player, hero: Hero): LegalMoveTarget[] {
  return getLegalMoveTargetsFromGrid(session, player, hero);
}
