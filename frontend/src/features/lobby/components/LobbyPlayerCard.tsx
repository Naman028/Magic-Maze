import { Player } from "@/domain/game.types";

const AVATAR_COLORS = [
  "rgba(139,62,198,0.85)",
  "rgba(64,163,13,0.85)",
  "rgba(217,163,29,0.85)",
  "rgba(230,107,24,0.85)",
  "rgba(59,130,246,0.85)",
  "rgba(236,72,153,0.85)",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface Props { player: Player; isMe: boolean; }

export function LobbyPlayerCard({ player, isMe }: Props) {
  const bgColor = avatarColor(player.nickname);

  return (
    <article style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 14px",
      background: isMe ? "rgba(139,62,198,0.1)" : "rgba(255,255,255,0.035)",
      border: `1px solid ${isMe ? "rgba(192,132,252,0.4)" : "rgba(143,106,47,0.22)"}`,
      borderRadius: 12,
      boxShadow: isMe ? "0 0 18px rgba(192,132,252,0.12)" : "none",
    }}>
      {/* Avatar */}
      <div style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${bgColor}, rgba(0,0,0,0.4))`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: 16,
        color: "#fff",
        flexShrink: 0,
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}>
        {player.nickname.slice(0, 1).toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700,
          fontSize: 14,
          color: "#f4e6bf",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {player.nickname}
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 3,
          fontSize: 11,
          color: "#a89e94",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        }}>
          {player.isHost && (
            <span style={{
              padding: "1px 6px",
              background: "rgba(242,193,78,0.12)",
              border: "1px solid rgba(242,193,78,0.3)",
              borderRadius: 999,
              color: "#f2c14e",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}>
              Host
            </span>
          )}
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: player.isConnected ? "#65a30d" : "#ef4444",
              boxShadow: player.isConnected ? "0 0 5px rgba(101,163,13,0.8)" : "none",
              display: "inline-block",
              flexShrink: 0,
            }} />
            {player.isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Ready status */}
      <span style={{
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        color: player.isReady ? "#b9f66a" : "#d9a06a",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        {player.isReady ? "Ready ✓" : "Not ready"}
      </span>
    </article>
  );
}

export function OpenSlotCard() {
  return (
    <article style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 14px",
      background: "rgba(255,255,255,0.015)",
      border: "1px dashed rgba(143,106,47,0.2)",
      borderRadius: 12,
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(143,106,47,0.08)",
        border: "1px dashed rgba(143,106,47,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(143,106,47,0.4)" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span style={{
        fontSize: 13,
        color: "rgba(168,158,148,0.45)",
        fontStyle: "italic",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}>
        Open Slot
      </span>
    </article>
  );
}
