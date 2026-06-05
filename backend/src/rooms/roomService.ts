import { assignActionCards, assignNextSoloActionCard } from "../game/actionCardAssigner.js";
import { createGameSession, shuffleTileDeck } from "../game/gameStateFactory.js";
import { ActionType, CellType, CommunicationMode, DifficultyLevel, Direction, GameStatus, HeroType, LegalMoveTarget, NonVerbalSignal, Player, Room } from "../game/gameTypes.js";
import { createId } from "../utils/idGenerator.js";
import { getScenario } from "../data/scenarios.js";
import { assertPlayerCanUseDirection } from "../rules/actionRules.js";
import { addSignal, endDiscussion } from "../rules/communicationRules.js";
import { closeTemporaryCommunicationIfNeeded, openTemporaryCommunication, setCommunicationMode } from "../rules/communicationState.js";
import { difficultySettingsFor } from "../rules/difficultyRules.js";
import { addEffect } from "../rules/effectRules.js";
import { applyEscapeIfOnExit } from "../rules/escapeRules.js";
import { assertHost } from "../rules/hostRules.js";
import { assertMovementPhase, assertWaiting } from "../rules/phaseRules.js";
import { assertPlayerBelongsToRoom, assertRoomCanBeJoined, assertNickname, assertSocketOwnsPlayer } from "../rules/roomRules.js";
import { activateSandTimer, tryAutoActivateSandTimer } from "../rules/sandTimerRules.js";
import { placeNextTile, TilePlacementResult } from "../rules/tilePlacementRules.js";
import { evaluateTileAchievements, unlockAchievement } from "../rules/achievementRules.js";
import { createInitialGuards, advanceGuards } from "../rules/guardRules.js";
import { completeObjective, createObjectives } from "../rules/objectiveRules.js";
import { applyTheftIfTriggered } from "../rules/theftRules.js";
import { applyVictoryIfComplete } from "../rules/victoryDefeatRules.js";
import { assertMovementAllowedForHero, assertTargetNotOccupied, getCurrentAndTargetCells, getLegalMoveTargets, getReachableTargetCell, moveHero } from "../rules/movementRules.js";
import { takeEscalator, useVortex } from "../rules/specialActionRules.js";
import { generateRoomCode } from "./roomCodeGenerator.js";
import { RoomStore } from "./roomStore.js";

export interface CreateRoomInput {
  nickname: string;
  socketId?: string;
}

export interface JoinRoomInput extends CreateRoomInput {
  roomCode: string;
}

export interface MoveHeroInput {
  roomCode: string;
  playerId: string;
  heroId: string;
  direction: Direction;
  socketId?: string;
}

export interface MoveHeroToInput extends MoveHeroInput {
  targetCellId: string;
}

export interface LegalMovesInput {
  roomCode: string;
  playerId: string;
  heroId: string;
  socketId?: string;
}

export interface SandTimerInput {
  roomCode: string;
  playerId: string;
  heroId: string;
  cellId: string;
  socketId?: string;
}

export interface SignalInput {
  roomCode: string;
  playerId: string;
  targetPlayerId?: string;
  heroId?: string;
  signalType: NonVerbalSignal["signalType"];
  socketId?: string;
}

export interface ExplorePlaceTileInput {
  roomCode: string;
  playerId: string;
  heroId: string;
  explorationCellId: string;
  tileId?: string;
  boardX: number;
  boardY: number;
  rotation: 0 | 90 | 180 | 270;
  socketId?: string;
}

export interface UseVortexInput {
  roomCode: string;
  playerId: string;
  heroId: string;
  targetCellId: string;
  socketId?: string;
}

export interface TakeEscalatorInput {
  roomCode: string;
  playerId: string;
  heroId: string;
  targetCellId?: string;
  socketId?: string;
}

export interface ScenarioSelectInput {
  roomCode: string;
  playerId: string;
  scenarioId: string;
  socketId?: string;
}

export interface DifficultySelectInput {
  roomCode: string;
  playerId: string;
  difficulty: DifficultyLevel;
  socketId?: string;
}

export interface DisableCameraInput {
  roomCode: string;
  playerId: string;
  heroId: string;
  cameraCellId: string;
  socketId?: string;
}

export interface MageCrystalExploreInput {
  roomCode: string;
  playerId: string;
  heroId: string;
  placements: Array<{ explorationCellId: string; boardX: number; boardY: number; rotation: 0 | 90 | 180 | 270 }>;
  socketId?: string;
}

export interface StartGameInput {
  roomCode: string;
  playerId: string;
  socketId?: string;
}

export interface DiscussionEndInput {
  roomCode: string;
  playerId: string;
  socketId?: string;
}

export interface PlayAgainInput {
  roomCode: string;
  playerId: string;
  keepScenario: boolean;
  keepDifficulty: boolean;
  socketId?: string;
}

export interface PlayerReadyInput {
  roomCode: string;
  playerId: string;
  isReady: boolean;
  socketId?: string;
}

export interface MoveHeroResult {
  room: Room;
  theftTriggered: boolean;
  victoryTriggered: boolean;
  timerFlipped: boolean;
}

export interface LegalMovesResult {
  heroId: string;
  currentCellId: string;
  targets: LegalMoveTarget[];
}

export class RoomService {
  constructor(private readonly store: RoomStore) {}

  private playerWithHiddenReconnectToken(player: Player): Player {
    Object.defineProperty(player, "reconnectToken", {
      value: player.reconnectToken,
      enumerable: false,
      writable: true,
      configurable: true,
    });
    return player;
  }

  createRoom(input: CreateRoomInput): Room {
    assertNickname(input.nickname);
    let roomCode = generateRoomCode();
    while (this.store.has(roomCode)) {
      roomCode = generateRoomCode();
    }
    const host: Player = this.playerWithHiddenReconnectToken({
      playerId: createId("player"),
      socketId: input.socketId,
      reconnectToken: createId("reconnect"),
      nickname: input.nickname.trim(),
      isHost: true,
      isReady: false,
      isConnected: true,
      isSpectator: false,
    });
    const room: Room = { roomCode, session: createGameSession(roomCode, host) };
    this.store.set(room);
    return room;
  }

  joinRoom(input: JoinRoomInput): Room {
    assertNickname(input.nickname);
    const room = this.store.get(input.roomCode);
    assertRoomCanBeJoined(room);
    const player: Player = this.playerWithHiddenReconnectToken({
      playerId: createId("player"),
      socketId: input.socketId,
      reconnectToken: createId("reconnect"),
      nickname: input.nickname.trim(),
      isHost: false,
      isReady: false,
      isConnected: true,
      isSpectator: false,
    });
    room.session.players.push(player);
    room.session.updatedAt = Date.now();
    return room;
  }

  getRoom(roomCode: string): Room {
    const room = this.store.get(roomCode);
    if (!room) {
      throw new Error("Room does not exist.");
    }
    return room;
  }

  startGame(roomCodeOrInput: string | StartGameInput, playerId?: string): Room {
    const roomCode = typeof roomCodeOrInput === "string" ? roomCodeOrInput : roomCodeOrInput.roomCode;
    const actingPlayerId = typeof roomCodeOrInput === "string" ? playerId : roomCodeOrInput.playerId;
    const socketId = typeof roomCodeOrInput === "string" ? undefined : roomCodeOrInput.socketId;
    if (!actingPlayerId) {
      throw new Error("Player id is required.");
    }
    const room = this.getRoom(roomCode);
    if (socketId) {
      assertSocketOwnsPlayer(room, actingPlayerId, socketId);
    }
    assertHost(room, actingPlayerId);
    assertWaiting(room);
    assignActionCards(room.session.players);
    room.session.status = GameStatus.InProgress;
    room.session.sandTimer.isRunning = true;
    room.session.sandTimer.remainingSeconds = room.session.difficultySettings.timeLimitSeconds;
    room.session.challengeState.guards = createInitialGuards(room.session);
    setCommunicationMode(room.session, room.session.scenario.communicationAlwaysOpen ? CommunicationMode.Open : CommunicationMode.SilentOnly, false, room.session.scenario.communicationAlwaysOpen ? "ScenarioFreeCommunication" : "SilentGameplay", false);
    room.session.updatedAt = Date.now();
    return room;
  }

  selectScenario(input: ScenarioSelectInput): Room {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    assertHost(room, input.playerId);
    this.assertCanConfigureRoom(room);
    const scenario = getScenario(input.scenarioId);
    room.session.scenario = scenario;
    room.session.tileDeck = { remainingTileIds: shuffleTileDeck(scenario.tileDeckIds), usedTileIds: [] };
    room.session.objectives = createObjectives(scenario.ruleFlags.securityCamerasEnabled);
    room.session.unlockedScenarioIds = [...new Set([...room.session.unlockedScenarioIds, scenario.scenarioId])];
    room.session.sandTimer.remainingSeconds = room.session.difficultySettings.timeLimitSeconds;
    room.session.updatedAt = Date.now();
    return room;
  }

  selectDifficulty(input: DifficultySelectInput): Room {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    assertHost(room, input.playerId);
    this.assertCanConfigureRoom(room);
    room.session.difficultySettings = difficultySettingsFor(input.difficulty);
    room.session.sandTimer.remainingSeconds = room.session.difficultySettings.timeLimitSeconds;
    room.session.updatedAt = Date.now();
    return room;
  }

  moveHero(input: MoveHeroInput): MoveHeroResult {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) {
      assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    } else {
      assertPlayerBelongsToRoom(room, input.playerId);
    }
    const player = room.session.players.find((candidate) => candidate.playerId === input.playerId);
    if (!player?.isConnected) {
      throw new Error("Player is not connected.");
    }
    assertMovementPhase(room);
    assertPlayerCanUseDirection(player, input.direction);
    const hero = room.session.heroes.find((candidate) => candidate.heroId === input.heroId);
    if (!hero) {
      throw new Error("Hero does not exist.");
    }
    const { currentCell, targetCell } = getCurrentAndTargetCells(room.session, hero, input.direction);
    assertMovementAllowedForHero(room.session, hero, currentCell, targetCell, input.direction);
    assertTargetNotOccupied(targetCell);
    this.closeMicBeforeValidAction(room);
    const timerUsesBefore = room.session.sandTimer.usedSandTimerCellIds.length;
    moveHero(hero, currentCell, targetCell);
    addEffect(room.session, { effectType: "HeroMoved", heroId: hero.heroId, cellId: targetCell.cellId, animationKey: "move" });
    this.handlePostHeroPositionEffects(room, hero.heroId);
    const timerFlipped = room.session.sandTimer.usedSandTimerCellIds.length > timerUsesBefore;
    const theftTriggered = applyTheftIfTriggered(room.session);
    applyEscapeIfOnExit(room.session, hero.heroId);
    const victoryTriggered = applyVictoryIfComplete(room.session);
    room.session.updatedAt = Date.now();
    return { room, theftTriggered, victoryTriggered, timerFlipped };
  }

  moveHeroTo(input: MoveHeroToInput): MoveHeroResult {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) {
      assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    } else {
      assertPlayerBelongsToRoom(room, input.playerId);
    }
    const player = room.session.players.find((candidate) => candidate.playerId === input.playerId);
    if (!player?.isConnected) throw new Error("Player is not connected.");
    assertMovementPhase(room);
    assertPlayerCanUseDirection(player, input.direction);
    const hero = room.session.heroes.find((candidate) => candidate.heroId === input.heroId);
    if (!hero) throw new Error("Hero does not exist.");
    const { currentCell, targetCell } = getReachableTargetCell(room.session, player, hero, input.direction, input.targetCellId);
    this.closeMicBeforeValidAction(room);
    const timerUsesBefore = room.session.sandTimer.usedSandTimerCellIds.length;
    moveHero(hero, currentCell, targetCell);
    addEffect(room.session, { effectType: "HeroMoved", heroId: hero.heroId, cellId: targetCell.cellId, animationKey: "move" });
    this.handlePostHeroPositionEffects(room, hero.heroId);
    const timerFlipped = room.session.sandTimer.usedSandTimerCellIds.length > timerUsesBefore;
    const theftTriggered = applyTheftIfTriggered(room.session);
    applyEscapeIfOnExit(room.session, hero.heroId);
    const victoryTriggered = applyVictoryIfComplete(room.session);
    room.session.updatedAt = Date.now();
    return { room, theftTriggered, victoryTriggered, timerFlipped };
  }

  getLegalMoves(input: LegalMovesInput): LegalMovesResult {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) {
      assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    } else {
      assertPlayerBelongsToRoom(room, input.playerId);
    }
    const player = room.session.players.find((candidate) => candidate.playerId === input.playerId);
    if (!player?.isConnected) throw new Error("Player is not connected.");
    assertMovementPhase(room);
    const hero = room.session.heroes.find((candidate) => candidate.heroId === input.heroId);
    if (!hero) throw new Error("Hero does not exist.");
    if (hero.hasEscaped || !hero.positionCellId) throw new Error("Hero is not available for movement.");
    return {
      heroId: hero.heroId,
      currentCellId: hero.positionCellId,
      targets: getLegalMoveTargets(room.session, player, hero),
    };
  }

  cycleSoloAction(input: { roomCode: string; playerId: string; targetAction?: ActionType; socketId?: string }): Room {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) {
      assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    } else {
      assertPlayerBelongsToRoom(room, input.playerId);
    }
    const player = room.session.players.find((candidate) => candidate.playerId === input.playerId);
    if (!player?.isConnected) throw new Error("Player is not connected.");
    assignNextSoloActionCard(room.session.players, input.playerId, input.targetAction);
    room.session.updatedAt = Date.now();
    return room;
  }

  activateSandTimer(input: SandTimerInput): Room {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) {
      assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    } else {
      assertPlayerBelongsToRoom(room, input.playerId);
    }
    this.closeMicBeforeValidAction(room);
    activateSandTimer(room.session, input.heroId, input.cellId);
    this.rotateActionCardsAfterTimerIfNeeded(room);
    return room;
  }

  sendSignal(input: SignalInput): NonVerbalSignal {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) {
      assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    } else {
      assertPlayerBelongsToRoom(room, input.playerId);
    }
    if (input.targetPlayerId) {
      assertPlayerBelongsToRoom(room, input.targetPlayerId);
    }
    if (input.heroId && !room.session.heroes.some((hero) => hero.heroId === input.heroId)) {
      throw new Error("Hero does not exist.");
    }
    const signal: NonVerbalSignal = {
      signalId: createId("signal"),
      fromPlayerId: input.playerId,
      targetPlayerId: input.targetPlayerId,
      heroId: input.heroId,
      signalType: input.signalType,
      createdAt: Date.now(),
    };
    addSignal(room.session, signal);
    room.session.updatedAt = Date.now();
    return signal;
  }

  explorePlaceTile(input: ExplorePlaceTileInput): { room: Room } & TilePlacementResult {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) {
      assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    } else {
      assertPlayerBelongsToRoom(room, input.playerId);
    }
    this.closeMicBeforeValidAction(room);
    const result = placeNextTile(room.session, input.playerId, input.heroId, input.explorationCellId, input.boardX, input.boardY, input.rotation, input.tileId);
    completeObjective(room.session, "ExploreMall");
    evaluateTileAchievements(room.session);
    addEffect(room.session, { effectType: "TilePlaced", tileId: result.placedTile.tileId, animationKey: "tile-place" });
    const hero = room.session.heroes.find((candidate) => candidate.heroId === input.heroId);
    if (hero?.heroType === HeroType.Elf && room.session.scenario.ruleFlags.elfExploreStartsDiscussion) {
      openTemporaryCommunication(room.session, "ElfAbility");
      addEffect(room.session, { effectType: "CommunicationOpened", soundKey: "communication-open" });
    }
    return { room, ...result };
  }

  useVortex(input: UseVortexInput): Room {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    else assertPlayerBelongsToRoom(room, input.playerId);
    this.closeMicBeforeValidAction(room);
    useVortex(room.session, input.playerId, input.heroId, input.targetCellId);
    addEffect(room.session, { effectType: "VortexUsed", heroId: input.heroId, cellId: input.targetCellId, animationKey: "vortex" });
    this.handlePostHeroPositionEffects(room, input.heroId);
    return room;
  }

  takeEscalator(input: TakeEscalatorInput): Room {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    else assertPlayerBelongsToRoom(room, input.playerId);
    this.closeMicBeforeValidAction(room);
    takeEscalator(room.session, input.playerId, input.heroId, input.targetCellId);
    const hero = room.session.heroes.find((candidate) => candidate.heroId === input.heroId);
    addEffect(room.session, { effectType: "EscalatorUsed", heroId: input.heroId, cellId: hero?.positionCellId ?? undefined, animationKey: "escalator" });
    this.handlePostHeroPositionEffects(room, input.heroId);
    return room;
  }

  disableCamera(input: DisableCameraInput): Room {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    else assertPlayerBelongsToRoom(room, input.playerId);
    if (!room.session.scenario.ruleFlags.securityCamerasEnabled) throw new Error("Security cameras are not enabled in this scenario.");
    const hero = room.session.heroes.find((candidate) => candidate.heroId === input.heroId);
    if (!hero) throw new Error("Hero does not exist.");
    if (hero.heroType !== HeroType.Barbarian) throw new Error("Only the Barbarian can disable cameras.");
    if (hero.positionCellId !== input.cameraCellId) throw new Error("Barbarian must stand on the camera cell.");
    const cell = room.session.board.cells[input.cameraCellId];
    if (!cell || cell.type !== CellType.SecurityCamera) throw new Error("Cell is not a security camera.");
    if (cell.cameraDisabled) throw new Error("Security camera is already disabled.");
    this.closeMicBeforeValidAction(room);
    cell.cameraDisabled = true;
    completeObjective(room.session, "DisableCameras");
    unlockAchievement(room.session, "camera_control");
    addEffect(room.session, { effectType: "ObjectiveCompleted", heroId: input.heroId, cellId: input.cameraCellId, animationKey: "camera-disabled" });
    room.session.updatedAt = Date.now();
    return room;
  }

  mageCrystalExplore(input: MageCrystalExploreInput): { room: Room; placements: TilePlacementResult[] } {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    else assertPlayerBelongsToRoom(room, input.playerId);
    if (!room.session.scenario.ruleFlags.mageCrystalBallEnabled) throw new Error("Mage crystal ball is not enabled in this scenario.");
    if (input.placements.length < 1 || input.placements.length > 2) throw new Error("Crystal ball can place one or two tiles.");
    const player = room.session.players.find((candidate) => candidate.playerId === input.playerId);
    if (!player?.assignedActionCard?.actions.includes(ActionType.ExploreTile)) throw new Error("Player is not assigned the explore action.");
    const hero = room.session.heroes.find((candidate) => candidate.heroId === input.heroId);
    if (!hero) throw new Error("Hero does not exist.");
    if (hero.heroType !== HeroType.Mage) throw new Error("Only the Mage can use the crystal ball.");
    if (!hero.positionCellId) throw new Error("Hero is not on the board.");
    const crystalCell = room.session.board.cells[hero.positionCellId];
    if (!crystalCell || crystalCell.type !== CellType.CrystalBall) throw new Error("Mage must stand on a crystal ball.");
    if (crystalCell.crystalBallUsed) throw new Error("Crystal ball was already used.");
    const originalPosition = hero.positionCellId;
    const results: TilePlacementResult[] = [];
    this.closeMicBeforeValidAction(room);
    try {
      for (const placement of input.placements) {
        hero.positionCellId = placement.explorationCellId;
        results.push(placeNextTile(room.session, input.playerId, input.heroId, placement.explorationCellId, placement.boardX, placement.boardY, placement.rotation));
      }
    } finally {
      hero.positionCellId = originalPosition;
    }
    crystalCell.crystalBallUsed = true;
    room.session.updatedAt = Date.now();
    return { room, placements: results };
  }

  advanceGuards(roomCode: string): Room {
    const room = this.getRoom(roomCode);
    advanceGuards(room.session);
    return room;
  }

  playAgain(input: PlayAgainInput): Room {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    assertHost(room, input.playerId);
    if (![GameStatus.Victory, GameStatus.Defeat].includes(room.session.status)) throw new Error("Game must be over before playing again.");
    const scenario = input.keepScenario ? room.session.scenario : getScenario("scenario1_discovery");
    const difficulty = input.keepDifficulty ? room.session.difficultySettings : difficultySettingsFor("Normal");
    const players = room.session.players.map((player) =>
      this.playerWithHiddenReconnectToken({ ...player, reconnectToken: player.reconnectToken, isReady: false, assignedActionCard: undefined }),
    );
    room.session = createGameSession(room.roomCode, players.find((player) => player.isHost) ?? players[0]);
    room.session.players = players;
    room.session.scenario = scenario;
    room.session.difficultySettings = difficulty;
    room.session.tileDeck = { remainingTileIds: shuffleTileDeck(scenario.tileDeckIds), usedTileIds: [] };
    room.session.sandTimer.remainingSeconds = difficulty.timeLimitSeconds;
    setCommunicationMode(room.session, CommunicationMode.Open, false, "Lobby", false);
    addEffect(room.session, { effectType: "RoomReset", soundKey: "room-reset" });
    return room;
  }

  returnToLobby(input: Omit<PlayAgainInput, "keepScenario" | "keepDifficulty">): Room {
    return this.playAgain({ ...input, keepScenario: true, keepDifficulty: true });
  }

  setPlayerReady(input: PlayerReadyInput): Room {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    if (![GameStatus.Waiting, GameStatus.Victory, GameStatus.Defeat].includes(room.session.status)) throw new Error("Ready can only be changed in lobby.");
    const player = room.session.players.find((candidate) => candidate.playerId === input.playerId);
    if (!player) throw new Error("Player does not belong to this room.");
    player.isReady = input.isReady;
    room.session.updatedAt = Date.now();
    return room;
  }

  private assertCanConfigureRoom(room: Room): void {
    if (![GameStatus.Waiting, GameStatus.Victory, GameStatus.Defeat].includes(room.session.status)) {
      throw new Error("Scenario or difficulty can only be changed in lobby or after game end.");
    }
  }

  private closeMicBeforeValidAction(room: Room): void {
    if (closeTemporaryCommunicationIfNeeded(room.session)) {
      addEffect(room.session, { effectType: "CommunicationClosed", soundKey: "communication-close" });
    }
  }

  private handlePostHeroPositionEffects(room: Room, heroId: string): void {
    const hero = room.session.heroes.find((candidate) => candidate.heroId === heroId);
    const cell = hero?.positionCellId ? room.session.board.cells[hero.positionCellId] : undefined;
    const flipped = tryAutoActivateSandTimer(room.session, heroId);
    if (flipped) {
      this.rotateActionCardsAfterTimerIfNeeded(room);
      return;
    }
    if (cell?.type === CellType.Loudspeaker && !room.session.scenario.loudspeakerIgnored && [GameStatus.InProgress].includes(room.session.status)) {
      openTemporaryCommunication(room.session, "Loudspeaker");
      addEffect(room.session, { effectType: "LoudspeakerActivated", heroId, cellId: cell.cellId, soundKey: "loudspeaker" });
      addEffect(room.session, { effectType: "CommunicationOpened", heroId, cellId: cell.cellId, soundKey: "communication-open" });
    }
  }

  private rotateActionCardsAfterTimerIfNeeded(room: Room): void {
    if (!room.session.scenario.ruleFlags.passActionTilesOnTimerFlip) return;
    const activePlayers = room.session.players.filter((player) => !player.isSpectator);
    const cards = activePlayers.map((player) => player.assignedActionCard);
    activePlayers.forEach((player, index) => {
      player.assignedActionCard = cards[(index + activePlayers.length - 1) % activePlayers.length];
    });
    addEffect(room.session, { effectType: "ActionCardsPassed", soundKey: "cards-pass" });
  }

  endDiscussion(input: DiscussionEndInput): Room {
    const room = this.getRoom(input.roomCode);
    if (input.socketId) {
      assertSocketOwnsPlayer(room, input.playerId, input.socketId);
    } else {
      assertPlayerBelongsToRoom(room, input.playerId);
    }
    endDiscussion(room.session);
    return room;
  }

  disconnectSocket(socketId: string): Room[] {
    const changedRooms: Room[] = [];
    for (const room of this.store.all()) {
      const player = room.session.players.find((candidate) => candidate.socketId === socketId);
      if (player && player.isConnected) {
        player.isConnected = false;
        room.session.updatedAt = Date.now();
        changedRooms.push(room);
      }
    }
    return changedRooms;
  }

  syncState(roomCode: string, playerId: string, reconnectToken: string, socketId: string): Room {
    const room = this.getRoom(roomCode);
    const player = room.session.players.find((candidate) => candidate.playerId === playerId);
    if (!player) {
      throw new Error("Player does not belong to this room.");
    }
    if (player.reconnectToken !== reconnectToken) {
      throw new Error("Reconnect token is invalid.");
    }
    if (player.socketId === socketId) {
      if (!player.isConnected) {
        player.isConnected = true;
        room.session.updatedAt = Date.now();
      }
      return room;
    }
    if (!player.isConnected) {
      player.socketId = socketId;
      player.isConnected = true;
      room.session.updatedAt = Date.now();
      return room;
    }
    throw new Error("Socket is not allowed to act as this player.");
  }

  socketOwnsPlayer(roomCode: string, playerId: string, socketId: string): Room {
    const room = this.getRoom(roomCode);
    assertSocketOwnsPlayer(room, playerId, socketId);
    return room;
  }
}
