import { z } from "zod";

export const roomCreateSchema = z.object({
  nickname: z.string().min(1),
  socketId: z.string().optional(),
});

export const roomJoinSchema = z.object({
  roomCode: z.string().min(6).max(6),
  nickname: z.string().min(1),
  socketId: z.string().optional(),
});

