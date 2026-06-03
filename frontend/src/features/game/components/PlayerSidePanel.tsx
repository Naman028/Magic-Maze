import { GameSession } from "@/domain/game.types";
import { PlayerStatusCard } from "./PlayerStatusCard";

export function PlayerSidePanel({ session, playerId, side }: { session: GameSession; playerId?: string; side: "left" | "right" | "all" }) {
  const midpoint = Math.ceil(session.players.length / 2);
  const players = side === "all" ? session.players : side === "left" ? session.players.slice(0, midpoint) : session.players.slice(midpoint);
  const offset = side === "right" ? midpoint : 0;
  const latestDoSomethingTargetId = [...session.communicationState.signals]
    .reverse()
    .find((signal) => signal.signalType === "Attention" && signal.targetPlayerId)?.targetPlayerId;

  return (
    <aside className="player-side">
      {players.map((player, index) => (
        <PlayerStatusCard
          key={player.playerId}
          player={player}
          visualHeroType={session.heroes[(offset + index) % session.heroes.length]?.heroType}
          isMe={player.playerId === playerId}
          hasDoSomethingSignal={latestDoSomethingTargetId === player.playerId}
        />
      ))}
    </aside>
  );
}
