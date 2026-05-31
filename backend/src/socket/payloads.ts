import { GameSession, Room } from "../game/gameTypes.js";

export interface RoomCreatedPayload {
  roomCode: string;
  playerId: string;
  session: GameSession;
}

export interface RoomJoinedPayload {
  roomCode: string;
  playerId: string;
  session: GameSession;
}

export function roomPayloadForPlayer(room: Room, playerId: string): RoomCreatedPayload {
  if (!room.session.players.some((player) => player.playerId === playerId)) {
    throw new Error("Player does not belong to this room.");
  }
  return {
    roomCode: room.roomCode,
    playerId,
    session: room.session,
  };
}

export function findPlayerIdBySocket(room: Room, socketId: string): string {
  const player = [...room.session.players].reverse().find((candidate) => candidate.socketId === socketId);
  if (!player) {
    throw new Error("Socket is not attached to a player in this room.");
  }
  return player.playerId;
}

