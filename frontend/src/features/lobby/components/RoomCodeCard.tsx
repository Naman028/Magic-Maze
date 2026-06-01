import { useState } from "react";
import { CardHeader } from "./LobbyRulesSummary";

export function RoomCodeCard({ roomCode }: { roomCode: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(roomCode).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section style={{
      background: "linear-gradient(180deg, rgba(18,10,28,0.97), rgba(10,7,18,0.99))",
      border: "1px solid rgba(143,106,47,0.48)",
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.025), 0 20px 48px rgba(0,0,0,0.4)",
    }}>
      <CardHeader label="Room Code" />

      <div style={{ padding: "16px 20px 20px", textAlign: "center" }}>
        {/* Large room code */}
        <div style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 900,
          letterSpacing: "0.14em",
          color: "#f2c14e",
          textShadow: "0 0 24px rgba(242,193,78,0.4)",
          lineHeight: 1,
          marginBottom: 18,
          userSelect: "all",
        }}>
          {roomCode}
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 20px",
            background: copied ? "rgba(101,163,13,0.15)" : "rgba(7,4,18,0.7)",
            border: `1px solid ${copied ? "rgba(101,163,13,0.55)" : "rgba(143,106,47,0.45)"}`,
            borderRadius: 10,
            color: copied ? "#d9f99d" : "#f4e6bf",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.borderColor = "rgba(242,193,78,0.55)";
              e.currentTarget.style.color = "#f2c14e";
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.borderColor = "rgba(143,106,47,0.45)";
              e.currentTarget.style.color = "#f4e6bf";
            }
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>
    </section>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
