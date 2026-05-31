import { PointerEvent } from "react";
import { Hero, MazeCell } from "@/domain/game.types";
import { BoardGeometry, heroToScreen } from "../utils/boardGeometry";
import { getHeroDisplayName, getHeroPawnFallbackImage, getHeroPawnImage } from "../utils/heroVisuals";

export function HeroPawn({ hero, cell, geometry, selected, onSelect, onDragStart }: { hero: Hero; cell?: MazeCell; geometry: BoardGeometry; selected: boolean; onSelect: () => void; onDragStart?: (event: PointerEvent<HTMLButtonElement>) => void }) {
  if (!cell || hero.hasEscaped) return null;
  const pos = heroToScreen(cell, geometry);
  const pawnSize = Math.max(24, Math.min(56, geometry.cellSize * 0.54));
  return (
    <button
      className={`hero-token hero-token-${hero.heroType.toLowerCase()} ${selected ? "selected" : ""}`}
      style={{ left: pos.left, top: pos.top, width: pawnSize, height: pawnSize }}
      onPointerDown={(event) => {
        onSelect();
        onDragStart?.(event);
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      title={getHeroDisplayName(hero.heroType)}
      aria-label={getHeroDisplayName(hero.heroType)}
    >
      <img
        src={getHeroPawnImage(hero.heroType)}
        alt=""
        draggable={false}
        onError={(event) => {
          event.currentTarget.src = getHeroPawnFallbackImage(hero.heroType);
        }}
      />
    </button>
  );
}
