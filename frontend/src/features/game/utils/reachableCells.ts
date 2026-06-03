import { Direction, GameSession } from "@/domain/game.types";
import { getAvailableDirectionsForPlayer, getReachableCellsInDirection } from "./boardRules";

export interface ReachableTarget {
  cellId: string;
  direction: Direction;
  distance: number;
}

export function getReachableTargets(session: GameSession, heroId: string, playerId?: string): ReachableTarget[] {
  return getAvailableDirectionsForPlayer(session, playerId).flatMap((direction) =>
    getReachableCellsInDirection(session, heroId, direction).map((cell, index) => ({
      cellId: cell.cellId,
      direction,
      distance: index + 1,
    })),
  );
}

export function getDirectionBetweenCells(session: GameSession, heroId: string, targetCellId: string, playerId?: string) {
  return getReachableTargets(session, heroId, playerId).find((target) => target.cellId === targetCellId)?.direction;
}
