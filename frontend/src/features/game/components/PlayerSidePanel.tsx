import { GameSession } from "@/domain/game.types";
import { PlayerStatusCard } from "./PlayerStatusCard";

export function PlayerSidePanel({ session, playerId, side }: { session: GameSession; playerId?: string; side: "left" | "right" }) {
  const midpoint = Math.ceil(session.players.length / 2);
  const players = side === "left" ? session.players.slice(0, midpoint) : session.players.slice(midpoint);
  const offset = side === "left" ? 0 : midpoint;
  return (
    <aside className="player-side">
      {players.map((player, index) => (
        <PlayerStatusCard
          key={player.playerId}
          player={player}
          visualHeroType={session.heroes[(offset + index) % session.heroes.length]?.heroType}
          isMe={player.playerId === playerId}
        />
      ))}
    </aside>
  );
}
