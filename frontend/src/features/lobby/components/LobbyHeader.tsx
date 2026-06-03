import { GameSession } from "@/domain/game.types";
import { getMagicMazeLogoImage } from "@/shared/utils/assetPaths";

interface Props { session: GameSession; onHome?: () => void; }

export function LobbyHeader({ session, onHome }: Props) {
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
      <img className="brand-logo brand-logo-lobby" src={getMagicMazeLogoImage()} alt="Magic Maze Online" />

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

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexShrink: 0,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontSize: 13,
        color: "#a89e94",
      }}>
        {onHome && (
          <button type="button" className="lobby-home-button" onClick={onHome} aria-label="Back to home">
            <HomeIcon />
            <span>Home</span>
          </button>
        )}
        <span style={{ marginLeft: onHome ? 6 : 0 }}>Lobby</span>
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

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10v10h14V10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20v-6h6v6" />
    </svg>
  );
}
