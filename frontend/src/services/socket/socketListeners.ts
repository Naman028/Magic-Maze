import { RoomPayload, GameEffectPayload, GameSession, LegalMovesPayload, SandTimer, CommunicationState } from "@/domain/game.types";
import { useConnectionStore } from "@/app/stores/useConnectionStore";
import { restoreStoredIdentity, useGameStore } from "@/app/stores/useGameStore";
import { useUiStore } from "@/app/stores/useUiStore";
import { socket } from "./socketClient";
import { ServerEvent } from "./socketEvents";

let registered = false;

export function registerSocketListeners() {
  if (registered) return;
  registered = true;

  const game = useGameStore.getState();
  const handleRoomMissing = (message: string) => {
    if (!message.toLowerCase().includes("room does not exist")) return false;
    useGameStore.getState().clearSession();
    useGameStore.getState().addLog("room", "Room no longer exists. Returned to landing.");
    window.history.pushState(null, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
    return true;
  };
  const stored = restoreStoredIdentity();
  if (stored.roomCode && stored.playerId && stored.reconnectToken) {
    socket.emit("sync:request", { roomCode: stored.roomCode, playerId: stored.playerId, reconnectToken: stored.reconnectToken });
  }

  socket.on("connect", () => {
    useConnectionStore.getState().setConnected(true);
    const { roomCode, playerId, reconnectToken } = useGameStore.getState();
    if (roomCode && playerId && reconnectToken) socket.emit("sync:request", { roomCode, playerId, reconnectToken });
  });
  socket.on("disconnect", () => useConnectionStore.getState().setConnected(false));

  socket.on(ServerEvent.RoomCreated, (payload: RoomPayload) => {
    useUiStore.getState().setLastError(undefined);
    useGameStore.getState().hydrateRoomPayload(payload);
    useGameStore.getState().addLog("room", `Room ${payload.roomCode} created.`);
    window.history.pushState(null, "", `/lobby/${payload.roomCode}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  socket.on(ServerEvent.RoomJoined, (payload: RoomPayload) => {
    useUiStore.getState().setLastError(undefined);
    useGameStore.getState().hydrateRoomPayload(payload);
    useGameStore.getState().addLog("room", `Joined room ${payload.roomCode}.`);
    window.history.pushState(null, "", `/lobby/${payload.roomCode}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  socket.on(ServerEvent.SyncState, (session: GameSession) => {
    useUiStore.getState().setLastError(undefined);
    useGameStore.getState().setSession(session);
  });
  socket.on(ServerEvent.StateUpdated, (session: GameSession) => {
    useUiStore.getState().setLastError(undefined);
    useGameStore.getState().setSession(session);
  });
  socket.on(ServerEvent.GameStarted, (session: GameSession) => {
    useGameStore.getState().setSession(session);
    useGameStore.getState().addLog("game", "The game has started. Good luck.");
    window.history.pushState(null, "", `/game/${session.roomCode}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  socket.on(ServerEvent.HeroLegalMoves, (payload: LegalMovesPayload) => {
    if (payload.heroId === useGameStore.getState().selectedHeroId) {
      useGameStore.getState().setLegalMoveTargets(payload.targets);
    }
  });
  socket.on(ServerEvent.CommunicationUpdated, (communication: CommunicationState) => {
    useGameStore.getState().updateCommunication(communication);
    useGameStore.getState().addLog("voice", communication.voiceAllowed ? "Voice is ON. You can talk." : "Voice is OFF. Good luck.");
  });
  socket.on(ServerEvent.TimerUpdated, (payload: { roomCode: string; sandTimer: SandTimer }) => useGameStore.getState().updateTimer(payload.sandTimer));
  socket.on(ServerEvent.GameEffect, (effect: GameEffectPayload) => {
    game.addLog("effect", effect.effectType.replace(/([A-Z])/g, " $1").trim());
  });
  socket.on(ServerEvent.TilePlaced, () => game.addLog("tile", "A new mall tile was placed."));
  socket.on(ServerEvent.DiscussionStarted, () => game.addLog("voice", "Discussion started."));
  socket.on(ServerEvent.DiscussionEnded, () => game.addLog("voice", "Discussion ended."));
  socket.on(ServerEvent.SignalReceived, (signal: { signalType?: string; fromPlayerId?: string }) => game.addLog("signal", `${signal.fromPlayerId ?? "A player"} sent ${signal.signalType ?? "a signal"}.`));
  socket.on(ServerEvent.ObjectivesUpdated, () => game.addLog("objective", "Objectives updated."));
  socket.on(ServerEvent.AchievementsUnlocked, () => game.addLog("achievement", "Achievement progress updated."));
  socket.on(ServerEvent.ActionCardsRotated, () => game.addLog("cards", "Action cards passed to the left."));
  socket.on(ServerEvent.GuardMoved, () => game.addLog("guard", "A guard moved."));
  socket.on(ServerEvent.HeroCaught, () => game.addLog("guard", "A hero was caught."));
  socket.on(ServerEvent.AlarmTriggered, () => game.addLog("alarm", "Theft triggered. Escape phase active."));
  socket.on(ServerEvent.GameVictory, () => game.addLog("result", "Victory."));
  socket.on(ServerEvent.GameDefeat, () => game.addLog("result", "Defeat."));
  socket.on(ServerEvent.RoomReset, (session: GameSession) => {
    useGameStore.getState().setSession(session);
    game.addLog("room", "Room reset to lobby.");
    window.history.pushState(null, "", `/lobby/${session.roomCode}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  socket.on(ServerEvent.ActionRejected, (payload: { message: string }) => {
    if (handleRoomMissing(payload.message)) return;
    useUiStore.getState().setLastError(payload.message);
    game.addLog("rejected", payload.message);
  });
  socket.on(ServerEvent.ActionAccepted, (payload: { event: string }) => game.addLog("accepted", payload.event));
  socket.on(ServerEvent.ServerError, (payload: { message: string }) => {
    if (handleRoomMissing(payload.message)) return;
    useUiStore.getState().setLastError(payload.message);
  });
}
