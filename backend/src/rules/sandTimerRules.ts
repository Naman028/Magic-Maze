import { CellType, GameSession, GameStatus } from "../game/gameTypes.js";
import { openTemporaryCommunication } from "./communicationState.js";
import { completeObjective } from "./objectiveRules.js";
import { addEffect } from "./effectRules.js";

export function assertCanActivateSandTimer(session: GameSession, heroId: string, cellId: string): void {
  if (session.status !== GameStatus.InProgress) {
    throw new Error("Sand timer can only be activated while in progress.");
  }
  if (session.sandTimer.isFinalCountdown) {
    throw new Error("Sand timer cannot be flipped during final countdown.");
  }
  const maxActiveCameras = session.scenario.ruleFlags.maxActiveCamerasBeforeTimerBlocked;
  if (maxActiveCameras !== undefined) {
    const activeCameras = Object.values(session.board.cells).filter((cell) => cell.type === CellType.SecurityCamera && !cell.cameraDisabled).length;
    if (activeCameras >= maxActiveCameras) throw new Error("Too many active security cameras block timer activation.");
  }
  if (!session.sandTimer.canBeFlipped) {
    throw new Error("Sand timer cannot be flipped.");
  }
  const cell = session.board.cells[cellId];
  if (!cell || cell.type !== CellType.SandTimer) {
    throw new Error("Cell is not a sand timer.");
  }
  if (session.sandTimer.usedSandTimerCellIds.includes(cellId)) {
    throw new Error("Sand timer cell was already used.");
  }
  if (cell.occupiedByHeroId !== heroId) {
    throw new Error("Hero must be standing on the sand timer cell.");
  }
}

export function activateSandTimer(session: GameSession, heroId: string, cellId: string): void {
  assertCanActivateSandTimer(session, heroId, cellId);
  const totalSeconds = session.difficultySettings.timeLimitSeconds;
  const elapsedSeconds = totalSeconds - session.sandTimer.remainingSeconds;
  session.sandTimer.usedSandTimerCellIds.push(cellId);
  session.sandTimer.remainingSeconds = Math.max(1, Math.min(totalSeconds, elapsedSeconds));
  openTemporaryCommunication(session, "SandTimer");
  completeObjective(session, "UseTimer");
  addEffect(session, { effectType: "TimerFlipped", heroId, cellId, soundKey: "timer-flip" });
  addEffect(session, { effectType: "CommunicationOpened", heroId, cellId, soundKey: "communication-open" });
  session.updatedAt = Date.now();
}

export function tryAutoActivateSandTimer(session: GameSession, heroId: string): boolean {
  const hero = session.heroes.find((candidate) => candidate.heroId === heroId);
  if (!hero?.positionCellId || session.status !== GameStatus.InProgress || session.sandTimer.isFinalCountdown || !session.sandTimer.canBeFlipped) return false;
  const cell = session.board.cells[hero.positionCellId];
  if (!cell || cell.type !== CellType.SandTimer || session.sandTimer.usedSandTimerCellIds.includes(cell.cellId)) return false;
  activateSandTimer(session, heroId, cell.cellId);
  return true;
}
