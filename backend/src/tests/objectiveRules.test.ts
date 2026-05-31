import { describe, expect, it } from "vitest";
import { CellType } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, markAllButMageEscaped, placeHero, setTheftReadyExceptMage } from "./testHelpers.js";
import { ActionType, Direction } from "../game/gameTypes.js";

describe("objective tracking", () => {
  it("tile placement completes ExploreMall", () => {
    const { service, room } = createStartedRoom(5);
    room.session.tileDeck.remainingTileIds = ["tile2"];
    room.session.players[4].assignedActionCard = { actionCardId: "explore", imageKey: "x.png", actions: [ActionType.ExploreTile], label: "Explore", icons: [] };
    placeHero(room, "hero-elf", "tile1A-3-2");
    service.explorePlaceTile({ roomCode: room.roomCode, playerId: room.session.players[4].playerId, heroId: "hero-elf", explorationCellId: "tile1A-3-2", boardX: 1, boardY: 0, rotation: 180 });
    expect(room.session.objectives.find((objective) => objective.type === "ExploreMall")?.isCompleted).toBe(true);
  });

  it("theft completes CollectItems", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveNorth);
    setTheftReadyExceptMage(room);
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North });
    expect(room.session.objectives.find((objective) => objective.type === "CollectItems")?.isCompleted).toBe(true);
  });

  it("timer activation completes UseTimer", () => {
    const { service, room } = createStartedRoom();
    placeHero(room, "hero-mage", "tile1A-1-0");
    service.activateSandTimer({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", cellId: "tile1A-1-0" });
    expect(room.session.objectives.find((objective) => objective.type === "UseTimer")?.isCompleted).toBe(true);
  });

  it("victory completes ReachExit", () => {
    const { service, room } = createStartedRoom();
    givePlayerAction(room, 0, ActionType.MoveSouth);
    markAllButMageEscaped(room);
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.South });
    expect(room.session.objectives.find((objective) => objective.type === "ReachExit")?.isCompleted).toBe(true);
  });

  it("camera disable completes DisableCameras when enabled", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.ruleFlags.securityCamerasEnabled = true;
    room.session.objectives.push({ objectiveId: "objective-cameras", type: "DisableCameras", description: "Disable camera", isCompleted: false });
    room.session.board.cells.camera = { cellId: "camera", tileId: "test", x: 1, y: 1, type: CellType.SecurityCamera, walls: [], neighborCellIds: {} };
    placeHero(room, "hero-barbarian", "camera");
    service.disableCamera({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-barbarian", cameraCellId: "camera" });
    expect(room.session.objectives.find((objective) => objective.type === "DisableCameras")?.isCompleted).toBe(true);
  });
});




