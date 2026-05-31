import { z } from "zod";
import { ActionType, DifficultyLevel, Direction } from "../game/gameTypes.js";

export const moveHeroSchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
  heroId: z.string().min(1),
  direction: z.nativeEnum(Direction),
});

export const moveHeroToSchema = moveHeroSchema.extend({
  targetCellId: z.string().min(1),
});

export const legalMovesSchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
  heroId: z.string().min(1),
});

export const soloNextActionSchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
  targetAction: z.nativeEnum(ActionType).optional(),
});

export const sandTimerSchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
  heroId: z.string().min(1),
  cellId: z.string().min(1),
});

export const signalSchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
  targetPlayerId: z.string().optional(),
  heroId: z.string().optional(),
  signalType: z.enum(["Attention", "Approve", "Reject", "Hurry"]),
});

export const discussionEndSchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
});

export const syncRequestSchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
});

export const explorePlaceTileSchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
  heroId: z.string().min(1),
  explorationCellId: z.string().min(1),
  tileId: z.string().min(1).optional(),
  boardX: z.number().int(),
  boardY: z.number().int(),
  rotation: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]),
});

export const useVortexSchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
  heroId: z.string().min(1),
  targetCellId: z.string().min(1),
});

export const takeEscalatorSchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
  heroId: z.string().min(1),
  targetCellId: z.string().min(1).optional(),
});

export const scenarioSelectSchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
  scenarioId: z.string().min(1),
});

export const difficultySelectSchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
  difficulty: z.enum(["Easy", "Normal", "Hard"] satisfies [DifficultyLevel, DifficultyLevel, DifficultyLevel]),
});

export const disableCameraSchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
  heroId: z.string().min(1),
  cameraCellId: z.string().min(1),
});

export const mageCrystalExploreSchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
  heroId: z.string().min(1),
  placements: z.array(
    z.object({
      explorationCellId: z.string().min(1),
      boardX: z.number().int(),
      boardY: z.number().int(),
      rotation: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]),
    }),
  ).min(1).max(2),
});

export const playAgainSchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
  keepScenario: z.boolean(),
  keepDifficulty: z.boolean(),
});

export const returnToLobbySchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
});

export const playerReadySchema = z.object({
  roomCode: z.string().min(6).max(6),
  playerId: z.string().min(1),
  isReady: z.boolean(),
});
