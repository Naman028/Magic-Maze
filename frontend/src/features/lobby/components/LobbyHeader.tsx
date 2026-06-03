import { GameSession } from "@/domain/game.types";

interface Props { session: GameSession; }

export function LobbyHeader({ session }: Props) {
  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      gap: 0,
      minHeight: 76,
      padding: "0 clamp(14px, 2.6vw, 44px)",
      background: "rgba(9, 6, 18, 0.92)",
      backdropFilter: "blur(14px)",
      borderBottom: "1px solid rgba(174,130,52,0.38)",
      boxShadow: "0 1px 0 rgba(242,193,78,0.06)",
    }}>
      {/* Brand mark */}
      <div style={{
        fontFamily: "Georgia, 'Palatino Linotype', serif",
        lineHeight: 0.82,
        textAlign: "center",
        textShadow: "0 0 14px rgba(196,137,255,0.4)",
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 12, fontWeight: 900, color: "#f5e3b8", letterSpacing: "0.08em" }}>MAGIC</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#f2c14e", letterSpacing: "-0.01em" }}>MAZE</div>
        <div style={{ fontSize: 9, color: "#a89e94", letterSpacing: "0.14em", marginTop: 4 }}>ONLINE</div>
      </div>

      {/* Gold vertical divider */}
      <div style={{
        width: 1,
        height: 40,
        background: "linear-gradient(to bottom, transparent, rgba(143,106,47,0.55), transparent)",
        margin: "0 24px",
        flexShrink: 0,
      }} />

      {/* Title block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#a89e94",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        }}>
          Room Lobby
        </div>
        <div style={{
          fontSize: 22,
          fontWeight: 800,
          color: "#f4e6bf",
          fontFamily: "Georgia, 'Palatino Linotype', serif",
          letterSpacing: "-0.01em",
          lineHeight: 1.15,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {session.scenario.name}
        </div>
      </div>

      {/* Status breadcrumb */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexShrink: 0,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontSize: 13,
        color: "#a89e94",
      }}>
        <span>Lobby</span>
        <span style={{ color: "rgba(143,106,47,0.5)" }}>/</span>
        <span style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          color: "#d9f99d",
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#65a30d",
            boxShadow: "0 0 5px rgba(101,163,13,0.8)",
            display: "inline-block",
          }} />
          Open
        </span>
      </div>
    </header>
  );
}
