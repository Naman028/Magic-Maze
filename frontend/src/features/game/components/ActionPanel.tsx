import { ActionType, Direction, GameSession } from "@/domain/game.types";
import { useGameStore } from "@/app/stores/useGameStore";
import { emitters } from "@/services/socket/socketEmitters";
import { getActionAbilityImage, getActionCardImage, getActionDeckImage, getMazeDeckImage, getTheftObjectiveImage } from "@/shared/utils/assetPaths";
import { getCellById, getEscalatorGroupId } from "../utils/boardRules";
import { bestPlacementFromExploration, getEligibleExplore, isSoloPlayer } from "../utils/explorationPlacement";

const directionLabels: Record<Direction, string> = { North: "Up", South: "Down", East: "Right", West: "Left" };
const directionActionByDirection: Record<Direction, ActionType> = {
  North: "MoveNorth",
  South: "MoveSouth",
  East: "MoveEast",
  West: "MoveWest",
};
const orderedDirections: Direction[] = ["North", "East", "South", "West"];

export function ActionPanel({ session, playerId }: { session: GameSession; playerId?: string }) {
  const { selectedHeroId, vortexMode, legalMoveTargets, setPendingMoveDirection, setVortexMode, setPendingTilePlacement } = useGameStore();
  const player = session.players.find((candidate) => candidate.playerId === playerId);
  const actions = player?.assignedActionCard?.actions ?? [];
  const isSolo = isSoloPlayer(session, playerId);
  const selectedHero = session.heroes.find((hero) => hero.heroId === selectedHeroId);
  const selectedCell = getCellById(session, selectedHero?.positionCellId);
  const selectedEscalatorGroupId = getEscalatorGroupId(selectedCell);
  const selectedEscalatorTarget = selectedEscalatorGroupId
    ? Object.values(session.board.cells).find((cell) => getEscalatorGroupId(cell) === selectedEscalatorGroupId && cell.cellId !== selectedCell?.cellId && !cell.occupiedByHeroId)
    : undefined;
  const availableMoveDirections = orderedDirections.filter((direction) => actions.includes(directionActionByDirection[direction]));
  const directionsWithLegalTargets = new Set(legalMoveTargets.map((target) => target.direction));
  const eligibleExplore = getEligibleExplore(session);
  const nextTileId = session.tileDeck.remainingTileIds[0];
  const currentCard = player?.assignedActionCard;
  const vortexBlocked = session.status === "Escape" || session.heroes.some((hero) => hero.hasItem);

  return (
    <section className={`action-panel ${isSolo ? "solo-action-panel" : "multiplayer-action-panel"}`}>
      {isSolo ? <SoloDeck currentCard={currentCard} /> : <MultiplayerDeck currentCard={currentCard} />}

      <div className="action-buttons">
        {availableMoveDirections.map((direction) => {
          const hasLegalTarget = selectedHero ? directionsWithLegalTargets.has(direction) : false;
          return (
            <ActionButton
              key={direction}
              imageSrc={getActionAbilityImage(directionActionByDirection[direction])}
              label={directionLabels[direction]}
              caption={hasLegalTarget ? `Move ${directionLabels[direction]}` : selectedHero ? `No ${directionLabels[direction].toLowerCase()} target` : "Select a hero"}
              disabled={!hasLegalTarget}
              onClick={() => setPendingMoveDirection(direction)}
            />
          );
        })}

        {actions.includes("ExploreTile" as ActionType) && eligibleExplore && (
          <ActionButton
            imageSrc={getActionAbilityImage("ExploreTile")}
            label="Search"
            caption="Pick Up Tile"
            onClick={() => {
              const placement = bestPlacementFromExploration(session, eligibleExplore.cell, nextTileId);
              setPendingTilePlacement({
                heroId: eligibleExplore.hero.heroId,
                explorationCellId: eligibleExplore.cell.cellId,
                boardX: placement.boardX,
                boardY: placement.boardY,
                rotation: placement.rotation,
              });
            }}
          />
        )}

        {actions.includes("ExploreTile" as ActionType) && !eligibleExplore && (
          <button className="action-card-button disabled-action" disabled title="Move a hero onto a matching unexplored search space first.">
            <img src={getActionAbilityImage("ExploreTile")} alt="" />
            <span>Search</span>
            <small>Need hero</small>
          </button>
        )}

        {actions.includes("UseVortex" as ActionType) && selectedHero && !vortexBlocked && (
          <ActionButton imageSrc={getActionAbilityImage("UseVortex")} label="Vortex" caption={vortexMode ? "Pick target" : "Use Vortex"} active={vortexMode} onClick={() => setVortexMode(!vortexMode)} />
        )}

        {actions.includes("UseVortex" as ActionType) && vortexBlocked && (
          <button className="action-card-button disabled-action" disabled title="Vortex is blocked after theft.">
            <img src={getTheftObjectiveImage(true)} alt="" />
            <span>Vortex</span>
            <small>Blocked</small>
          </button>
        )}

        {actions.includes("TakeEscalator" as ActionType) && selectedHero && selectedEscalatorTarget && (
          <ActionButton imageSrc={getActionAbilityImage("TakeEscalator")} label="Elevator" caption="Use Elevator" onClick={() => emitters.takeEscalator(selectedHero.heroId, selectedEscalatorTarget.cellId)} />
        )}

        {actions.includes("TakeEscalator" as ActionType) && selectedHero && !selectedEscalatorTarget && (
          <button className="action-card-button disabled-action" disabled title="Move the selected hero onto an elevator endpoint first.">
            <img src={getActionAbilityImage("TakeEscalator")} alt="" />
            <span>Elevator</span>
            <small>Need endpoint</small>
          </button>
        )}

        {selectedHero && selectedCell?.type === "SandTimer" && (
          <ActionButton
            iconText="T"
            label="Timer"
            caption={timerCaption(session, selectedCell.cellId)}
            disabled={!canFlipTimer(session, selectedCell.cellId)}
            onClick={() => emitters.activateSandTimer(selectedHero.heroId, selectedCell.cellId)}
          />
        )}

        {selectedHero?.heroType === "Barbarian" && selectedCell?.type === "SecurityCamera" && !selectedCell.cameraDisabled && (
          <button onClick={() => emitters.disableCamera(selectedHero.heroId, selectedCell.cellId)}>Disable Camera</button>
        )}

        {selectedHero?.heroType === "Mage" && selectedCell?.type === "CrystalBall" && actions.includes("ExploreTile" as ActionType) && (
          <button onClick={() => {
            const explorationCell = Object.values(session.board.cells).find((cell) => cell.type === "Exploration" && !cell.explorationUsed);
            if (!explorationCell) return;
            const placement = bestPlacementFromExploration(session, explorationCell, nextTileId);
            emitters.mageCrystalExplore(selectedHero.heroId, [{ explorationCellId: explorationCell.cellId, boardX: placement.boardX, boardY: placement.boardY, rotation: placement.rotation }]);
          }}>
            Crystal Explore
          </button>
        )}
      </div>

      {isSolo && (
        <button className="next-action-card" onClick={() => emitters.nextSoloAction()}>
          Next Action
        </button>
      )}
    </section>
  );
}

function SoloDeck({ currentCard }: { currentCard?: { imageKey?: string; label: string } }) {
  return (
    <div className="solo-deck-track" aria-label="Solo action deck">
      <DeckSlot label="Draw" image={getActionDeckImage()} />
      <span className="deck-arrow">-&gt;</span>
      <DeckSlot label="Current" image={getActionCardImage(currentCard?.imageKey)} title={currentCard?.label} active />
      <span className="deck-arrow">-&gt;</span>
      <DeckSlot label="Discard" image={getActionDeckImage()} muted />
      <div className="maze-deck-chip">
        <img src={getMazeDeckImage()} alt="" />
        <span>Maze deck</span>
      </div>
    </div>
  );
}

function MultiplayerDeck({ currentCard }: { currentCard?: { imageKey?: string; label: string } }) {
  return (
    <div className="multiplayer-deck-track" aria-label="Player action card">
      <DeckSlot label="Action deck" image={getActionDeckImage()} muted />
      <span className="deck-arrow">-&gt;</span>
      <DeckSlot label="Your card" image={getActionCardImage(currentCard?.imageKey)} title={currentCard?.label} active />
    </div>
  );
}

function DeckSlot({ label, image, title, active, muted }: { label: string; image: string; title?: string; active?: boolean; muted?: boolean }) {
  return (
    <div className={`deck-slot ${active ? "active-deck-slot" : ""} ${muted ? "muted-deck-slot" : ""}`} title={title ?? label}>
      <span>{label}</span>
      {image && <img src={image} alt={title ?? label} />}
      {title && <small>{title}</small>}
    </div>
  );
}

function canFlipTimer(session: GameSession, cellId: string) {
  return session.status === "InProgress" && session.sandTimer.canBeFlipped && !session.sandTimer.isFinalCountdown && !session.sandTimer.usedSandTimerCellIds.includes(cellId);
}

function timerCaption(session: GameSession, cellId: string) {
  if (session.sandTimer.usedSandTimerCellIds.includes(cellId)) return "Already used";
  if (session.sandTimer.isFinalCountdown) return "Final countdown";
  if (!session.sandTimer.canBeFlipped) return "Cannot flip";
  if (session.status !== "InProgress") return "Not available";
  return "Flip Timer";
}

function ActionButton({ imageSrc, iconText, label, caption, active, disabled, onClick }: { imageSrc?: string; iconText?: string; label: string; caption?: string; active?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button className={`action-card-button ${active ? "active-action" : ""} ${disabled ? "disabled-action" : ""}`} onClick={onClick} title={caption ?? label} disabled={disabled}>
      {imageSrc && <img src={imageSrc} alt="" />}
      {!imageSrc && iconText && <span className="action-button-icon" aria-hidden="true">{iconText}</span>}
      <span>{label}</span>
      {caption && <small>{caption}</small>}
    </button>
  );
}
