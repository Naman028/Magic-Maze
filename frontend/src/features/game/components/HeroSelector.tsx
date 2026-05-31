import { GameSession } from "@/domain/game.types";
import { useGameStore } from "@/app/stores/useGameStore";
import { emitters } from "@/services/socket/socketEmitters";
import { heroTheme } from "@/shared/constants/heroes";
import { getHeroCharacterFallbackImage, getHeroCharacterImage, getHeroDisplayName } from "../utils/heroVisuals";

export function HeroSelector({ session }: { session: GameSession }) {
  const { selectedHeroId, setSelectedHeroId, setDraggingHeroId } = useGameStore();

  const selectHero = (heroId: string) => {
    setSelectedHeroId(heroId);
    emitters.legalMoves(heroId);
  };

  return (
    <section className="hero-selector">
      {session.heroes.map((hero) => {
        const theme = heroTheme[hero.heroType];
        return (
          <button
            key={hero.heroId}
            className={selectedHeroId === hero.heroId ? "selected" : ""}
            onPointerDown={() => {
              selectHero(hero.heroId);
              setDraggingHeroId(hero.heroId);
            }}
            onClick={() => {
              selectHero(hero.heroId);
            }}
            style={{ borderColor: theme.color }}
          >
            <img
              src={getHeroCharacterImage(hero.heroType)}
              alt=""
              className="hero-selector-img"
              onError={(event) => {
                event.currentTarget.src = getHeroCharacterFallbackImage(hero.heroType);
              }}
            />
            {getHeroDisplayName(hero.heroType)}
          </button>
        );
      })}
    </section>
  );
}
