import { CellType, GameSession } from "../game/gameTypes.js";

export function applyEscapeIfOnExit(session: GameSession, heroId: string): boolean {
  const hero = session.heroes.find((candidate) => candidate.heroId === heroId);
  if (!hero?.positionCellId || !hero.hasItem) {
    return false;
  }
  const cell = session.board.cells[hero.positionCellId];
  if (cell?.type !== CellType.Exit) {
    return false;
  }
  if (session.scenario.matchingExitsRequired) {
    if (cell.exitForHeroType !== hero.heroType) return false;
  } else if (!cell.exitForHeroType || !session.scenario.allowedExitHeroTypes?.includes(cell.exitForHeroType)) {
    return false;
  }
  delete cell.occupiedByHeroId;
  hero.positionCellId = null;
  hero.hasEscaped = true;
  return true;
}
