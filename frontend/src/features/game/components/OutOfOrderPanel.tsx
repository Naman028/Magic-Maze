import { GameSession } from "@/domain/game.types";
import { getUsedTokenFallbackImage, getUsedTokenImage } from "@/shared/utils/assetPaths";

export function OutOfOrderPanel({ session }: { session: GameSession }) {
  return (
    <section className="side-board-card">
      <h2>OUT OF ORDER</h2>
      <div className="used-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <img
            key={index}
            src={getUsedTokenImage()}
            alt="used"
            className={index < session.sandTimer.usedSandTimerCellIds.length ? "used-token visible" : "used-token"}
            onError={(event) => {
              event.currentTarget.src = getUsedTokenFallbackImage();
            }}
          />
        ))}
      </div>
    </section>
  );
}
