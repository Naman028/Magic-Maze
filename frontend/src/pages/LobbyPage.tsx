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
  const me = session?.players.find((player) => player.playerId === playerId);

  useEffect(() => {
    fetch(`${BACKEND_URL}/scenarios`).then((response) => response.json()).then((data) => setScenarios(data.scenarios ?? [])).catch(() => undefined);
  }, [setScenarios]);

  useEffect(() => {
    if (session && ["InProgress", "Escape", "Victory", "Defeat", "PostGame"].includes(session.status)) navigate(`/game/${session.roomCode}`);
  }, [navigate, session]);

  if (!session) {
    return <main className="center-page"><div className="panel">No room loaded. Create or join a room from the landing page.</div></main>;
  }

  return (
    <div className="app-shell">
      <LobbyHeader session={session} />
      <main className="lobby-grid">
        <RoomCodeCard roomCode={session.roomCode} />
        <section className="panel lobby-config">
          <h2>Game Setup</h2>
          <ScenarioSelector scenarios={scenarios.length ? scenarios : [session.scenario]} selectedId={session.scenario.scenarioId} disabled={!me?.isHost} />
          <DifficultySelector value={session.difficultySettings.difficulty} disabled={!me?.isHost} />
          <div className="button-row">
            <ReadyToggle player={me} />
            <StartGameButton isHost={Boolean(me?.isHost)} />
          </div>
        </section>
        <LobbyPlayerList session={session} playerId={playerId} />
        <LobbyRulesSummary session={session} />
      </main>
    </div>
  );
}
