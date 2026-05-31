import { MazeCell } from "@/domain/game.types";
import { BoardGeometry, cellToScreen } from "../utils/boardGeometry";

export function MazeCellOverlay({
  cell,
  geometry,
  reachable,
  invalid,
  selected,
  vortexTarget,
  escalatorTarget,
  onPointerEnter,
  onClick,
}: {
  cell: MazeCell;
  geometry: BoardGeometry;
  reachable: boolean;
  invalid?: boolean;
  selected: boolean;
  vortexTarget?: boolean;
  escalatorTarget?: boolean;
  onPointerEnter?: () => void;
  onClick: () => void;
}) {
  const rect = cellToScreen(cell, geometry);
  return (
    <button
      className={`cell-overlay ${reachable ? "reachable" : ""} ${invalid ? "invalid" : ""} ${selected ? "selected" : ""} ${vortexTarget ? "vortex-target" : ""} ${escalatorTarget ? "escalator-target" : ""} cell-${cell.type.toLowerCase()}`}
      data-cell-id={cell.cellId}
      style={rect}
      onPointerEnter={onPointerEnter}
      onClick={onClick}
      title={`${cell.type} ${cell.cellId}`}
      aria-label={`${cell.type} ${cell.cellId}`}
    />
  );
}
