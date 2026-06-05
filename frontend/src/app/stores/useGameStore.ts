import { create } from "zustand";
import { CommunicationState, GameSession, LegalMoveTarget, RoomPayload, SandTimer } from "@/domain/game.types";

export interface PendingTilePlacement {
  heroId: string;
  explorationCellId: string;
  boardX: number;
  boardY: number;
  rotation: 0 | 90 | 180 | 270;
}

export interface LogEntry {
  timestamp: string;
  type: string;
  message: string;
}

interface GameState {
  roomCode?: string;
  playerId?: string;
  reconnectToken?: string;
  nickname?: string;
  session?: GameSession;
  selectedHeroId?: string;
  pendingMoveDirection?: string;
  vortexMode: boolean;
  draggingHeroId?: string;
  legalMoveTargets: LegalMoveTarget[];
  pendingTilePlacement?: PendingTilePlacement;
  log: LogEntry[];
  setIdentity: (payload: { roomCode: string; playerId: string; reconnectToken?: string; nickname?: string }) => void;
  setSession: (session: GameSession) => void;
  clearSession: (options?: { clearNickname?: boolean }) => void;
  hydrateRoomPayload: (payload: RoomPayload, nickname?: string) => void;
  setSelectedHeroId: (heroId?: string) => void;
  setPendingMoveDirection: (direction?: string) => void;
  setVortexMode: (enabled: boolean) => void;
  setDraggingHeroId: (heroId?: string) => void;
  setLegalMoveTargets: (targets: LegalMoveTarget[]) => void;
  clearLegalMoveTargets: () => void;
  setPendingTilePlacement: (placement?: PendingTilePlacement) => void;
  updatePendingTilePlacement: (updates: Partial<PendingTilePlacement>) => void;
  addLog: (type: string, message: string) => void;
  updateCommunication: (communicationState: CommunicationState) => void;
  updateTimer: (sandTimer: SandTimer) => void;
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const useGameStore = create<GameState>((set, get) => ({
  log: [{ timestamp: now(), type: "system", message: "Welcome to Magic Maze Online." }],
  vortexMode: false,
  legalMoveTargets: [],
  setIdentity: ({ roomCode, playerId, reconnectToken, nickname }) => {
    localStorage.setItem("magicMaze.roomCode", roomCode);
    localStorage.setItem("magicMaze.playerId", playerId);
    if (reconnectToken) localStorage.setItem("magicMaze.reconnectToken", reconnectToken);
    if (nickname) localStorage.setItem("magicMaze.nickname", nickname);
    set({ roomCode, playerId, reconnectToken, nickname });
  },
  setSession: (session) =>
    set((state) => {
      const oldHero = state.selectedHeroId ? state.session?.heroes.find((hero) => hero.heroId === state.selectedHeroId) : undefined;
      const newHero = state.selectedHeroId ? session.heroes.find((hero) => hero.heroId === state.selectedHeroId) : undefined;
      const shouldClearTargets = oldHero?.positionCellId !== newHero?.positionCellId || state.session?.status !== session.status;
      return { session, roomCode: session.roomCode, pendingTilePlacement: undefined, legalMoveTargets: shouldClearTargets ? [] : state.legalMoveTargets };
    }),
  clearSession: (options) => {
    localStorage.removeItem("magicMaze.roomCode");
    localStorage.removeItem("magicMaze.playerId");
    localStorage.removeItem("magicMaze.reconnectToken");
    if (options?.clearNickname) localStorage.removeItem("magicMaze.nickname");
    set({ roomCode: undefined, playerId: undefined, reconnectToken: undefined, session: undefined, selectedHeroId: undefined, pendingMoveDirection: undefined, pendingTilePlacement: undefined, vortexMode: false, draggingHeroId: undefined, legalMoveTargets: [] });
  },
  hydrateRoomPayload: (payload, nickname) => {
    get().setIdentity({ roomCode: payload.roomCode, playerId: payload.playerId, reconnectToken: payload.reconnectToken, nickname });
    set({ session: payload.session });
  },
  setSelectedHeroId: (selectedHeroId) => set({ selectedHeroId, legalMoveTargets: [] }),
  setPendingMoveDirection: (pendingMoveDirection) => set({ pendingMoveDirection, vortexMode: false }),
  setVortexMode: (vortexMode) => set({ vortexMode, pendingMoveDirection: undefined }),
  setDraggingHeroId: (draggingHeroId) => set({ draggingHeroId }),
  setLegalMoveTargets: (legalMoveTargets) => set({ legalMoveTargets }),
  clearLegalMoveTargets: () => set({ legalMoveTargets: [] }),
  setPendingTilePlacement: (pendingTilePlacement) => set({ pendingTilePlacement, pendingMoveDirection: undefined, vortexMode: false }),
  updatePendingTilePlacement: (updates) =>
    set((state) => ({
      pendingTilePlacement: state.pendingTilePlacement ? { ...state.pendingTilePlacement, ...updates } : undefined,
    })),
  addLog: (type, message) => set((state) => ({ log: [{ timestamp: now(), type, message }, ...state.log].slice(0, 80) })),
  updateCommunication: (communicationState) =>
    set((state) => ({
      session: state.session ? { ...state.session, communicationState } : state.session,
    })),
  updateTimer: (sandTimer) =>
    set((state) => {
      if (!state.session) return { session: state.session };
      const currentTimer = state.session.sandTimer;
      if (sandTimer.usedSandTimerCellIds.length < currentTimer.usedSandTimerCellIds.length) {
        return { session: state.session };
      }
      return { session: { ...state.session, sandTimer } };
    }),
}));

export function restoreStoredIdentity() {
  const roomCode = localStorage.getItem("magicMaze.roomCode") ?? undefined;
  const playerId = localStorage.getItem("magicMaze.playerId") ?? undefined;
  const reconnectToken = localStorage.getItem("magicMaze.reconnectToken") ?? undefined;
  const nickname = localStorage.getItem("magicMaze.nickname") ?? undefined;
  if (roomCode && playerId && reconnectToken) {
    useGameStore.getState().setIdentity({ roomCode, playerId, reconnectToken, nickname });
  }
  return { roomCode, playerId, reconnectToken, nickname };
}
