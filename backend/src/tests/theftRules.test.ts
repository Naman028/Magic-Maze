import { describe, expect, it } from "vitest";
import { ActionType, Direction, GameStatus } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, setTheftReadyExceptMage } from "./testHelpers.js";

describe("theft rules", () => {
  it("automatically starts escape when all heroes stand on matching item cells", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);
    setTheftReadyExceptMage(room);

    const result = service.moveHero({
      roomCode: room.roomCode,
      playerId: room.session.players[0].playerId,
      heroId: "hero-mage",
      direction: Direction.North,
    });

    expect(result.theftTriggered).toBe(true);
    expect(room.session.status).toBe(GameStatus.Escape);
    expect(room.session.heroes.every((hero) => hero.hasItem)).toBe(true);
    expect(room.session.sandTimer.isFinalCountdown).toBe(true);
    expect(room.session.sandTimer.canBeFlipped).toBe(false);
  });
});


