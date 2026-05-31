import { Guard, MazeCell } from "@/domain/game.types";
import { BoardGeometry, heroToScreen } from "../utils/boardGeometry";

export function GuardPawn({ guard, cell, geometry }: { guard: Guard; cell?: MazeCell; geometry: BoardGeometry }) {
  if (!cell || !guard.isActive) return null;
  const pos = heroToScreen(cell, geometry);
  const size = Math.max(24, Math.min(42, geometry.cellSize * 0.7));
  return (
    <div
      className="guard-token"
      style={{ left: pos.left - size / 2, top: pos.top - size / 2, width: size, height: size }}
      title={guard.guardId}
    >
      !
    </div>
  );
}
