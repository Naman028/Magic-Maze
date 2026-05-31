import { Server, Socket } from "socket.io";
import { roomCreateSchema, roomJoinSchema } from "../validators/payloadValidator.js";
import { difficultySelectSchema, disableCameraSchema, discussionEndSchema, explorePlaceTileSchema, legalMovesSchema, mageCrystalExploreSchema, moveHeroSchema, moveHeroToSchema, playerReadySchema, playAgainSchema, returnToLobbySchema, sandTimerSchema, scenarioSelectSchema, signalSchema, soloNextActionSchema, syncRequestSchema, takeEscalatorSchema, useVortexSchema } from "../validators/actionRequestValidator.js";
import { RoomService } from "../rooms/roomService.js";
import { SandTimerService } from "../timers/sandTimerService.js";
import { ClientEvent } from "./clientEvents.js";
import { findPlayerIdBySocket, roomPayloadForPlayer } from "./payloads.js";
import { ServerEvent } from "./serverEvents.js";

export function registerSocketHandlers(io: Server, socket: Socket, roomService: RoomService, timerService: SandTimerService): void {
  const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Unknown server error.");
  const emitServerError = (error: unknown) => {
    socket.emit(ServerEvent.ServerError, { message: errorMessage(error) });
  };
  const emitActionRejected = (event: ClientEvent, error: unknown) => {
    socket.emit(ServerEvent.ActionRejected, { event, message: errorMessage(error) });
  };
  const emitActionAccepted = (event: ClientEvent, roomCode: string) => {
    socket.emit(ServerEvent.ActionAccepted, { event, roomCode });
  };
  const emitNewEffects = (roomCode: string, effects: unknown[]) => {
    for (const effect of effects) io.to(roomCode).emit(ServerEvent.GameEffect, effect);
  };

  socket.on(ClientEvent.RoomCreate, (payload) => {
    try {
      const input = roomCreateSchema.parse({ ...payload, socketId: socket.id });
      const room = roomService.createRoom(input);
      socket.join(room.roomCode);
      const playerId = findPlayerIdBySocket(room, socket.id);
      socket.emit(ServerEvent.RoomCreated, roomPayloadForPlayer(room, playerId));
    } catch (error) {
      emitServerError(error);
    }
  });

  socket.on(ClientEvent.RoomJoin, (payload) => {
    try {
      const input = roomJoinSchema.parse({ ...payload, socketId: socket.id });
      const room = roomService.joinRoom(input);
      socket.join(room.roomCode);
      const playerId = findPlayerIdBySocket(room, socket.id);
      socket.emit(ServerEvent.RoomJoined, roomPayloadForPlayer(room, playerId));
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
    } catch (error) {
      emitServerError(error);
    }
  });

  socket.on(ClientEvent.GameStart, (payload) => {
    try {
      const room = roomService.startGame({ roomCode: payload.roomCode, playerId: payload.playerId, socketId: socket.id });
      timerService.start(room.roomCode);
      emitActionAccepted(ClientEvent.GameStart, room.roomCode);
      io.to(room.roomCode).emit(ServerEvent.GameStarted, room.session);
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
    } catch (error) {
      emitActionRejected(ClientEvent.GameStart, error);
    }
  });

  socket.on(ClientEvent.SoloNextAction, (payload) => {
    try {
      const input = soloNextActionSchema.parse(payload);
      const room = roomService.cycleSoloAction({ ...input, socketId: socket.id });
      emitActionAccepted(ClientEvent.SoloNextAction, room.roomCode);
      io.to(room.roomCode).emit(ServerEvent.ActionCardsRotated, room.session.players.map((player) => ({ playerId: player.playerId, actionCardId: player.assignedActionCard?.actionCardId })));
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
    } catch (error) {
      emitActionRejected(ClientEvent.SoloNextAction, error);
    }
  });

  socket.on(ClientEvent.ScenarioSelect, (payload) => {
    try {
      const input = scenarioSelectSchema.parse(payload);
      const room = roomService.selectScenario({ ...input, socketId: socket.id });
      emitActionAccepted(ClientEvent.ScenarioSelect, room.roomCode);
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
    } catch (error) {
      emitActionRejected(ClientEvent.ScenarioSelect, error);
    }
  });

  socket.on(ClientEvent.DifficultySelect, (payload) => {
    try {
      const input = difficultySelectSchema.parse(payload);
      const room = roomService.selectDifficulty({ ...input, socketId: socket.id });
      emitActionAccepted(ClientEvent.DifficultySelect, room.roomCode);
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
    } catch (error) {
      emitActionRejected(ClientEvent.DifficultySelect, error);
    }
  });

  socket.on(ClientEvent.HeroMove, (payload) => {
    try {
      const input = moveHeroSchema.parse(payload);
      const { room, theftTriggered, victoryTriggered } = roomService.moveHero({ ...input, socketId: socket.id });
      const effects = room.session.effectLog.slice(-3);
      emitActionAccepted(ClientEvent.HeroMove, room.roomCode);
      if (theftTriggered) {
        io.to(room.roomCode).emit(ServerEvent.AlarmTriggered, room.session);
      }
      if (victoryTriggered) {
        io.to(room.roomCode).emit(ServerEvent.GameVictory, room.session.result);
      }
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
      emitNewEffects(room.roomCode, effects);
    } catch (error) {
      emitActionRejected(ClientEvent.HeroMove, error);
    }
  });

  socket.on(ClientEvent.HeroMoveTo, (payload) => {
    try {
      const input = moveHeroToSchema.parse(payload);
      const { room, theftTriggered, victoryTriggered } = roomService.moveHeroTo({ ...input, socketId: socket.id });
      const effects = room.session.effectLog.slice(-3);
      emitActionAccepted(ClientEvent.HeroMoveTo, room.roomCode);
      if (theftTriggered) io.to(room.roomCode).emit(ServerEvent.AlarmTriggered, room.session);
      if (victoryTriggered) io.to(room.roomCode).emit(ServerEvent.GameVictory, room.session.result);
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
      emitNewEffects(room.roomCode, effects);
    } catch (error) {
      emitActionRejected(ClientEvent.HeroMoveTo, error);
    }
  });

  socket.on(ClientEvent.HeroLegalMoves, (payload) => {
    try {
      const input = legalMovesSchema.parse(payload);
      const result = roomService.getLegalMoves({ ...input, socketId: socket.id });
      socket.emit(ServerEvent.HeroLegalMoves, result);
    } catch (error) {
      emitActionRejected(ClientEvent.HeroLegalMoves, error);
    }
  });

  socket.on(ClientEvent.UseVortex, (payload) => {
    try {
      const input = useVortexSchema.parse(payload);
      const room = roomService.useVortex({ ...input, socketId: socket.id });
      const effects = room.session.effectLog.slice(-2);
      emitActionAccepted(ClientEvent.UseVortex, room.roomCode);
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
      emitNewEffects(room.roomCode, effects);
    } catch (error) {
      emitActionRejected(ClientEvent.UseVortex, error);
    }
  });

  socket.on(ClientEvent.TakeEscalator, (payload) => {
    try {
      const input = takeEscalatorSchema.parse(payload);
      const room = roomService.takeEscalator({ ...input, socketId: socket.id });
      const effects = room.session.effectLog.slice(-2);
      emitActionAccepted(ClientEvent.TakeEscalator, room.roomCode);
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
      emitNewEffects(room.roomCode, effects);
    } catch (error) {
      emitActionRejected(ClientEvent.TakeEscalator, error);
    }
  });

  socket.on(ClientEvent.SandTimerActivate, (payload) => {
    try {
      const input = sandTimerSchema.parse(payload);
      const room = roomService.activateSandTimer({ ...input, socketId: socket.id });
      const effects = room.session.effectLog.slice(-2);
      emitActionAccepted(ClientEvent.SandTimerActivate, room.roomCode);
      io.to(room.roomCode).emit(ServerEvent.DiscussionStarted, room.session);
      io.to(room.roomCode).emit(ServerEvent.CommunicationUpdated, room.session.communicationState);
      io.to(room.roomCode).emit(ServerEvent.TimerUpdated, { roomCode: room.roomCode, sandTimer: room.session.sandTimer });
      io.to(room.roomCode).emit(ServerEvent.ActionCardsRotated, room.session.players.map((player) => ({ playerId: player.playerId, actionCardId: player.assignedActionCard?.actionCardId })));
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
      io.to(room.roomCode).emit(ServerEvent.ObjectivesUpdated, room.session.objectives);
      emitNewEffects(room.roomCode, effects);
    } catch (error) {
      emitActionRejected(ClientEvent.SandTimerActivate, error);
    }
  });

  socket.on(ClientEvent.SignalSend, (payload) => {
    try {
      const input = signalSchema.parse(payload);
      const signal = roomService.sendSignal({ ...input, socketId: socket.id });
      const room = roomService.getRoom(input.roomCode);
      emitActionAccepted(ClientEvent.SignalSend, room.roomCode);
      io.to(room.roomCode).emit(ServerEvent.SignalReceived, signal);
      io.to(room.roomCode).emit(ServerEvent.CommunicationUpdated, room.session.communicationState);
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
    } catch (error) {
      emitActionRejected(ClientEvent.SignalSend, error);
    }
  });

  socket.on(ClientEvent.DiscussionEnd, (payload) => {
    try {
      const input = discussionEndSchema.parse(payload);
      const room = roomService.endDiscussion({ ...input, socketId: socket.id });
      emitActionAccepted(ClientEvent.DiscussionEnd, room.roomCode);
      io.to(room.roomCode).emit(ServerEvent.DiscussionEnded, room.session);
      io.to(room.roomCode).emit(ServerEvent.CommunicationUpdated, room.session.communicationState);
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
    } catch (error) {
      emitActionRejected(ClientEvent.DiscussionEnd, error);
    }
  });

  socket.on(ClientEvent.SyncRequest, (payload) => {
    try {
      const input = syncRequestSchema.parse(payload);
      const room = roomService.syncState(input.roomCode, input.playerId, socket.id);
      socket.join(room.roomCode);
      socket.emit(ServerEvent.SyncState, room.session);
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
    } catch (error) {
      emitActionRejected(ClientEvent.SyncRequest, error);
    }
  });

  socket.on(ClientEvent.ExplorePlaceTile, (payload) => {
    try {
      const input = explorePlaceTileSchema.parse(payload);
      const { room, placedTile, createdCellIds } = roomService.explorePlaceTile({ ...input, socketId: socket.id });
      const effects = room.session.effectLog.slice(-4);
      emitActionAccepted(ClientEvent.ExplorePlaceTile, room.roomCode);
      io.to(room.roomCode).emit(ServerEvent.TilePlaced, { roomCode: room.roomCode, placedTile, createdCellIds });
      io.to(room.roomCode).emit(ServerEvent.ObjectivesUpdated, room.session.objectives);
      io.to(room.roomCode).emit(ServerEvent.AchievementsUnlocked, room.session.achievements);
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
      emitNewEffects(room.roomCode, effects);
    } catch (error) {
      emitActionRejected(ClientEvent.ExplorePlaceTile, error);
    }
  });

  socket.on(ClientEvent.DisableCamera, (payload) => {
    try {
      const input = disableCameraSchema.parse(payload);
      const room = roomService.disableCamera({ ...input, socketId: socket.id });
      emitActionAccepted(ClientEvent.DisableCamera, room.roomCode);
      io.to(room.roomCode).emit(ServerEvent.ObjectivesUpdated, room.session.objectives);
      io.to(room.roomCode).emit(ServerEvent.AchievementsUnlocked, room.session.achievements);
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
      emitNewEffects(room.roomCode, room.session.effectLog.slice(-3));
    } catch (error) {
      emitActionRejected(ClientEvent.DisableCamera, error);
    }
  });

  socket.on(ClientEvent.MageCrystalExplore, (payload) => {
    try {
      const input = mageCrystalExploreSchema.parse(payload);
      const { room, placements } = roomService.mageCrystalExplore({ ...input, socketId: socket.id });
      emitActionAccepted(ClientEvent.MageCrystalExplore, room.roomCode);
      io.to(room.roomCode).emit(ServerEvent.TilePlaced, { roomCode: room.roomCode, placements });
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
      emitNewEffects(room.roomCode, room.session.effectLog.slice(-4));
    } catch (error) {
      emitActionRejected(ClientEvent.MageCrystalExplore, error);
    }
  });

  socket.on(ClientEvent.GamePlayAgain, (payload) => {
    try {
      const input = playAgainSchema.parse(payload);
      const room = roomService.playAgain({ ...input, socketId: socket.id });
      emitActionAccepted(ClientEvent.GamePlayAgain, room.roomCode);
      io.to(room.roomCode).emit(ServerEvent.RoomReset, room.session);
      io.to(room.roomCode).emit(ServerEvent.CommunicationUpdated, room.session.communicationState);
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
      emitNewEffects(room.roomCode, room.session.effectLog.slice(-2));
    } catch (error) {
      emitActionRejected(ClientEvent.GamePlayAgain, error);
    }
  });

  socket.on(ClientEvent.GameReturnToLobby, (payload) => {
    try {
      const input = returnToLobbySchema.parse(payload);
      const room = roomService.returnToLobby({ ...input, socketId: socket.id });
      emitActionAccepted(ClientEvent.GameReturnToLobby, room.roomCode);
      io.to(room.roomCode).emit(ServerEvent.RoomReset, room.session);
      io.to(room.roomCode).emit(ServerEvent.CommunicationUpdated, room.session.communicationState);
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
    } catch (error) {
      emitActionRejected(ClientEvent.GameReturnToLobby, error);
    }
  });

  socket.on(ClientEvent.PlayerReady, (payload) => {
    try {
      const input = playerReadySchema.parse(payload);
      const room = roomService.setPlayerReady({ ...input, socketId: socket.id });
      emitActionAccepted(ClientEvent.PlayerReady, room.roomCode);
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
    } catch (error) {
      emitActionRejected(ClientEvent.PlayerReady, error);
    }
  });

  socket.on("disconnect", () => {
    for (const room of roomService.disconnectSocket(socket.id)) {
      io.to(room.roomCode).emit(ServerEvent.StateUpdated, room.session);
    }
  });
}
