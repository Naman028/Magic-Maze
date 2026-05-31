import { RoomService } from "../rooms/roomService.js";

export class GameSessionManager {
  constructor(private readonly roomService: RoomService) {}

  start(roomCode: string, playerId: string) {
    return this.roomService.startGame(roomCode, playerId);
  }
}

