import { GameStatus, Room } from "../game/gameTypes.js";

export function assertWaiting(room: Room): void {
  if (room.session.status !== GameStatus.Waiting) {
    throw new Error("Game must be waiting.");
  }
}

export function assertMovementPhase(room: Room): void {
  if (room.session.actionsLocked) {
    throw new Error("Actions are locked.");
  }
  if (![GameStatus.InProgress, GameStatus.Escape].includes(room.session.status)) {
    throw new Error("Heroes can only move during active play.");
  }
}

export function assertInProgress(room: Room): void {
  if (room.session.status !== GameStatus.InProgress) {
    throw new Error("Action is only allowed while the game is in progress.");
  }
}
