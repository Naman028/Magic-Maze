import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "@/services/socket/socketClient";
import { useGameStore } from "@/app/stores/useGameStore";
import { useLobbyStore } from "@/app/stores/useLobbyStore";
import { DifficultySelector } from "@/features/lobby/components/DifficultySelector";
import { LobbyHeader } from "@/features/lobby/components/LobbyHeader";
import { LobbyPlayerList } from "@/features/lobby/components/LobbyPlayerList";
import { LobbyRulesSummary } from "@/features/lobby/components/LobbyRulesSummary";
import { ReadyToggle } from "@/features/lobby/components/ReadyToggle";
import { RoomCodeCard } from "@/features/lobby/components/RoomCodeCard";
import { ScenarioSelector } from "@/features/lobby/components/ScenarioSelector";
import { StartGameButton } from "@/features/lobby/components/StartGameButton";

export function LobbyPage() {
  const navigate = useNavigate();
  const { session, playerId } = useGameStore();
  const { scenarios, setScenarios } = useLobbyStore();
  const me = session?.players.find((p) => p.playerId === playerId);

  useEffect(() => {
    fetch(`${BACKEND_URL}/scenarios`)
      .then((r) => r.json())
      .then((d) => setScenarios(d.scenarios ?? []))
      .catch(() => undefined);
  }, [setScenarios]);

  useEffect(() => {
    if (session && ["InProgress", "Escape", "Victory", "Defeat", "PostGame"].includes(session.status)) {
      navigate(`/game/${session.roomCode}`);
    }
  }, [navigate, session]);

  if (!session) {
    return (
      <main className="center-page">
        <div className="panel">No room loaded. Create or join a room from the landing page.</div>
      </main>
    );
  }

  return (
    <div className="app-shell lv2-shell">
      <LobbyHeader session={session} />

      <main className="lv2-grid">
        {/* ── Left column: Room Code + Rules Preview ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <RoomCodeCard roomCode={session.roomCode} />
          <LobbyRulesSummary scenario={session.scenario} />
        </div>

        {/* ── Center column: Game Setup ── */}
        <section style={{
          background: "linear-gradient(180deg, rgba(18,10,28,0.97), rgba(10,7,18,0.99))",
          border: "1px solid rgba(143,106,47,0.48)",
          borderRadius: 18,
              overflow: "visible",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.025), 0 20px 48px rgba(0,0,0,0.4)",
        }}>
          {/* Panel title */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 24px 14px",
            borderBottom: "1px solid rgba(143,106,47,0.18)",
          }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(143,106,47,0.45))" }} />
            <span style={{ color: "#f2c14e", fontSize: 10 }}>◆</span>
            <span style={{
              color: "#f2c14e",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            }}>
              Game Setup
            </span>
            <span style={{ color: "#f2c14e", fontSize: 10 }}>◆</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(143,106,47,0.45))" }} />
          </div>

          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Scenario */}
            <div>
              <label style={{
                display: "block",
                marginBottom: 8,
                fontSize: 12,
                fontWeight: 600,
                color: "#a89e94",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
              }}>
                Scenario
              </label>
              <ScenarioSelector
                scenarios={scenarios.length ? scenarios : [session.scenario]}
                selectedId={session.scenario.scenarioId}
                disabled={!me?.isHost}
              />
            </div>

            {/* Difficulty */}
            <div>
              <label style={{
                display: "block",
                marginBottom: 8,
                fontSize: 12,
                fontWeight: 600,
                color: "#a89e94",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
              }}>
                Difficulty
              </label>
              <DifficultySelector
                value={session.difficultySettings.difficulty}
                disabled={!me?.isHost}
              />
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(143,106,47,0.18)" }} />

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <ReadyToggle player={me} />
              <StartGameButton isHost={Boolean(me?.isHost)} />
            </div>
          </div>
        </section>

        {/* ── Right column: Players ── */}
        <LobbyPlayerList session={session} playerId={playerId} />
      </main>
    </div>
  );
}
