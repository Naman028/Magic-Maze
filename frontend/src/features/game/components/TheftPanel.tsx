import { GameSession } from "@/domain/game.types";
import { getHeroTokenFallbackImage, getHeroTokenImage, getTheftObjectiveImage } from "@/shared/utils/assetPaths";

export function TheftPanel({ session }: { session: GameSession }) {
  const theftActive = session.status === "Escape" || session.heroes.some((hero) => hero.hasItem);
  return (
    <section className="side-board-card">
      <h2>THEFT</h2>
      <img
        className={`theft-objective-card ${theftActive ? "active" : ""}`}
        src={getTheftObjectiveImage(theftActive)}
        alt={theftActive ? "Vortex blocked after theft" : "Vortex available before theft"}
      />
      <div className="hero-mini-row">
        {session.heroes.map((hero) => (
          <img
            key={hero.heroId}
            src={getHeroTokenImage(hero.heroType)}
            alt={hero.heroType}
            className={`hero-emblem-token ${hero.hasEscaped ? "escaped" : ""}`}
            onError={(event) => {
              event.currentTarget.src = getHeroTokenFallbackImage(hero.heroType);
            }}
          />
        ))}
      </div>
    </section>
  );
}
