import { GameSession } from "@/domain/game.types";
import { LobbyPlayerCard } from "./LobbyPlayerCard";

export function LobbyPlayerList({ session, playerId }: { session: GameSession; playerId?: string }) {
  return (
    <section className="panel">
      <h2>Players</h2>
      <div className="stack">
        {session.players.map((player) => <LobbyPlayerCard key={player.playerId} player={player} isMe={player.playerId === playerId} />)}
      </div>
    </section>
  );
}
