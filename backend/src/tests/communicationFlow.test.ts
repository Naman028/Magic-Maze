import { describe, expect, it } from "vitest";
import { ActionType, Direction } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, placeHero } from "./testHelpers.js";

describe("communication flow", () => {
  it("next valid move closes temporary timer communication", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    placeHero(room, "hero-mage", "tile1A-1-0");
    service.activateSandTimer({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", cellId: "tile1A-1-0" });
    givePlayerAction(room, 0, ActionType.MoveEast);
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.East });
    expect(room.session.communicationState.mode).toBe("SilentOnly");
    expect(room.session.effectLog.some((effect) => effect.effectType === "CommunicationClosed")).toBe(true);
  });

  it("invalid move does not close temporary communication", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    placeHero(room, "hero-mage", "tile1A-1-0");
    service.activateSandTimer({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", cellId: "tile1A-1-0" });
    expect(() => service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.North })).toThrow();
    expect(room.session.communicationState.mode).toBe("DiscussionOpen");
  });

  it("loudspeaker communication closes on next valid tile placement", () => {
    const { service, room } = createStartedRoom(5);
    room.session.scenario.communicationAlwaysOpen = false;
    room.session.scenario.loudspeakerIgnored = false;
    room.session.communicationState.mode = "DiscussionOpen" as never;
    room.session.communicationState.reason = "Loudspeaker";
    room.session.communicationState.autoCloseOnNextGameAction = true;
    room.session.tileDeck.remainingTileIds = ["tile2"];
    room.session.players[4].assignedActionCard = { actionCardId: "explore", imageKey: "x.png", actions: [ActionType.ExploreTile], label: "Explore", icons: [] };
    placeHero(room, "hero-elf", "tile1A-3-2");
    service.explorePlaceTile({ roomCode: room.roomCode, playerId: room.session.players[4].playerId, heroId: "hero-elf", explorationCellId: "tile1A-3-2", boardX: 1, boardY: 0, rotation: 180 });
    expect(room.session.communicationState.mode).toBe("SilentOnly");
  });

  it("scenario free communication does not auto-close after movement", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    room.session.scenario.communicationAlwaysOpen = true;
    room.session.communicationState.autoCloseOnNextGameAction = true;
    placeHero(room, "hero-mage", "tile1A-start-mage");
    delete room.session.board.cells["tile1A-start-dwarf"].occupiedByHeroId;
    givePlayerAction(room, 0, ActionType.MoveEast);
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.East });
    expect(room.session.communicationState.mode).toBe("Open");
  });
});




