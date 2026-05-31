import { Room } from "../game/gameTypes.js";

export function assertHost(room: Room, playerId: string): void {
  const player = room.session.players.find((candidate) => candidate.playerId === playerId);
  if (!player?.isHost) {
    throw new Error("Only the host can perform this action.");
  }
}

