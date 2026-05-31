import { GameStatus, Room } from "../game/gameTypes.js";

export function assertNickname(nickname: string): void {
  if (nickname.trim().length === 0) {
    throw new Error("Player nickname cannot be empty.");
  }
}

export function assertRoomCanBeJoined(room: Room | undefined): asserts room is Room {
  if (!room) {
    throw new Error("Room does not exist.");
  }
  if (room.session.status !== GameStatus.Waiting) {
    throw new Error("Cannot join after the game has started.");
  }
}

export function assertPlayerBelongsToRoom(room: Room, playerId: string): void {
  if (!room.session.players.some((player) => player.playerId === playerId)) {
    throw new Error("Player does not belong to this room.");
  }
}

export function assertSocketOwnsPlayer(room: Room, playerId: string, socketId: string): void {
  const player = room.session.players.find((candidate) => candidate.playerId === playerId);
  if (!player) {
    throw new Error("Player does not belong to this room.");
  }
  if (player.socketId !== socketId) {
    throw new Error("Socket is not allowed to act as this player.");
  }
}
