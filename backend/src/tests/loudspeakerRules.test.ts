import { describe, expect, it } from "vitest";
import { ActionType, CellType, Direction } from "../game/gameTypes.js";
import { createStartedRoom, givePlayerAction, placeHero } from "./testHelpers.js";

describe("loudspeaker rules", () => {
  it("opens temporary communication when not ignored", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    room.session.scenario.loudspeakerIgnored = false;
    placeHero(room, "hero-mage", "tile1A-start-mage");
    room.session.board.cells["tile1A-start-mage"].neighborCellIds.East = "speaker";
    room.session.board.cells.speaker = { cellId: "speaker", tileId: "test", x: 2, y: 1, type: CellType.Loudspeaker, walls: [], neighborCellIds: { West: "tile1A-start-mage" } };
    delete room.session.board.cells["tile1A-start-dwarf"].occupiedByHeroId;
    givePlayerAction(room, 0, ActionType.MoveEast);
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.East });
    expect(room.session.communicationState.mode).toBe("DiscussionOpen");
    expect(room.session.communicationState.reason).toBe("Loudspeaker");
    expect(room.session.sandTimer.usedSandTimerCellIds).toHaveLength(0);
  });

  it("does nothing when scenario ignores loudspeakers", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    room.session.scenario.loudspeakerIgnored = true;
    placeHero(room, "hero-mage", "tile1A-start-mage");
    room.session.board.cells["tile1A-start-mage"].neighborCellIds.East = "speaker";
    room.session.board.cells.speaker = { cellId: "speaker", tileId: "test", x: 2, y: 1, type: CellType.Loudspeaker, walls: [], neighborCellIds: { West: "tile1A-start-mage" } };
    delete room.session.board.cells["tile1A-start-dwarf"].occupiedByHeroId;
    givePlayerAction(room, 0, ActionType.MoveEast);
    service.moveHero({ roomCode: room.roomCode, playerId: room.session.players[0].playerId, heroId: "hero-mage", direction: Direction.East });
    expect(room.session.communicationState.reason).not.toBe("Loudspeaker");
  });
});



