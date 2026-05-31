import { GameSession } from "@/domain/game.types";
import { PostGameControls } from "./PostGameControls";

export function ResultOverlay({ session, isHost }: { session: GameSession; isHost: boolean }) {
  if (!["Victory", "Defeat", "PostGame"].includes(session.status) && !session.result) return null;
  return (
    <div className="result-overlay">
      <section className="result-card">
        <h1>{session.result?.outcome ?? session.status}</h1>
        <p>{session.result?.reason ?? "Game ended."}</p>
        <div className="result-stats">
          <span>Time: {session.result?.timeRemaining ?? session.sandTimer.remainingSeconds}s</span>
          <span>Escaped: {session.result?.heroesEscaped ?? session.heroes.filter((hero) => hero.hasEscaped).length}</span>
          <span>Tiles: {session.result?.tilesPlaced ?? session.placedTiles.length}</span>
          <span>Timers: {session.result?.timerSpacesUsed ?? session.sandTimer.usedSandTimerCellIds.length}</span>
        </div>
        <PostGameControls isHost={isHost} />
      </section>
    </div>
  );
}
