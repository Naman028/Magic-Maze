import { GameSession, Room } from "../game/gameTypes.js";

export interface RoomCreatedPayload {
  roomCode: string;
  playerId: string;
  reconnectToken: string;
  session: GameSession;
}

export interface RoomJoinedPayload {
  roomCode: string;
  playerId: string;
  reconnectToken: string;
  session: GameSession;
}

export function roomPayloadForPlayer(room: Room, playerId: string): RoomCreatedPayload {
  const player = room.session.players.find((candidate) => candidate.playerId === playerId);
  if (!player) {
    throw new Error("Player does not belong to this room.");
  }
  return {
    roomCode: room.roomCode,
    playerId,
    reconnectToken: player.reconnectToken,
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

