import { describe, expect, it } from "vitest";
import { RoomService } from "../rooms/roomService.js";
import { RoomStore } from "../rooms/roomStore.js";
import { ClientEvent } from "../socket/clientEvents.js";
import { registerSocketHandlers } from "../socket/handlers.js";
import { ServerEvent } from "../socket/serverEvents.js";

class FakeSocket {
  id = "socket-new";
  handlers = new Map<string, (payload?: unknown) => void>();
  joinedRooms: string[] = [];
  emitted: Array<{ event: string; payload: unknown }> = [];

  on(event: string, handler: (payload?: unknown) => void) {
    this.handlers.set(event, handler);
  }

  join(roomCode: string) {
    this.joinedRooms.push(roomCode);
  }

  emit(event: string, payload: unknown) {
    this.emitted.push({ event, payload });
  }
}

class FakeIoRoom {
  emitted: Array<{ event: string; payload: unknown }> = [];

  emit(event: string, payload: unknown) {
    this.emitted.push({ event, payload });
  }
}

class FakeIo {
  rooms = new Map<string, FakeIoRoom>();

  to(roomCode: string) {
    let room = this.rooms.get(roomCode);
    if (!room) {
      room = new FakeIoRoom();
      this.rooms.set(roomCode, room);
    }
    return room;
  }
}

describe("socket handlers", () => {
  it("joins the Socket.IO room after sync reconnect", () => {
    const store = new RoomStore();
    const service = new RoomService(store);
    const room = service.createRoom({ nickname: "Host", socketId: "socket-old" });
    const player = room.session.players[0];
    service.disconnectSocket("socket-old");
    const socket = new FakeSocket();
    const io = new FakeIo();

    registerSocketHandlers(io as never, socket as never, service, {} as never);
    socket.handlers.get(ClientEvent.SyncRequest)?.({ roomCode: room.roomCode, playerId: player.playerId, reconnectToken: player.reconnectToken });

    expect(socket.joinedRooms).toContain(room.roomCode);
    expect(socket.emitted.some((message) => message.event === ServerEvent.SyncState)).toBe(true);
    expect(io.rooms.get(room.roomCode)?.emitted.some((message) => message.event === ServerEvent.StateUpdated)).toBe(true);
  });
});


