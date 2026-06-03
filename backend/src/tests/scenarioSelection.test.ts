import { describe, expect, it } from "vitest";
import { createRoomService } from "./testHelpers.js";

describe("scenario selection", () => {
  it("host can select scenario while waiting and rebuilds the deck", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host" });
    service.selectScenario({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, scenarioId: "scenario2_several_exits" });
    expect(room.session.scenario.scenarioId).toBe("scenario2_several_exits");
    expect(room.session.tileDeck.remainingTileIds).toContain("tile12");
  });

  it("non-host cannot select scenario", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host" });
    service.joinRoom({ roomCode: room.roomCode, nickname: "Guest" });
    expect(() => service.selectScenario({ roomCode: room.roomCode, playerId: room.session.players[1].playerId, scenarioId: "scenario2_several_exits" })).toThrow("Only the host");
  });

  it("scenario cannot be selected after start", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host" });
    service.startGame(room.roomCode, room.session.players[0].playerId);
    expect(() => service.selectScenario({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, scenarioId: "scenario2_several_exits" })).toThrow("lobby or after game end");
  });

  it("scenario flags are stored on session", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host" });
    service.selectScenario({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, scenarioId: "scenario4_dwarf_elf" });
    expect(room.session.scenario.ruleFlags.dwarfCanPassOrangeWalls).toBe(true);
    expect(room.session.scenario.ruleFlags.elfExploreStartsDiscussion).toBe(true);
  });
});


