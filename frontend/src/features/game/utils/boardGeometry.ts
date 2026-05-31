import { GameSession, MazeCell, PlacedTile } from "@/domain/game.types";

export const BACKEND_TILE_GRID_SIZE = 4;
export type BoardBoundsMode = "tiles" | "cells";

export function getCellSize(tileSize: number) {
  return tileSize / BACKEND_TILE_GRID_SIZE;
}

export interface BoardGeometry {
  tileSize: number;
  cellSize: number;
  originCellX: number;
  originCellY: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

export function calculateBoardGeometry(session: GameSession, tileSize: number, mode: BoardBoundsMode = "tiles"): BoardGeometry {
  const cells = Object.values(session.board.cells ?? {});
  const placedTiles = session.placedTiles ?? [];
  const paddingCells = 8;
  const cellSize = getCellSize(tileSize);
  const projectedRects = [
    ...placedTiles.map((tile) => {
      const pos = projectTileOrigin(tile.boardX, tile.boardY, cellSize);
      return { left: pos.left, top: pos.top, right: pos.left + tileSize, bottom: pos.top + tileSize };
    }),
    ...cells.map((cell) => {
      const pos = projectCell(cell, cellSize);
      return { left: pos.left, top: pos.top, right: pos.left + pos.width, bottom: pos.top + pos.height };
    }),
  ];

  if (projectedRects.length > 0) {
    const padding = paddingCells * cellSize;
    const minLeft = Math.min(...projectedRects.map((rect) => rect.left)) - padding;
    const minTop = Math.min(...projectedRects.map((rect) => rect.top)) - padding;
    const maxRight = Math.max(...projectedRects.map((rect) => rect.right)) + padding;
    const maxBottom = Math.max(...projectedRects.map((rect) => rect.bottom)) + padding;

    return {
      tileSize,
      cellSize,
      originCellX: 0,
      originCellY: 0,
      width: maxRight - minLeft,
      height: maxBottom - minTop,
      offsetX: -minLeft,
      offsetY: -minTop,
    };
  }

  if (mode === "tiles" && placedTiles.length > 0) {
    const minTileBoardX = Math.min(...placedTiles.map((tile) => tile.boardX));
    const minTileBoardY = Math.min(...placedTiles.map((tile) => tile.boardY));
    const maxTileBoardX = Math.max(...placedTiles.map((tile) => tile.boardX + BACKEND_TILE_GRID_SIZE));
    const maxTileBoardY = Math.max(...placedTiles.map((tile) => tile.boardY + BACKEND_TILE_GRID_SIZE));
    return {
      tileSize,
      cellSize,
      originCellX: minTileBoardX - paddingCells,
      originCellY: minTileBoardY - paddingCells,
      width: (maxTileBoardX - minTileBoardX + paddingCells * 2) * cellSize,
      height: (maxTileBoardY - minTileBoardY + paddingCells * 2) * cellSize,
      offsetX: 0,
      offsetY: 0,
    };
  }

  const cellXs = cells.flatMap((cell) => [cell.x, cell.x + 1]);
  const cellYs = cells.flatMap((cell) => [cell.y, cell.y + 1]);
  const minCellX = Math.min(0, ...cellXs);
  const minCellY = Math.min(0, ...cellYs);
  const maxCellX = Math.max(BACKEND_TILE_GRID_SIZE, ...cellXs);
  const maxCellY = Math.max(BACKEND_TILE_GRID_SIZE, ...cellYs);
  return {
    tileSize,
    cellSize,
    originCellX: minCellX - paddingCells,
    originCellY: minCellY - paddingCells,
    width: (maxCellX - minCellX + paddingCells * 2) * cellSize,
    height: (maxCellY - minCellY + paddingCells * 2) * cellSize,
    offsetX: 0,
    offsetY: 0,
  };
}

export function cellToScreen(cell: MazeCell, geometry: BoardGeometry) {
  const projected = projectCell(cell, geometry.cellSize);
  return {
    left: projected.left + geometry.offsetX,
    top: projected.top + geometry.offsetY,
    width: projected.width,
    height: projected.height,
  };
}

export function tileToScreen(tile: PlacedTile, geometry: BoardGeometry) {
  const projected = projectTileOrigin(tile.boardX, tile.boardY, geometry.cellSize);
  return {
    left: projected.left + geometry.offsetX,
    top: projected.top + geometry.offsetY,
    width: geometry.tileSize,
    height: geometry.tileSize,
  };
}

export function heroToScreen(cell: MazeCell, geometry: BoardGeometry) {
  return {
    left: (cell.x + 0.5) * geometry.cellSize + geometry.offsetX,
    top: (cell.y + 0.5) * geometry.cellSize + geometry.offsetY,
  };
}

function projectTileOrigin(boardX: number, boardY: number, cellSize: number) {
  return {
    left: boardX * cellSize,
    top: boardY * cellSize,
  };
}

function projectCell(cell: MazeCell, cellSize: number) {
  return {
    left: cell.x * cellSize,
    top: cell.y * cellSize,
    width: cellSize,
    height: cellSize,
  };
}
