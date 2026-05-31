import { Player } from "@/domain/game.types";

export function LobbyPlayerCard({ player, isMe }: { player: Player; isMe: boolean }) {
  return (
    <article className={`lobby-player ${isMe ? "is-me" : ""}`}>
      <div className="avatar">{player.nickname.slice(0, 1).toUpperCase()}</div>
      <div>
        <strong>{player.nickname}</strong>
        <p>{player.isHost ? "Host" : "Player"} · {player.isConnected ? "Connected" : "Disconnected"}</p>
      </div>
      <span className={player.isReady ? "ready-dot" : "not-ready-dot"}>{player.isReady ? "Ready" : "Not ready"}</span>
    </article>
  );
}
