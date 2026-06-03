import { useMemo, useState } from "react";
import { CommunicationState, Player } from "@/domain/game.types";
import { emitters } from "@/services/socket/socketEmitters";
import { getDoSomethingFallbackImage, getDoSomethingImage } from "@/shared/utils/assetPaths";

export function CommunicationPanel({ communication, players, playerId }: { communication: CommunicationState; players: Player[]; playerId?: string }) {
  const targetPlayers = useMemo(() => players.filter((player) => !player.isSpectator && player.playerId !== playerId), [playerId, players]);
  const [targetMenuOpen, setTargetMenuOpen] = useState(false);

  const sendSignal = (targetPlayerId?: string) => {
    emitters.signal("Attention", undefined, targetPlayerId);
    setTargetMenuOpen(false);
  };

  return (
    <section className={`communication-panel ${communication.voiceAllowed ? "voice-on" : "voice-off"}`}>
      <span>{communication.voiceAllowed ? "VOICE ON" : "VOICE OFF"}</span>
      <div>
        <strong>{communication.voiceAllowed ? "Now you can talk" : "Now you cannot talk"}</strong>
      </div>
      <div className="do-something-control">
        <button className="signal-button do-something-button" onClick={() => setTargetMenuOpen((open) => !open)} title="Give Do Something to another player">
          <img
            src={getDoSomethingImage()}
            alt="Do Something"
            onError={(event) => {
              event.currentTarget.src = getDoSomethingFallbackImage();
            }}
          />
          Do Something
        </button>
        {targetMenuOpen && (
          <div className="do-something-menu" role="menu">
            {targetPlayers.length === 0 && (
              <button type="button" onClick={() => sendSignal()} role="menuitem">
                Team
              </button>
            )}
            {targetPlayers.map((player) => (
              <button key={player.playerId} type="button" onClick={() => sendSignal(player.playerId)} role="menuitem">
                {player.nickname}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
