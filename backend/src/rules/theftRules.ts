import { CommunicationMode, GameSession, GameStatus } from "../game/gameTypes.js";
import { setCommunicationMode } from "./communicationState.js";
import { completeObjective } from "./objectiveRules.js";
import { addEffect } from "./effectRules.js";

export function allHeroesOnMatchingItems(session: GameSession): boolean {
  return session.heroes.every((hero) => {
    if (!hero.positionCellId) {
      return false;
    }
    const cell = session.board.cells[hero.positionCellId];
    return cell?.itemForHeroType === hero.heroType;
  });
}

export function applyTheftIfTriggered(session: GameSession): boolean {
  if (session.status !== GameStatus.InProgress || !allHeroesOnMatchingItems(session)) {
    return false;
  }
  session.status = GameStatus.Escape;
  session.heroes.forEach((hero) => {
    hero.hasItem = true;
    hero.isOnItemSpace = true;
  });
  session.sandTimer.isFinalCountdown = true;
  session.sandTimer.canBeFlipped = false;
  setCommunicationMode(session, CommunicationMode.SilentOnly, false);
  completeObjective(session, "CollectItems");
  addEffect(session, { effectType: "TheftTriggered", soundKey: "alarm" });
  return true;
}

export function assertVortexAllowed(session: GameSession): void {
  if (session.status === GameStatus.Escape || session.heroes.some((hero) => hero.hasItem)) {
    throw new Error("Vortex is disabled after theft.");
  }
}
