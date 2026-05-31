import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ActionPanel } from "@/features/game/components/ActionPanel";
import { BoardArea } from "@/features/game/components/BoardArea";
import { CommunicationPanel } from "@/features/game/components/CommunicationPanel";
import { GameLayout } from "@/features/game/components/GameLayout";
import { GameTopBar } from "@/features/game/components/GameTopBar";
import { HeroSelector } from "@/features/game/components/HeroSelector";
import { MazeBoard } from "@/features/game/components/MazeBoard";
import { OutOfOrderPanel } from "@/features/game/components/OutOfOrderPanel";
import { PlayerSidePanel } from "@/features/game/components/PlayerSidePanel";
import { ResultOverlay } from "@/features/game/components/ResultOverlay";
import { TheftPanel } from "@/features/game/components/TheftPanel";
import { TimerPanel } from "@/features/game/components/TimerPanel";
import { useGameStore } from "@/app/stores/useGameStore";
import { useUiStore } from "@/app/stores/useUiStore";

export function GamePage() {
  const navigate = useNavigate();
  const { session, playerId } = useGameStore();
  const lastError = useUiStore((state) => state.lastError);
  const me = session?.players.find((player) => player.playerId === playerId);
  const isSolo = session?.players.filter((player) => !player.isSpectator).length === 1;

  useEffect(() => {
    document.body.classList.add("game-active");
    document.documentElement.classList.add("game-active");
    return () => {
      document.body.classList.remove("game-active");
      document.documentElement.classList.remove("game-active");
    };
  }, []);

  useEffect(() => {
    if (session?.status === "Waiting") navigate(`/lobby/${session.roomCode}`);
  }, [navigate, session]);

  if (!session) {
    return <main className="center-page"><div className="panel">No game loaded. Create or join a room first.</div></main>;
  }

  return (
    <GameLayout>
      <GameTopBar session={session} />
      {lastError && <div className="toast-error">{lastError}</div>}
      <main className={`game-grid ${isSolo ? "solo-game-grid" : "multiplayer-game-grid"}`}>
        <PlayerSidePanel session={session} playerId={playerId} side="left" />
        <BoardArea>
          <div className="timer-row">
            <TimerPanel sandTimer={session.sandTimer} />
            <CommunicationPanel communication={session.communicationState} />
          </div>
          <div className="board-stage">
            <MazeBoard session={session} />
          </div>
          <HeroSelector session={session} />
          <ActionPanel session={session} playerId={playerId} />
        </BoardArea>
        <aside className="right-column">
          <PlayerSidePanel session={session} playerId={playerId} side="right" />
          <div className="board-side-stack">
            <TheftPanel session={session} />
            <OutOfOrderPanel session={session} />
          </div>
        </aside>
      </main>
      <ResultOverlay session={session} isHost={Boolean(me?.isHost)} />
    </GameLayout>
  );
}
