import { GameSession } from "@/domain/game.types";

export function LobbyHeader({ session }: { session: GameSession }) {
  return (
    <header className="lobby-header">
      <div className="brand-mark compact">MAGIC<br /><span>MAZE</span></div>
      <div>
        <p>Room Lobby</p>
        <h1>{session.scenario.name}</h1>
      </div>
      <span className="status-pill">{session.communicationState.reason} / Open</span>
    </header>
  );
}
