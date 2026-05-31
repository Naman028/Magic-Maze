import { Direction, DifficultyLevel } from "@/domain/game.types";
import { useGameStore } from "@/app/stores/useGameStore";
import { useUiStore } from "@/app/stores/useUiStore";
import { socket } from "./socketClient";
import { ClientEvent } from "./socketEvents";

function identity() {
  const { roomCode, playerId } = useGameStore.getState();
  if (!roomCode || !playerId) {
    useUiStore.getState().setLastError("Reconnect required. Please return to lobby.");
    return undefined;
  }
  return { roomCode, playerId };
}

function emitWithIdentity(event: string, payload: Record<string, unknown> = {}) {
  const base = identity();
  if (!base) return;
  socket.emit(event, { ...base, ...payload });
}

export const emitters = {
  createRoom: (nickname: string) => socket.emit(ClientEvent.RoomCreate, { nickname }),
  joinRoom: (roomCode: string, nickname: string) => socket.emit(ClientEvent.RoomJoin, { roomCode: roomCode.toUpperCase(), nickname }),
  ready: (isReady: boolean) => emitWithIdentity(ClientEvent.PlayerReady, { isReady }),
  selectScenario: (scenarioId: string) => emitWithIdentity(ClientEvent.ScenarioSelect, { scenarioId }),
  selectDifficulty: (difficulty: DifficultyLevel) => emitWithIdentity(ClientEvent.DifficultySelect, { difficulty }),
  startGame: () => emitWithIdentity(ClientEvent.GameStart),
  nextSoloAction: (targetAction?: string) => emitWithIdentity(ClientEvent.SoloNextAction, targetAction ? { targetAction } : {}),
  moveHero: (heroId: string, direction: Direction) => emitWithIdentity(ClientEvent.HeroMove, { heroId, direction }),
  moveHeroTo: (heroId: string, direction: Direction, targetCellId: string) => emitWithIdentity(ClientEvent.HeroMoveTo, { heroId, direction, targetCellId }),
  legalMoves: (heroId: string) => emitWithIdentity(ClientEvent.HeroLegalMoves, { heroId }),
  useVortex: (heroId: string, targetCellId: string) => emitWithIdentity(ClientEvent.UseVortex, { heroId, targetCellId }),
  takeEscalator: (heroId: string, targetCellId?: string) => emitWithIdentity(ClientEvent.TakeEscalator, { heroId, ...(targetCellId ? { targetCellId } : {}) }),
  activateSandTimer: (heroId: string, cellId: string) => emitWithIdentity(ClientEvent.SandTimerActivate, { heroId, cellId }),
  placeTile: (heroId: string, explorationCellId: string, boardX: number, boardY: number, tileId?: string, rotation: 0 | 90 | 180 | 270 = 0) =>
    emitWithIdentity(ClientEvent.ExplorePlaceTile, { heroId, explorationCellId, boardX, boardY, tileId, rotation }),
  signal: (signalType: "Attention" | "Approve" | "Reject" | "Hurry", heroId?: string) => emitWithIdentity(ClientEvent.SignalSend, { signalType, heroId }),
  playAgain: () => emitWithIdentity(ClientEvent.GamePlayAgain, { keepScenario: true, keepDifficulty: true }),
  returnToLobby: () => emitWithIdentity(ClientEvent.GameReturnToLobby),
  sync: (roomCode: string, playerId: string) => socket.emit(ClientEvent.SyncRequest, { roomCode, playerId }),
  disableCamera: (heroId: string, cameraCellId: string) => emitWithIdentity(ClientEvent.DisableCamera, { heroId, cameraCellId }),
  mageCrystalExplore: (heroId: string, placements: Array<{ explorationCellId: string; boardX: number; boardY: number; rotation: 0 | 90 | 180 | 270 }>) =>
    emitWithIdentity(ClientEvent.MageCrystalExplore, { heroId, placements }),
};
