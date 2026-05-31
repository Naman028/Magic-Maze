import { describe, expect, it } from "vitest";
import { ActionType, Direction } from "../game/gameTypes.js";
import { unlockAchievement } from "../rules/achievementRules.js";
import { createStartedRoom, givePlayerAction, markAllButMageEscaped, placeHero } from "./testHelpers.js";

describe("achievement rules", () => {
  it("victory unlocks first_escape, speed_escape, and no_timer_used", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveSouth);
    markAllButMageEscaped(room);
    room.session.sandTimer.remainingSeconds = 90;
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.South });
    expect(room.session.achievements.map((achievement) => achievement.achievementId)).toEqual(expect.arrayContaining(["first_escape", "speed_escape", "no_timer_used"]));
    expect(room.session.result?.achievementsUnlocked.map((achievement) => achievement.achievementId)).toContain("first_escape");
  });

  it("placing three tiles unlocks explorer", () => {
    const { room } = createStartedRoom();
    room.session.placedTiles.push({ tileId: "tile2", imageKey: "tile2.jpg", boardX: 1, boardY: 0, rotation: 0 });
    room.session.placedTiles.push({ tileId: "tile3", imageKey: "tile3.jpg", boardX: 2, boardY: 0, rotation: 0 });
    room.session.placedTiles.push({ tileId: "tile4", imageKey: "tile4.jpg", boardX: 3, boardY: 0, rotation: 0 });
    unlockAchievement(room.session, "explorer");
    expect(room.session.achievements.some((achievement) => achievement.achievementId === "explorer")).toBe(true);
  });

  it("disabling camera unlocks camera_control", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.ruleFlags.securityCamerasEnabled = true;
    room.session.board.cells.camera = { cellId: "camera", tileId: "test", x: 1, y: 1, type: "SecurityCamera" as never, walls: [], neighborCellIds: {} };
    placeHero(room, "hero-barbarian", "camera");
    service.disableCamera({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-barbarian", cameraCellId: "camera" });
    expect(room.session.achievements.some((achievement) => achievement.achievementId === "camera_control")).toBe(true);
  });
});



