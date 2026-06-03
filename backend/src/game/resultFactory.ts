import { GameResult, GameSession, GameStatus } from "./gameTypes.js";

function baseResult(session: GameSession, status: GameStatus.Victory | GameStatus.Defeat, reason: string): GameResult {
  return {
    status,
    outcome: status === GameStatus.Victory ? "Won" : "Lost",
    reason,
    timeRemaining: session.sandTimer.remainingSeconds,
    heroesEscaped: session.heroes.filter((hero) => hero.hasEscaped).length,
    itemsCollected: session.heroes.filter((hero) => hero.hasItem).length,
    tilesPlaced: Math.max(0, session.placedTiles.length - 1),
    timerSpacesUsed: session.sandTimer.usedSandTimerCellIds.length,
    guardsAvoided: session.challengeState.guards.length - session.challengeState.caughtHeroIds.length,
    achievementsUnlocked: [...session.achievements],
    scenarioId: session.scenario.scenarioId,
    difficulty: session.difficultySettings.difficulty,
    completedAt: Date.now(),
  };
}

export function createVictoryResult(session: GameSession, reason = "All heroes escaped."): GameResult {
  return baseResult(session, GameStatus.Victory, reason);
}

export function createDefeatResult(session: GameSession, reason: string): GameResult {
  return baseResult(session, GameStatus.Defeat, reason);
}
