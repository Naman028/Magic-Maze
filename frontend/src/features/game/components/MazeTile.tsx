import { PlacedTile } from "@/domain/game.types";
import { getMazeTileImage } from "@/shared/utils/assetPaths";
import { BoardGeometry, tileToScreen } from "../utils/boardGeometry";

export function MazeTile({ tile, geometry }: { tile: PlacedTile; geometry: BoardGeometry }) {
  const pos = tileToScreen(tile, geometry);
  return (
    <img
      className="maze-tile"
      src={getMazeTileImage(tile.imageKey)}
      alt={tile.tileId}
      style={{
        width: pos.width,
        height: pos.height,
        left: pos.left,
        top: pos.top,
        transform: `rotate(${tile.rotation}deg)`,
      }}
    />
  );
}
