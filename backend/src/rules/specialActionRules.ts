import { ActionType, CellType, GameSession, GameStatus, Hero, MazeCell, Player } from "../game/gameTypes.js";
import { hasVisualEscalatorEndpoints, visualEscalatorGroupId } from "../data/mallTiles.js";
import { moveHero } from "./movementRules.js";

function getPlayer(session: GameSession, playerId: string): Player {
  const player = session.players.find((candidate) => candidate.playerId === playerId);
  if (!player) throw new Error("Player does not belong to this room.");
  return player;
}

function getHero(session: GameSession, heroId: string): Hero {
  const hero = session.heroes.find((candidate) => candidate.heroId === heroId);
  if (!hero) throw new Error("Hero does not exist.");
  if (hero.hasEscaped) throw new Error("Hero has already escaped.");
  return hero;
}

function getCurrentCell(session: GameSession, hero: Hero): MazeCell {
  if (!hero.positionCellId) throw new Error("Hero is not on the board.");
  const cell = session.board.cells[hero.positionCellId];
  if (!cell) throw new Error("Current cell does not exist.");
  return cell;
}

function escalatorGroupForCell(cell: MazeCell): string | undefined {
  const visualGroupId = visualEscalatorGroupId(cell.tileId, cell.cellId);
  if (visualGroupId) return visualGroupId;
  if (hasVisualEscalatorEndpoints(cell.tileId)) return undefined;
  if (cell.escalatorGroupId) return cell.escalatorGroupId;

  // Existing rooms created before the starter metadata fix do not have this
  // field hydrated. Keep the rule based on the actual starter tile cells.
  if (cell.tileId === "tile1A" && (cell.cellId === "tile1A-3-2" || cell.cellId === "tile1A-2-3")) {
    return "tile1A-escalator-a";
  }

  return undefined;
}

export function useVortex(session: GameSession, playerId: string, heroId: string, targetCellId: string): void {
  if (session.status !== GameStatus.InProgress) throw new Error("Vortex can only be used while the game is in progress.");
  if (session.actionsLocked) throw new Error("Actions are locked.");
  const player = getPlayer(session, playerId);
  if (!player.assignedActionCard?.actions.includes(ActionType.UseVortex)) throw new Error("Player is not assigned the vortex action.");
  if (session.heroes.some((hero) => hero.hasItem)) throw new Error("Vortex is disabled after theft.");
  const hero = getHero(session, heroId);
  const targetCell = session.board.cells[targetCellId];
  if (!targetCell) throw new Error("Target cell does not exist.");
  if (targetCell.type !== CellType.Vortex) throw new Error("Target cell is not a vortex.");
  if (targetCell.vortexForHeroType !== hero.heroType) throw new Error("Vortex colour does not match hero.");
  if (targetCell.occupiedByHeroId) throw new Error("Target vortex is occupied.");
  moveHero(hero, getCurrentCell(session, hero), targetCell);
  session.updatedAt = Date.now();
}

export function takeEscalator(session: GameSession, playerId: string, heroId: string, targetCellId?: string): void {
  if (![GameStatus.InProgress, GameStatus.Escape].includes(session.status)) throw new Error("Escalator can only be used during active play.");
  if (session.actionsLocked) throw new Error("Actions are locked.");
  const player = getPlayer(session, playerId);
  if (!player.assignedActionCard?.actions.includes(ActionType.TakeEscalator)) throw new Error("Player is not assigned the escalator action.");
  const hero = getHero(session, heroId);
  const currentCell = getCurrentCell(session, hero);
  const currentGroupId = escalatorGroupForCell(currentCell);
  if (!currentGroupId) throw new Error("Hero is not on an escalator.");
  const destination = targetCellId
    ? session.board.cells[targetCellId]
    : Object.values(session.board.cells).find((cell) => escalatorGroupForCell(cell) === currentGroupId && cell.cellId !== currentCell.cellId);
  if (!destination) throw new Error("Escalator pair does not exist.");
  if (destination.cellId === currentCell.cellId || escalatorGroupForCell(destination) !== currentGroupId) throw new Error("Target cell is not the paired escalator.");
  if (destination.occupiedByHeroId) throw new Error("Escalator destination is occupied.");
  moveHero(hero, currentCell, destination);
  session.updatedAt = Date.now();
}
