import { Room } from "../game/gameTypes.js";

export class RoomStore {
  private readonly rooms = new Map<string, Room>();

  get(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode.toUpperCase());
  }

  set(room: Room): void {
    this.rooms.set(room.roomCode, room);
  }

  has(roomCode: string): boolean {
    return this.rooms.has(roomCode.toUpperCase());
  }

  delete(roomCode: string): boolean {
    return this.rooms.delete(roomCode.toUpperCase());
  }

  clear(): void {
    this.rooms.clear();
  }

  all(): Room[] {
    return [...this.rooms.values()];
  }
}
