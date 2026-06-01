import { Player } from "@/domain/game.types";
import { emitters } from "@/services/socket/socketEmitters";

export function ReadyToggle({ player }: { player?: Player }) {
  const isReady = player?.isReady ?? false;
  return (
    <button
      className="purple-button"
      disabled={!player}
      onClick={() => emitters.ready(!isReady)}
      style={{
        flex: 1,
        padding: "12px 16px",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: isReady ? "rgba(101,163,13,0.15)" : "rgba(139,62,198,0.14)",
        borderColor: isReady ? "rgba(101,163,13,0.5)" : undefined,
        color: isReady ? "#d9f99d" : undefined,
        borderRadius: 12,
        transition: "all 0.2s",
      }}
    >
      {isReady ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Ready
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
          Ready Up
        </>
      )}
    </button>
  );
}
