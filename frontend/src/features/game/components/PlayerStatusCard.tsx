import { HeroType, Player } from "@/domain/game.types";
import { getHeroDisplayName, getHeroPlayerCardImage } from "../utils/heroVisuals";
import { ActionCardImage } from "./ActionCardImage";

export function PlayerStatusCard({ player, visualHeroType, isMe }: { player: Player; visualHeroType?: HeroType; isMe: boolean }) {
  const heroName = visualHeroType ? getHeroDisplayName(visualHeroType) : "Shared Heroes";

  return (
    <article className={`player-card ${isMe ? "current-player" : ""}`}>
      {visualHeroType && <img className="player-card-art" src={getHeroPlayerCardImage(visualHeroType)} alt="" />}
      <div className="player-head">
        <div className="avatar">{player.nickname.slice(0, 1).toUpperCase()}</div>
        <div>
          <strong>{player.nickname}</strong>
          <p>{player.isHost ? "Host" : "Player"} · {heroName} {player.isSpectator ? "· Spectator" : ""}</p>
          <small className={player.isReady ? "ready-text" : "offline-text"}>● {player.isReady ? "Ready" : player.isConnected ? "Connected" : "Disconnected"}</small>
        </div>
      </div>
      <span className="your-action">{isMe ? "YOUR ACTION" : "ACTION"}</span>
      <ActionCardImage imageKey={player.assignedActionCard?.imageKey} label={player.assignedActionCard?.label} />
      <p className="card-label">{player.assignedActionCard?.label ?? "Waiting for start"}</p>
    </article>
  );
}
