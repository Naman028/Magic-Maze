import { ActionType, Direction, GameSession, MazeCell } from "@/domain/game.types";

export function getCellById(session: GameSession, cellId?: string | null) {
  return cellId ? session.board.cells[cellId] : undefined;
}

export function getEscalatorGroupId(cell?: MazeCell) {
  if (!cell) return undefined;
  const visualGroupId = visualEscalatorGroupId(cell.tileId, cell.cellId);
  if (visualGroupId) return visualGroupId;
  if (cell.tileId in visualEscalatorEndpoints) return undefined;
  if (cell.escalatorGroupId) return cell.escalatorGroupId;

  // Rooms created before the starter tile metadata fix can still be missing
  // this field. The starter escalator endpoints are fixed by tile/cell id.
  if (cell.tileId === "tile1A" && (cell.cellId === "tile1A-3-2" || cell.cellId === "tile1A-2-3")) {
    return "tile1A-escalator-a";
  }

  return undefined;
}

const visualEscalatorEndpoints: Record<string, string[][]> = {
  tile1A: [["tile1A-3-2", "tile1A-2-3"]],
  tile2: [["tile2-0-1", "tile2-1-2"]],
  tile7: [["tile7-2-1", "tile7-1-3"]],
  tile10: [["tile10-1-2", "tile10-2-1"]],
  tile12: [
    ["tile12-1-0", "tile12-2-1"],
    ["tile12-0-2", "tile12-1-3"],
  ],
  tile14: [["tile14-0-1", "tile14-2-2"]],
  tile15: [["tile15-0-1", "tile15-2-1"]],
  tile20: [["tile20-1-2", "tile20-2-1"]],
};

function visualEscalatorGroupId(tileId: string, cellId: string) {
  const cellIdParts = cellId.split(":");
  const localCellId = cellIdParts[cellIdParts.length - 1] ?? cellId;
  const pairIndex = (visualEscalatorEndpoints[tileId] ?? []).findIndex((pair) => pair.includes(localCellId));
  return pairIndex >= 0 ? `${tileId}-visual-escalator-${pairIndex + 1}` : undefined;
}

export function getHeroCell(session: GameSession, heroId: string) {
  return getCellById(session, session.heroes.find((hero) => hero.heroId === heroId)?.positionCellId);
}

export function hasWallInDirection(cell: MazeCell, direction: Direction) {
  return cell.walls.includes(direction);
}

export function isCellOccupied(session: GameSession, cellId: string) {
  return session.heroes.some((hero) => !hero.hasEscaped && hero.positionCellId === cellId);
}

export function isGuardCell(session: GameSession, cellId: string) {
  return (session.challengeState?.guards ?? []).some((guard) => guard.isActive && guard.currentCellId === cellId);
}

export function getAvailableDirectionsForPlayer(session: GameSession, playerId?: string): Direction[] {
  const actions = session.players.find((player) => player.playerId === playerId)?.assignedActionCard?.actions ?? [];
  const pairs: Array<[ActionType, Direction]> = [
    ["MoveNorth", "North"],
    ["MoveSouth", "South"],
    ["MoveEast", "East"],
    ["MoveWest", "West"],
  ];
  return pairs.filter(([action]) => actions.includes(action)).map(([, direction]) => direction);
}

export function getReachableCellsInDirection(session: GameSession, heroId: string, direction: Direction) {
  const reachable: MazeCell[] = [];
  let current = getHeroCell(session, heroId);
  while (current && !hasWallInDirection(current, direction)) {
    const nextId = current.neighborCellIds[direction];
    const next = getCellById(session, nextId);
    if (!next || hasOppositeWall(next, direction) || isCellOccupied(session, next.cellId) || isGuardCell(session, next.cellId)) break;
    reachable.push(next);
    current = next;
  }
  return reachable;
}

export function actionForDirection(direction: Direction): ActionType {
  return `Move${direction}` as ActionType;
}

function hasOppositeWall(cell: MazeCell, direction: Direction) {
  const opposite: Record<Direction, Direction> = { North: "South", South: "North", East: "West", West: "East" };
  return hasWallInDirection(cell, opposite[direction]);
}
