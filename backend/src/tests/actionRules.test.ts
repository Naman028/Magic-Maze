import { describe, expect, it } from "vitest";
import { ActionType, Direction } from "../game/gameTypes.js";
import { createRoomService, createStartedRoom, givePlayerAction } from "./testHelpers.js";

describe("action rules", () => {
  it("rejects movement when player lacks the matching action card", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveSouth);

    expect(() =>
      service.moveHero({
        roomCode: room.roomCode,
        playerId: room.session.players[0].playerId,
        heroId: "hero-mage",
        direction: Direction.North,
      }),
    ).toThrow("required action");
  });

  it("assigns visible card actions to a solo player and cycles through the solo deck", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Solo" });

    service.startGame(room.roomCode, room.session.players[0].playerId);

    expect(room.session.players[0].assignedActionCard).toBeDefined();

    service.cycleSoloAction({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, targetAction: ActionType.UseVortex });
    expect(room.session.players[0].assignedActionCard?.actions).toContain(ActionType.UseVortex);

    service.cycleSoloAction({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, targetAction: ActionType.ExploreTile });
    expect(room.session.players[0].assignedActionCard?.actions).toContain(ActionType.ExploreTile);
  });

  it.each([2, 3, 4])("%i players together cover core MVP actions", (playerCount) => {
    const { room } = createStartedRoom(playerCount);
    const assigned = new Set(room.session.players.flatMap((player) => player.assignedActionCard?.actions ?? []));

    expect(assigned.has(ActionType.MoveNorth)).toBe(true);
    expect(assigned.has(ActionType.MoveSouth)).toBe(true);
    expect(assigned.has(ActionType.MoveEast)).toBe(true);
    expect(assigned.has(ActionType.MoveWest)).toBe(true);
    expect(assigned.has(ActionType.ExploreTile)).toBe(true);
  });
});


