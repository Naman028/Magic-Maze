import { emitters } from "@/services/socket/socketEmitters";

export function StartGameButton({ isHost }: { isHost: boolean }) {
  return (
    <button
      className="gold-button"
      disabled={!isHost}
      onClick={() => emitters.startGame()}
      style={{
        flex: 1,
        padding: "12px 16px",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontWeight: 800,
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 12,
        opacity: !isHost ? 0.45 : 1,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
      {isHost ? "Start Game" : "Waiting for host"}
    </button>
  );
}
