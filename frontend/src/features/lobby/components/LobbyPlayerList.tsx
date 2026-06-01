import { GameSession } from "@/domain/game.types";
import { LobbyPlayerCard, OpenSlotCard } from "./LobbyPlayerCard";
import { CardHeader } from "./LobbyRulesSummary";

const MAX_PLAYERS = 4;

interface Props {
  session: GameSession;
  playerId?: string;
}

export function LobbyPlayerList({ session, playerId }: Props) {
  const activePlayers = session.players.filter((p) => !p.isSpectator);
  const isSolo = activePlayers.length === 1;
  const emptySlots = isSolo ? 0 : Math.max(0, MAX_PLAYERS - activePlayers.length);

  return (
    <section style={{
      background: "linear-gradient(180deg, rgba(18,10,28,0.97), rgba(10,7,18,0.99))",
      border: "1px solid rgba(143,106,47,0.48)",
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.025), 0 20px 48px rgba(0,0,0,0.4)",
    }}>
      {/* Header */}
      <CardHeader label={`Players${!isSolo ? ` (${activePlayers.length}/${MAX_PLAYERS})` : ""}`} />

      <div style={{ padding: "12px 14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Player cards */}
        {activePlayers.map((player) => (
          <LobbyPlayerCard
            key={player.playerId}
            player={player}
            isMe={player.playerId === playerId}
          />
        ))}

        {/* Open slot placeholders (multiplayer only) */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <OpenSlotCard key={`open-${i}`} />
        ))}

        {/* Solo mode note */}
        {isSolo && (
          <div style={{
            marginTop: 8,
            padding: "10px 12px",
            background: "rgba(139,62,198,0.07)",
            border: "1px solid rgba(139,62,198,0.2)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
            </svg>
            <span style={{
              fontSize: 12,
              color: "#c084fc",
              fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            }}>
              Solo room active — only you can start the game.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
