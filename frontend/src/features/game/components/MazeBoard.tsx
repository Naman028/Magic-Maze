import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, WheelEvent } from "react";
import { Direction, GameSession, MazeCell } from "@/domain/game.types";
import { useGameStore } from "@/app/stores/useGameStore";
import { emitters } from "@/services/socket/socketEmitters";
import { getMazeTileImage, getUsedTokenImage } from "@/shared/utils/assetPaths";
import { getCellById, getEscalatorGroupId } from "../utils/boardRules";
import { HeroPawn } from "./HeroPawn";
import { MazeCellOverlay } from "./MazeCellOverlay";
import { MazeTile } from "./MazeTile";
import { calculateBoardGeometry, cellToScreen, tileToScreen } from "../utils/boardGeometry";
import { GuardPawn } from "./GuardPawn";
import { useResponsiveTileSize } from "../hooks/useResponsiveTileSize";
import { placementFromExploration } from "../utils/explorationPlacement";

export function MazeBoard({ session }: { session: GameSession }) {
  const {
    selectedHeroId,
    playerId,
    draggingHeroId,
    pendingMoveDirection,
    vortexMode,
    legalMoveTargets,
    pendingTilePlacement,
    setSelectedHeroId,
    setPendingMoveDirection,
    setVortexMode,
    setPendingTilePlacement,
    setDraggingHeroId,
    updatePendingTilePlacement,
  } = useGameStore();
  const [hoveredCellId, setHoveredCellId] = useState<string | undefined>();
  const [isPanning, setIsPanning] = useState(false);
  const [zoom, setZoom] = useState(0.82);
  const scrollRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number; pointerId: number } | undefined>();
  const lastCenteredSignatureRef = useRef<string | undefined>();
  const baseTileSize = useResponsiveTileSize();
  const tileSize = baseTileSize * zoom;
  const cells = Object.values(session.board.cells);
  const placedTileSignature = useMemo(
    () => session.placedTiles.map((tile) => `${tile.tileId}:${tile.boardX}:${tile.boardY}`).join("|"),
    [session.placedTiles],
  );
  const reachable = useMemo(() => {
    if (!selectedHeroId) return new Set<string>();
    const targets = legalMoveTargets.filter((target) => !pendingMoveDirection || target.direction === pendingMoveDirection);
    return new Set(targets.map((target) => target.cellId));
  }, [legalMoveTargets, pendingMoveDirection, selectedHeroId]);

  const activeHeroId = draggingHeroId ?? selectedHeroId;
  const selectedHero = session.heroes.find((hero) => hero.heroId === selectedHeroId);
  const activeHero = session.heroes.find((hero) => hero.heroId === activeHeroId);
  const currentPlayer = session.players.find((player) => player.playerId === playerId);
  const canUseVortex = Boolean(currentPlayer?.assignedActionCard?.actions.includes("UseVortex") && session.status === "InProgress" && !session.heroes.some((hero) => hero.hasItem));
  const activeHeroCell = getCellById(session, activeHero?.positionCellId);
  const activeEscalatorGroupId = getEscalatorGroupId(activeHeroCell);
  const canUseEscalator = Boolean(
    currentPlayer?.assignedActionCard?.actions.includes("TakeEscalator") &&
      activeHero &&
      activeEscalatorGroupId &&
      ["InProgress", "Escape"].includes(session.status),
  );
  const validVortexTargets = new Set(
    (vortexMode || Boolean(draggingHeroId)) && activeHero && canUseVortex
      ? cells.filter((cell) => cell.type === "Vortex" && cell.vortexForHeroType === activeHero.heroType && !cell.occupiedByHeroId).map((cell) => cell.cellId)
      : [],
  );
  const validEscalatorTargets = new Set(
    draggingHeroId && canUseEscalator
      ? cells
          .filter((cell) => getEscalatorGroupId(cell) === activeEscalatorGroupId && cell.cellId !== activeHeroCell?.cellId && !cell.occupiedByHeroId)
          .map((cell) => cell.cellId)
      : [],
  );
  const nextTileId = session.tileDeck.remainingTileIds[0];
  const nextTileImageKey = nextTileId ? `${nextTileId.replace("tile1A", "tile0").replace("tile1B", "tile1")}.jpg` : undefined;
  const geometry = calculateBoardGeometry(session, tileSize);
  const boardStyle = {
    width: geometry.width,
    height: geometry.height,
    "--cell-size": `${geometry.cellSize}px`,
  } as CSSProperties;
  const showMoveFeedback = Boolean(selectedHeroId && (draggingHeroId || pendingMoveDirection));
  const invalidHover = Boolean(
    showMoveFeedback &&
      hoveredCellId &&
      !reachable.has(hoveredCellId) &&
      !validVortexTargets.has(hoveredCellId) &&
      !validEscalatorTargets.has(hoveredCellId) &&
      !session.heroes.some((hero) => hero.positionCellId === hoveredCellId),
  );
  const pendingExplorationCell = pendingTilePlacement ? getCellById(session, pendingTilePlacement.explorationCellId) : undefined;
  const pendingExpectedPlacement =
    pendingTilePlacement && pendingExplorationCell ? placementFromExploration(session, pendingExplorationCell, nextTileId, pendingTilePlacement.rotation) : undefined;
  const pendingOverlaps = pendingTilePlacement
    ? session.placedTiles.some((tile) => {
        return (
          pendingTilePlacement.boardX < tile.boardX + 4 &&
          pendingTilePlacement.boardX + 4 > tile.boardX &&
          pendingTilePlacement.boardY < tile.boardY + 4 &&
          pendingTilePlacement.boardY + 4 > tile.boardY
        );
      })
    : false;
  const pendingTileIsValid = Boolean(
    pendingTilePlacement &&
      pendingExpectedPlacement &&
      pendingTilePlacement.boardX === pendingExpectedPlacement.boardX &&
      pendingTilePlacement.boardY === pendingExpectedPlacement.boardY &&
      !pendingOverlaps,
  );
  const directionToCell = (heroId: string, cellId: string) => {
    if (heroId !== selectedHeroId) return undefined;
    const direction = legalMoveTargets.find((target) => target.cellId === cellId)?.direction;
    if (pendingMoveDirection && direction !== pendingMoveDirection) return undefined;
    return direction;
  };
  const selectHero = (heroId: string) => {
    setSelectedHeroId(heroId);
  };
  const panBoard = (dx: number, dy: number) => {
    scrollRef.current?.scrollBy({ left: dx, top: dy, behavior: "smooth" });
  };
  const changeZoom = (delta: number) => {
    setZoom((current) => Math.min(1.8, Math.max(0.55, Number((current + delta).toFixed(2)))));
  };
  const rotatePendingTile = () => {
    if (!pendingTilePlacement) return;
    const nextRotation = ((pendingTilePlacement.rotation + 90) % 360) as 0 | 90 | 180 | 270;
    const explorationCell = getCellById(session, pendingTilePlacement.explorationCellId);
    const placement = explorationCell ? placementFromExploration(session, explorationCell, nextTileId, nextRotation) : undefined;
    updatePendingTilePlacement({
      rotation: nextRotation,
      ...(placement ?? {}),
    });
  };
  const placePendingTile = () => {
    if (!pendingTilePlacement || !pendingTileIsValid) return;
    emitters.placeTile(
      pendingTilePlacement.heroId,
      pendingTilePlacement.explorationCellId,
      pendingTilePlacement.boardX,
      pendingTilePlacement.boardY,
      undefined,
      pendingTilePlacement.rotation,
    );
  };
  const resetPendingTilePlacement = () => {
    if (!pendingTilePlacement || !pendingExplorationCell) return;
    const placement = placementFromExploration(session, pendingExplorationCell, nextTileId, pendingTilePlacement.rotation);
    updatePendingTilePlacement(placement);
  };

  useEffect(() => {
    if (!selectedHeroId || !["InProgress", "Escape"].includes(session.status)) return;
    emitters.legalMoves(selectedHeroId);
  }, [selectedHeroId, session]);

  useEffect(() => {
    if (!draggingHeroId) return;
    const finishDrag = (event: PointerEvent) => {
      const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      const targetCellId = element?.closest<HTMLElement>("[data-cell-id]")?.dataset.cellId;
      if (targetCellId && validEscalatorTargets.has(targetCellId)) {
        emitters.takeEscalator(draggingHeroId, targetCellId);
      } else if (targetCellId && validVortexTargets.has(targetCellId)) {
        emitters.useVortex(draggingHeroId, targetCellId);
        setVortexMode(false);
      } else if (targetCellId && reachable.has(targetCellId)) {
        const direction = directionToCell(draggingHeroId, targetCellId);
        if (direction) {
          emitters.moveHeroTo(draggingHeroId, direction, targetCellId);
        }
      }
      setDraggingHeroId(undefined);
      setHoveredCellId(undefined);
      setPendingMoveDirection(undefined);
    };
    window.addEventListener("pointerup", finishDrag, { once: true });
    return () => window.removeEventListener("pointerup", finishDrag);
  }, [draggingHeroId, reachable, setDraggingHeroId, setPendingMoveDirection, setVortexMode, validEscalatorTargets, validVortexTargets]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    const boardElement = boardRef.current;
    if (!scrollElement || !boardElement || session.placedTiles.length === 0) return;
    if (pendingTilePlacement) return;
    if (lastCenteredSignatureRef.current === placedTileSignature) return;
    lastCenteredSignatureRef.current = placedTileSignature;

    const tileRects = session.placedTiles.map((tile) => tileToScreen(tile, geometry));
    const leftEdge = Math.min(...tileRects.map((rect) => rect.left));
    const rightEdge = Math.max(...tileRects.map((rect) => rect.left + rect.width));
    const topEdge = Math.min(...tileRects.map((rect) => rect.top));
    const bottomEdge = Math.max(...tileRects.map((rect) => rect.top + rect.height));
    const left = boardElement.offsetLeft + (leftEdge + rightEdge) / 2 - scrollElement.clientWidth / 2;
    const top = boardElement.offsetTop + (topEdge + bottomEdge) / 2 - scrollElement.clientHeight / 2;
    requestAnimationFrame(() => {
      scrollElement.scrollTo({ left: Math.max(0, left), top: Math.max(0, top), behavior: "auto" });
    });
  }, [geometry, pendingTilePlacement, placedTileSignature, session.placedTiles]);

  useEffect(() => {
    if (!pendingTilePlacement) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select")) return;
      const key = event.key.toLowerCase();

      if ((event.ctrlKey || event.metaKey) && (key === "z" || event.key === ",")) {
        event.preventDefault();
        resetPendingTilePlacement();
      } else if (key === "r") {
        event.preventDefault();
        rotatePendingTile();
      } else if (key === "p" || event.key === "Enter") {
        event.preventDefault();
        placePendingTile();
      } else if (key === "c" || event.key === "Escape") {
        event.preventDefault();
        setPendingTilePlacement(undefined);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        updatePendingTilePlacement({ boardY: pendingTilePlacement.boardY - 1 });
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        updatePendingTilePlacement({ boardY: pendingTilePlacement.boardY + 1 });
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        updatePendingTilePlacement({ boardX: pendingTilePlacement.boardX - 1 });
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        updatePendingTilePlacement({ boardX: pendingTilePlacement.boardX + 1 });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pendingTilePlacement]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    changeZoom(event.deltaY < 0 ? 0.08 : -0.08);
  };
  const beginPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("button,[data-cell-id],.hero-token,.pending-tile-placement,.board-camera-controls")) return;
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: scrollElement.scrollLeft,
      scrollTop: scrollElement.scrollTop,
      pointerId: event.pointerId,
    };
    setIsPanning(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const continuePan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = panStartRef.current;
    const scrollElement = scrollRef.current;
    if (!start || !scrollElement || start.pointerId !== event.pointerId) return;
    scrollElement.scrollLeft = start.scrollLeft - (event.clientX - start.x);
    scrollElement.scrollTop = start.scrollTop - (event.clientY - start.y);
  };
  const endPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = panStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    panStartRef.current = undefined;
    setIsPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };
  const snapPendingTileToPointer = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!pendingTilePlacement || !boardRef.current) return;
    const target = event.target as HTMLElement;
    if (target.closest("button,[data-cell-id],.hero-token,.pending-tile-placement,.board-camera-controls")) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const cellX = Math.floor((event.clientX - boardRect.left - geometry.offsetX) / geometry.cellSize);
    const cellY = Math.floor((event.clientY - boardRect.top - geometry.offsetY) / geometry.cellSize);
    updatePendingTilePlacement({
      boardX: cellX,
      boardY: cellY,
    });
  };

  return (
    <div className="maze-board-shell">
      <div
        className={`maze-scroll ${isPanning ? "is-panning" : ""}`}
        ref={scrollRef}
        onWheel={handleWheel}
        onPointerDown={beginPan}
        onPointerMove={continuePan}
        onPointerUp={endPan}
        onPointerCancel={endPan}
        onPointerLeave={endPan}
      >
        <div className="maze-board" ref={boardRef} style={boardStyle} onClick={snapPendingTileToPointer}>
          {session.placedTiles.map((tile) => <MazeTile key={`${tile.tileId}-${tile.boardX}-${tile.boardY}`} tile={tile} geometry={geometry} />)}
          {pendingTilePlacement && nextTileId && nextTileImageKey && (
            <PendingTilePreview
              tileId={nextTileId}
              imageKey={nextTileImageKey}
              boardX={pendingTilePlacement.boardX}
              boardY={pendingTilePlacement.boardY}
              rotation={pendingTilePlacement.rotation}
              geometry={geometry}
              valid={pendingTileIsValid}
              onRotate={rotatePendingTile}
              onPlace={placePendingTile}
              onReset={resetPendingTilePlacement}
            />
          )}
          {cells.map((cell) => (
            <MazeCellOverlay
              key={cell.cellId}
              cell={cell}
              geometry={geometry}
              reachable={showMoveFeedback && reachable.has(cell.cellId)}
              invalid={invalidHover && hoveredCellId === cell.cellId}
              selected={session.heroes.some((hero) => hero.positionCellId === cell.cellId && hero.heroId === selectedHeroId)}
              vortexTarget={validVortexTargets.has(cell.cellId)}
              escalatorTarget={validEscalatorTargets.has(cell.cellId)}
              onPointerEnter={() => setHoveredCellId(cell.cellId)}
              onClick={() => {
                if (selectedHeroId && validEscalatorTargets.has(cell.cellId)) {
                  emitters.takeEscalator(selectedHeroId, cell.cellId);
                  return;
                }
                if (selectedHeroId && vortexMode && validVortexTargets.has(cell.cellId)) {
                  emitters.useVortex(selectedHeroId, cell.cellId);
                  setVortexMode(false);
                  return;
                }
                if (selectedHeroId && pendingMoveDirection && reachable.has(cell.cellId)) {
                  emitters.moveHeroTo(selectedHeroId, pendingMoveDirection as Direction, cell.cellId);
                  setPendingMoveDirection(undefined);
                  return;
                }
                if (selectedHeroId && reachable.has(cell.cellId)) {
                  const direction = directionToCell(selectedHeroId, cell.cellId);
                  if (direction) {
                    emitters.moveHeroTo(selectedHeroId, direction, cell.cellId);
                  }
                  return;
                }
              }}
            />
          ))}
          {session.sandTimer.usedSandTimerCellIds.map((cellId) => (
            <UsedTimerMarker key={cellId} cell={getCellById(session, cellId)} geometry={geometry} />
          ))}
          {session.challengeState?.guards.map((guard) => <GuardPawn key={guard.guardId} guard={guard} cell={getCellById(session, guard.currentCellId)} geometry={geometry} />)}
          {session.heroes.map((hero) => (
            <HeroPawn
              key={hero.heroId}
              hero={hero}
              cell={getCellById(session, hero.positionCellId)}
              geometry={geometry}
              selected={hero.heroId === selectedHeroId}
              onSelect={() => selectHero(hero.heroId)}
              onDragStart={() => {
                selectHero(hero.heroId);
                setDraggingHeroId(hero.heroId);
              }}
            />
          ))}
        </div>
      </div>
      <div className="board-camera-controls" aria-label="Board view controls">
        <button type="button" onClick={() => changeZoom(0.12)} title="Zoom in">+</button>
        <button type="button" onClick={() => changeZoom(-0.12)} title="Zoom out">-</button>
        <button type="button" onClick={() => setZoom(1)} title="Reset zoom">1:1</button>
        <div className="board-pan-pad">
          <button type="button" className="pan-up" onClick={() => panBoard(0, -180)} title="Move up">^</button>
          <button type="button" className="pan-left" onClick={() => panBoard(-180, 0)} title="Move left">&lt;</button>
          <button type="button" className="pan-right" onClick={() => panBoard(180, 0)} title="Move right">&gt;</button>
          <button type="button" className="pan-down" onClick={() => panBoard(0, 180)} title="Move down">v</button>
        </div>
      </div>
    </div>
  );
}

function UsedTimerMarker({ cell, geometry }: { cell?: MazeCell; geometry: ReturnType<typeof calculateBoardGeometry> }) {
  if (!cell) return null;
  const pos = cellToScreen(cell, geometry);
  const size = Math.max(18, Math.min(42, geometry.cellSize * 0.78));
  return (
    <img
      className="used-timer-marker"
      src={getUsedTokenImage()}
      alt=""
      style={{
        left: pos.left + pos.width / 2,
        top: pos.top + pos.height / 2,
        width: size,
        height: size,
      }}
    />
  );
}

function PendingTilePreview({
  tileId,
  imageKey,
  boardX,
  boardY,
  rotation,
  geometry,
  valid,
  onRotate,
  onPlace,
  onReset,
}: {
  tileId: string;
  imageKey: string;
  boardX: number;
  boardY: number;
  rotation: 0 | 90 | 180 | 270;
  geometry: ReturnType<typeof calculateBoardGeometry>;
  valid: boolean;
  onRotate: () => void;
  onPlace: () => void;
  onReset: () => void;
}) {
  const pos = tileToScreen({ tileId, imageKey, boardX, boardY, rotation }, geometry);

  return (
    <button
      type="button"
      className={`pending-tile-placement ${valid ? "valid-placement" : "invalid-placement"}`}
      onClick={onPlace}
      onDoubleClick={onRotate}
      onContextMenu={(event) => {
        event.preventDefault();
        onReset();
      }}
      title={valid ? "Click or press P to place. Press R to rotate and C to cancel." : "Invalid placement. Press Ctrl+Z or Ctrl+, to reset."}
      style={{
        left: pos.left,
        top: pos.top,
        width: pos.width,
        height: pos.height,
      }}
    >
      <img src={getMazeTileImage(imageKey)} alt={tileId} style={{ transform: `rotate(${rotation}deg)` }} />
      <span className="pending-tile-hint">
        {valid ? "Click/P place | R rotate | C cancel" : "Invalid | Ctrl+Z or Ctrl+, reset"}
      </span>
    </button>
  );
}
