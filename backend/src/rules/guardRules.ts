import { CellType, GameSession, GameStatus, Guard } from "../game/gameTypes.js";
import { addEffect } from "./effectRules.js";
import { applyDefeat } from "./victoryDefeatRules.js";

export function createInitialGuards(session: GameSession): Guard[] {
  if (!session.scenario.ruleFlags.securityCamerasEnabled && session.difficultySettings.extraGuardCount === 0) return [];
  const count = 1 + session.difficultySettings.extraGuardCount;
  session.board.cells["guard-a"] ??= { cellId: "guard-a", tileId: "challenge", x: 30, y: 30, type: CellType.GuardArea, walls: [], neighborCellIds: { East: "guard-b" } };
  session.board.cells["guard-b"] ??= { cellId: "guard-b", tileId: "challenge", x: 31, y: 30, type: CellType.GuardArea, walls: [], neighborCellIds: { West: "guard-a" } };
  return Array.from({ length: count }, (_, index) => ({
    guardId: `guard-${index + 1}`,
    currentCellId: index % 2 === 0 ? "guard-a" : "guard-b",
    patrolCellIds: ["guard-a", "guard-b"],
    patrolIndex: index % 2,
    isActive: true,
  }));
}

export function assertCellHasNoGuard(session: GameSession, cellId: string): void {
  if (session.challengeState.guards.some((guard) => guard.isActive && guard.currentCellId === cellId)) {
    throw new Error("Target cell is occupied by a guard.");
  }
}

export function advanceGuards(session: GameSession): Guard[] {
  const moved: Guard[] = [];
  for (const guard of session.challengeState.guards.filter((candidate) => candidate.isActive)) {
    guard.patrolIndex = (guard.patrolIndex + 1) % guard.patrolCellIds.length;
    guard.currentCellId = guard.patrolCellIds[guard.patrolIndex];
    moved.push(guard);
    addEffect(session, { effectType: "GuardAlert", cellId: guard.currentCellId });
    const caughtHero = session.heroes.find((hero) => hero.positionCellId === guard.currentCellId && !hero.hasEscaped);
    if (caughtHero) {
      session.challengeState.caughtHeroIds.push(caughtHero.heroId);
      addEffect(session, { effectType: "HeroCaught", heroId: caughtHero.heroId, cellId: guard.currentCellId });
      applyDefeat(session, "A guard caught a hero.");
      break;
    }
  }
  if (session.status !== GameStatus.Defeat) session.updatedAt = Date.now();
  return moved;
}

