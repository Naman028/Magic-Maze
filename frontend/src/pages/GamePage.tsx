import { useEffect, useState } from "react";
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
import { socket } from "@/services/socket/socketClient";

export function GamePage() {
  const navigate = useNavigate();
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
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

  const leaveGame = () => {
    useGameStore.getState().clearSession();
    socket.disconnect();
    socket.connect();
    navigate("/");
  };

  if (!session) {
    return <main className="center-page"><div className="panel">No game loaded. Create or join a room first.</div></main>;
  }

  return (
    <GameLayout>
      <GameTopBar session={session} onLeaveGame={() => setLeaveConfirmOpen(true)} />
      {lastError && <div className="toast-error">{lastError}</div>}
      <main className={`game-grid ${isSolo ? "solo-game-grid" : "multiplayer-game-grid"}`}>
        <PlayerSidePanel session={session} playerId={playerId} side="all" />
        <BoardArea>
          <div className="timer-row">
            <TimerPanel sandTimer={session.sandTimer} />
            <CommunicationPanel communication={session.communicationState} players={session.players} playerId={playerId} />
          </div>
          <div className="board-stage">
            <MazeBoard session={session} />
          </div>
          <div className="action-dock">
            <HeroSelector session={session} />
            <ActionPanel session={session} playerId={playerId} />
          </div>
        </BoardArea>
        <aside className="right-column">
          <div className="board-side-stack">
            <TheftPanel session={session} />
            <OutOfOrderPanel session={session} />
          </div>
        </aside>
      </main>
      <ResultOverlay session={session} isHost={Boolean(me?.isHost)} />
      {leaveConfirmOpen && (
        <div className="confirm-overlay" role="presentation" onMouseDown={() => setLeaveConfirmOpen(false)}>
          <section
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-game-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="confirm-dialog-icon">
              <BackArrowIcon />
            </div>
            <div className="confirm-dialog-copy">
              <h2 id="leave-game-title">Leave Game?</h2>
              <p>Your seat will be marked offline, but the room will keep running for the other players. You can rejoin from this browser while the room is still active.</p>
            </div>
            <div className="confirm-dialog-actions">
              <button className="ghost-button" type="button" onClick={() => setLeaveConfirmOpen(false)}>
                Stay
              </button>
              <button className="gold-button danger-confirm-button" type="button" onClick={leaveGame}>
                Leave Game
              </button>
            </div>
          </section>
        </div>
      )}
    </GameLayout>
  );
}

function BackArrowIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 5-7 7 7 7" />
    </svg>
  );
}
