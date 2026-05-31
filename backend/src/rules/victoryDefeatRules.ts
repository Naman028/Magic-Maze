import { GameSession, GameStatus } from "../game/gameTypes.js";
import { createDefeatResult, createVictoryResult } from "../game/resultFactory.js";
import { CommunicationMode } from "../game/gameTypes.js";
import { setCommunicationMode } from "./communicationState.js";
import { evaluateVictoryAchievements } from "./achievementRules.js";
import { completeObjective } from "./objectiveRules.js";
import { addEffect } from "./effectRules.js";

export function applyVictoryIfComplete(session: GameSession): boolean {
  if (session.heroes.every((hero) => hero.hasEscaped)) {
    session.status = GameStatus.Victory;
    session.sandTimer.isRunning = false;
    setCommunicationMode(session, CommunicationMode.Open, false, "PostGame", false);
    completeObjective(session, "ReachExit");
    evaluateVictoryAchievements(session);
    addEffect(session, { effectType: "Victory", soundKey: "victory" });
    addEffect(session, { effectType: "GameEnded", soundKey: "game-ended" });
    session.result = createVictoryResult(session);
    return true;
  }
  return false;
}

export function applyDefeat(session: GameSession, reason: string): void {
  if (session.status === GameStatus.Victory) {
    return;
  }
  session.status = GameStatus.Defeat;
  session.sandTimer.isRunning = false;
  setCommunicationMode(session, CommunicationMode.Open, false, "PostGame", false);
  addEffect(session, { effectType: "Defeat", soundKey: "defeat" });
  addEffect(session, { effectType: "GameEnded", soundKey: "game-ended" });
  session.result = createDefeatResult(session, reason);
  session.updatedAt = Date.now();
}
