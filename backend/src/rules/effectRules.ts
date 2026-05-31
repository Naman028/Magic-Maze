import { GameEffectPayload, GameSession } from "../game/gameTypes.js";

export function addEffect(session: GameSession, effect: Omit<GameEffectPayload, "roomCode">): GameEffectPayload {
  const payload = { roomCode: session.roomCode, ...effect };
  session.effectLog.push(payload);
  return payload;
}

