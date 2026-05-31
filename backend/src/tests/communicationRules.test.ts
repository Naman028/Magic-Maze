import { describe, expect, it } from "vitest";
import { CommunicationMode, GameStatus } from "../game/gameTypes.js";
import { SCENARIOS } from "../data/scenarios.js";
import { createRoomService, createStartedRoom, placeHero } from "./testHelpers.js";

describe("communication rules", () => {
  it("starts waiting rooms with open communication", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host" });

    expect(room.session.communicationState.mode).toBe(CommunicationMode.Open);
    expect(room.session.communicationState.chatAllowed).toBe(true);
    expect(room.session.communicationState.voiceAllowed).toBe(true);
    expect(room.session.communicationState.actionsLocked).toBe(false);
  });

  it("records non-verbal communication signals", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;

    const signal = service.sendSignal({
      roomCode: room.roomCode,
      playerId: room.session.players[0].playerId,
      targetPlayerId: room.session.players[1].playerId,
      heroId: "hero-mage",
      signalType: "Attention",
    });

    expect(signal.fromPlayerId).toBe(room.session.players[0].playerId);
    expect(room.session.communicationState.signals).toHaveLength(1);
  });

  it("rejects signals with a fake target player", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;

    expect(() =>
      service.sendSignal({
        roomCode: room.roomCode,
        playerId: room.session.players[0].playerId,
        targetPlayerId: "fake-player",
        signalType: "Attention",
      }),
    ).toThrow("Player does not belong");
  });

  it("rejects signals with a fake hero", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;

    expect(() =>
      service.sendSignal({
        roomCode: room.roomCode,
        playerId: room.session.players[0].playerId,
        heroId: "fake-hero",
        signalType: "Attention",
      }),
    ).toThrow("Hero does not exist");
  });

  it("rejects communication after defeat", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    room.session.status = GameStatus.Defeat;

    expect(() =>
      service.sendSignal({
        roomCode: room.roomCode,
        playerId: room.session.players[0].playerId,
        signalType: "Hurry",
      }),
    ).toThrow("completion");
  });

  it("ends discussion and unlocks actions", () => {
    const { service, room } = createStartedRoom();
    room.session.scenario.communicationAlwaysOpen = false;
    placeHero(room, "hero-mage", "tile1A-1-0");
    service.activateSandTimer({
      roomCode: room.roomCode,
      playerId: room.session.players[0].playerId,
      heroId: "hero-mage",
      cellId: "tile1A-1-0",
    });

    service.endDiscussion({ roomCode: room.roomCode, playerId: room.session.players[0].playerId });

    expect(room.session.status).toBe(GameStatus.InProgress);
    expect(room.session.actionsLocked).toBe(false);
    expect(room.session.communicationState.actionsLocked).toBe(false);
    expect(room.session.communicationState.mode).toBe(CommunicationMode.SilentOnly);
  });

  it("keeps Scenario 1 communication open after game start", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host" });
    service.startGame(room.roomCode, room.session.players[0].playerId);

    expect(room.session.communicationState.mode).toBe(CommunicationMode.Open);
    expect(room.session.communicationState.chatAllowed).toBe(true);
    expect(room.session.communicationState.voiceAllowed).toBe(true);
  });

  it("sets Scenario 2 communication to SilentOnly after game start", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host" });
    room.session.scenario = SCENARIOS.scenario2;
    service.startGame(room.roomCode, room.session.players[0].playerId);

    expect(room.session.communicationState.mode).toBe(CommunicationMode.SilentOnly);
  });
});


