import { describe, expect, it } from "vitest";
import { createStartedRoom, placeHero } from "./testHelpers.js";

describe("Scenario 3 action-card passing", () => {
  it("rotates action cards on timer flip when scenario flag is enabled", () => {
    const { service, room } = createStartedRoom(3);
    room.session.scenario.ruleFlags.passActionTilesOnTimerFlip = true;
    const before = room.session.players.map((player) => player.assignedActionCard?.actionCardId);
    placeHero(room, "hero-mage", "tile1A-1-0");
    service.activateSandTimer({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", cellId: "tile1A-1-0" });
    const after = room.session.players.map((player) => player.assignedActionCard?.actionCardId);
    expect(after).toEqual([before[2], before[0], before[1]]);
    expect(room.session.effectLog.some((effect) => effect.effectType === "ActionCardsPassed")).toBe(true);
  });

  it("does not rotate action cards when scenario flag is disabled", () => {
    const { service, room } = createStartedRoom(3);
    room.session.scenario.ruleFlags.passActionTilesOnTimerFlip = false;
    const before = room.session.players.map((player) => player.assignedActionCard?.actionCardId);
    placeHero(room, "hero-mage", "tile1A-1-0");
    service.activateSandTimer({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", cellId: "tile1A-1-0" });
    const after = room.session.players.map((player) => player.assignedActionCard?.actionCardId);
    expect(after).toEqual(before);
  });

  it("ignores spectators while rotating cards", () => {
    const { service, room } = createStartedRoom(3);
    room.session.scenario.ruleFlags.passActionTilesOnTimerFlip = true;
    room.session.players[2].isSpectator = true;
    const spectatorCard = room.session.players[2].assignedActionCard;
    placeHero(room, "hero-mage", "tile1A-1-0");
    service.activateSandTimer({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", cellId: "tile1A-1-0" });
    expect(room.session.players[2].assignedActionCard).toBe(spectatorCard);
    expect(room.session.players[0].assignedActionCard).toBeDefined();
    expect(room.session.players[1].assignedActionCard).toBeDefined();
  });
});


