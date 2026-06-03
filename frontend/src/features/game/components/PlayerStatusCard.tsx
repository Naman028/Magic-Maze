import { HeroType, Player } from "@/domain/game.types";
import { getDoSomethingImage } from "@/shared/utils/assetPaths";
import { getHeroDisplayName, getHeroPlayerCardImage } from "../utils/heroVisuals";
import { ActionCardImage } from "./ActionCardImage";

export function PlayerStatusCard({
  player,
  visualHeroType,
  isMe,
  hasDoSomethingSignal,
}: {
  player: Player;
  visualHeroType?: HeroType;
  isMe: boolean;
  hasDoSomethingSignal?: boolean;
}) {
  const heroName = visualHeroType ? getHeroDisplayName(visualHeroType) : "Shared Heroes";
  const statusLabel = player.isReady ? "Ready" : player.isConnected ? "Connected" : "Disconnected";

  return (
    <article className={`player-card ${isMe ? "current-player" : ""}`}>
      {visualHeroType && <img className="player-avatar-art" src={getHeroPlayerCardImage(visualHeroType)} alt="" />}
      <div className="player-card-info">
        <strong>{player.nickname}</strong>
        <p>
          {player.isHost ? "Host" : "Player"} - {heroName}
          {player.isSpectator ? " - Spectator" : ""}
        </p>
        <small className={player.isReady ? "ready-text" : "offline-text"}>{statusLabel}</small>
      </div>
      <div className="player-card-action-area" aria-label={isMe ? "Your action card" : "Player action card"}>
        <ActionCardImage imageKey={player.assignedActionCard?.imageKey} label={player.assignedActionCard?.label} fallback="deck" />
      </div>
      {hasDoSomethingSignal && (
        <div className="do-something-marker" title="Do Something">
          <img src={getDoSomethingImage()} alt="" />
          <span>Do Something</span>
        </div>
      )}
    </article>
  );
}
