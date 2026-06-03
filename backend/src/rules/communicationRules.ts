import { CommunicationMode, GameSession, GameStatus, NonVerbalSignal } from "../game/gameTypes.js";
import { setCommunicationMode } from "./communicationState.js";

export function assertSignalAllowed(session: GameSession): void {
  if ([GameStatus.Victory, GameStatus.Defeat].includes(session.status)) {
    throw new Error("Cannot signal after game completion.");
  }
  if (!session.communicationState.signalsAllowed) {
    throw new Error("Signals are not allowed right now.");
  }
}

export function addSignal(session: GameSession, signal: NonVerbalSignal): void {
  assertSignalAllowed(session);
  session.communicationState.signals.push(signal);
}

export function endDiscussion(session: GameSession): void {
  if (session.status !== GameStatus.Discussion && session.communicationState.mode !== CommunicationMode.DiscussionOpen) {
    throw new Error("Discussion is not active.");
  }
  if (session.status === GameStatus.Discussion) session.status = GameStatus.InProgress;
  setCommunicationMode(session, CommunicationMode.SilentOnly, false, "SilentGameplay", false);
  session.updatedAt = Date.now();
}
