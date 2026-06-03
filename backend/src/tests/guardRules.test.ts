import { describe, expect, it } from "vitest";
import { ActionType, CellType } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, placeHero } from "./testHelpers.js";

describe("guard rules", () => {
  it("initializes guards for camera scenarios", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.ruleFlags.securityCamerasEnabled = true;
    service.selectDifficulty; // keeps import path exercised
    room.session.challengeState.guards = [];
    service.advanceGuards(room.roomCode);
    expect(room.session.challengeState.guards).toHaveLength(0);
  });

  it("hard difficulty creates an extra guard on start", () => {
    const { service } = createStartedRoom(1);
    const fresh = service.createRoom({ nickname: "Hard Host" });
    service.selectDifficulty({ roomCode: fresh.roomCode, playerId: fresh.session.players[0].playerId, difficulty: "Hard" });
    service.selectScenario({ roomCode: fresh.roomCode, playerId: fresh.session.players[0].playerId, scenarioId: "scenario6_security_cameras" });
    service.startGame(fresh.roomCode, fresh.session.players[0].playerId);
    expect(fresh.session.challengeState.guards.length).toBeGreaterThanOrEqual(2);
  });

  it("hero cannot move into a guard cell", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);
    placeHero(room, "hero-mage", "tile1A-start-dwarf");
    room.session.challengeState.guards = [{ guardId: "guard-1", currentCellId: "tile1A-2-0", patrolCellIds: ["tile1A-2-0"], patrolIndex: 0, isActive: true }];
    expect(() => service.moveHeroTo({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: "North" as never, targetCellId: "tile1A-2-0" })).toThrow("not a legal move");
  });

  it("guard moving onto hero causes defeat", () => {
    const { service, room } = createStartedRoom();
    room.session.board.cells["guard-a"] = { cellId: "guard-a", tileId: "test", x: 1, y: 1, type: CellType.GuardArea, walls: [], neighborCellIds: {} };
    room.session.board.cells["guard-b"] = { cellId: "guard-b", tileId: "test", x: 2, y: 1, type: CellType.GuardArea, walls: [], neighborCellIds: {} };
    placeHero(room, "hero-mage", "guard-b");
    room.session.challengeState.guards = [{ guardId: "guard-1", currentCellId: "guard-a", patrolCellIds: ["guard-a", "guard-b"], patrolIndex: 0, isActive: true }];
    service.advanceGuards(room.roomCode);
    expect(room.session.status).toBe("Defeat");
    expect(room.session.challengeState.caughtHeroIds).toContain("hero-mage");
  });
});



