export class TimerRegistry {
  private readonly timers = new Map<string, NodeJS.Timeout>();

  set(roomCode: string, timer: NodeJS.Timeout): void {
    this.clear(roomCode);
    this.timers.set(roomCode, timer);
  }

  clear(roomCode: string): void {
    const existing = this.timers.get(roomCode);
    if (existing) {
      clearInterval(existing);
      this.timers.delete(roomCode);
    }
  }

  clearAll(): void {
    for (const roomCode of this.timers.keys()) {
      this.clear(roomCode);
    }
  }
}

