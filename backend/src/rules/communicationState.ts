import { CommunicationMode, CommunicationReason, CommunicationState, GameSession } from "../game/gameTypes.js";

export function createCommunicationState(mode: CommunicationMode, actionsLocked = false, reason: CommunicationReason = "Lobby", autoCloseOnNextGameAction = false): CommunicationState {
  return {
    mode,
    chatAllowed: mode === CommunicationMode.Open || mode === CommunicationMode.DiscussionOpen,
    voiceAllowed: mode === CommunicationMode.Open || mode === CommunicationMode.DiscussionOpen,
    signalsAllowed: true,
    actionsLocked,
    reason,
    openedAt: mode === CommunicationMode.Open || mode === CommunicationMode.DiscussionOpen ? new Date().toISOString() : undefined,
    autoCloseOnNextGameAction,
    signals: [],
  };
}

export function setCommunicationMode(session: GameSession, mode: CommunicationMode, actionsLocked: boolean, reason: CommunicationReason = "SilentGameplay", autoCloseOnNextGameAction = false): void {
  session.actionsLocked = actionsLocked;
  session.communicationState.mode = mode;
  session.communicationState.chatAllowed = mode === CommunicationMode.Open || mode === CommunicationMode.DiscussionOpen;
  session.communicationState.voiceAllowed = mode === CommunicationMode.Open || mode === CommunicationMode.DiscussionOpen;
  session.communicationState.signalsAllowed = true;
  session.communicationState.actionsLocked = actionsLocked;
  session.communicationState.reason = reason;
  session.communicationState.openedAt = mode === CommunicationMode.Open || mode === CommunicationMode.DiscussionOpen ? new Date().toISOString() : undefined;
  session.communicationState.autoCloseOnNextGameAction = autoCloseOnNextGameAction;
}

export function openTemporaryCommunication(session: GameSession, reason: Extract<CommunicationReason, "SandTimer" | "Loudspeaker" | "ElfAbility">): void {
  if (session.scenario.communicationAlwaysOpen) {
    setCommunicationMode(session, CommunicationMode.Open, false, "ScenarioFreeCommunication", false);
    return;
  }
  setCommunicationMode(session, CommunicationMode.DiscussionOpen, false, reason, true);
}

export function closeTemporaryCommunicationIfNeeded(session: GameSession): boolean {
  if (!session.communicationState.autoCloseOnNextGameAction || session.scenario.communicationAlwaysOpen) return false;
  setCommunicationMode(session, CommunicationMode.SilentOnly, false, "SilentGameplay", false);
  return true;
}
