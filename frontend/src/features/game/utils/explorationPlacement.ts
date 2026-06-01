import { ActionType, GameSession, Hero, MazeCell } from "@/domain/game.types";
import { BACKEND_TILE_GRID_SIZE } from "./boardGeometry";

export type EligibleExplore = { hero: Hero; cell: MazeCell };

export function getEligibleExplore(session: GameSession): EligibleExplore | undefined {
  return session.heroes.reduce<EligibleExplore | undefined>((found, hero) => {
    if (found) return found;
    const cell = hero.positionCellId ? session.board.cells[hero.positionCellId] : undefined;
    if (cell?.type === "Exploration" && !cell.explorationUsed && cell.explorationForHeroType === hero.heroType && !hero.hasEscaped) {
      return { hero, cell };
    }
    return undefined;
  }, undefined);
}

const ENCODED_TILE_ENTERS: Record<string, string> = {
  tile2: "10f0400040004000130840004000377040004000280003h04000282203003950",
  tile3: "4000280012h0400030400300270039i031502700090028304000106004001200",
  tile4: "400037604000400030h0000039i0400040000100300027304000101040001380",
  tile5: "400037700440360036h00100300012000400000039i028204000011030001200",
  tile6: "4000400037c04000301027000900400040001000040027h04000102040001370",
  tile7: "4000400037504000280030000308360013a0400040000130400037ha40001380",
  tile8: "280030002700360012204000138010004000400040000130319027h030001200",
  tile9: "400028003000360030h0120040001000400040003760100031b0274003001200",
  tile10: "400040001040400037604000040736000100360a400001h003d0093040001350",
  tile11: "10g0400010204000010030001200378010002800360001h00400091004001200",
  tile12: "2800390a40004000094040003705376010084000010000h012e0310312001370",
  tile13: "280036000410360012h001004800110040001000317009004000014030001200",
  tile14: "3770400010104000100b40000100360010004000160204h00400272057003980",
  tile15: "370a400037804000092040000101360022002900120001h040001010400013j0",
  tile16: "400028000930400037k010000400360001000300480005h00400272030003950",
  tile17: "400028003600400030h012000100395031k027000900400040001020040039j0",
  tile18: "400040001010400030002700120040004000010030003970400013k040004000",
  tile19: "28003600043036000940040030000900010027004800022013k010h040001350",
  tile20: "400028003600400027101200040736000400360a40000140400010h0400013j0",
  tile21: "280030003000360003303000360010002800300012000120040027h048001400",
  tile22: "378040000420360009h028002700120004001200040036004000281030001200",
  tile23: "280027003000398009201000400040001350040036002830400028h003001200",
  tile24: "400031702700360030402700120010004000100040000110316000h048001400",
};

function oppositeDirection(direction?: string) {
  return direction === "North" ? "South" : direction === "South" ? "North" : direction === "East" ? "West" : direction === "West" ? "East" : undefined;
}

function edgeDirection(x: number, y: number) {
  if (x === 0) return "West";
  if (x === BACKEND_TILE_GRID_SIZE - 1) return "East";
  if (y === 0) return "North";
  if (y === BACKEND_TILE_GRID_SIZE - 1) return "South";
  return undefined;
}

function rotateDirection(direction: string, rotation: 0 | 90 | 180 | 270) {
  const directions = ["North", "East", "South", "West"];
  return directions[(directions.indexOf(direction) + rotation / 90) % directions.length];
}

function rotateCoordinate(x: number, y: number, rotation: 0 | 90 | 180 | 270) {
  switch (rotation) {
    case 90:
      return { x: BACKEND_TILE_GRID_SIZE - 1 - y, y: x };
    case 180:
      return { x: BACKEND_TILE_GRID_SIZE - 1 - x, y: BACKEND_TILE_GRID_SIZE - 1 - y };
    case 270:
      return { x: y, y: BACKEND_TILE_GRID_SIZE - 1 - x };
    case 0:
      return { x, y };
  }
}

function gateHeroType(itemBit: string) {
  const itemIndex = Number.parseInt(itemBit, 36) - 1;
  if (Number.isNaN(itemIndex) || itemIndex < 0 || itemIndex > 3) return undefined;
  return ["Elf", "Dwarf", "Mage", "Barbarian"][itemIndex];
}

function referenceEntryForTile(tileId?: string, direction?: string, rotation: 0 | 90 | 180 | 270 = 0) {
  const encoded = tileId ? ENCODED_TILE_ENTERS[tileId] : undefined;
  const requiredEntryDirection = oppositeDirection(direction);
  if (!encoded || !requiredEntryDirection) return undefined;

  for (let y = 0; y < BACKEND_TILE_GRID_SIZE; y += 1) {
    for (let x = 0; x < BACKEND_TILE_GRID_SIZE; x += 1) {
      const block = encoded.substring((y * BACKEND_TILE_GRID_SIZE + x) * 4, (y * BACKEND_TILE_GRID_SIZE + x) * 4 + 4);
      if (block[2] !== "h") continue;
      const baseDirection = edgeDirection(x, y);
      if (!baseDirection) continue;
      const rotatedDirection = rotateDirection(baseDirection, rotation);
      if (rotatedDirection !== requiredEntryDirection) continue;
      return rotateCoordinate(x, y, rotation);
    }
  }

  return undefined;
}

export function hasMatchingEntryForExploration(tileId: string | undefined, cell: MazeCell, rotation: 0 | 90 | 180 | 270 = 0) {
  return Boolean(referenceEntryForTile(tileId, cell.explorationDirection, rotation));
}

export function placementFromExploration(session: GameSession, cell: MazeCell, tileId?: string, rotation: 0 | 90 | 180 | 270 = 0) {
  const referenceEntry = referenceEntryForTile(tileId, cell.explorationDirection, rotation);
  if (referenceEntry) {
    const dx = cell.explorationDirection === "East" ? 1 : cell.explorationDirection === "West" ? -1 : 0;
    const dy = cell.explorationDirection === "South" ? 1 : cell.explorationDirection === "North" ? -1 : 0;
    return {
      boardX: cell.x + dx - referenceEntry.x,
      boardY: cell.y + dy - referenceEntry.y,
    };
  }

  const sourceLocalX = ((cell.x % BACKEND_TILE_GRID_SIZE) + BACKEND_TILE_GRID_SIZE) % BACKEND_TILE_GRID_SIZE;
  const sourceLocalY = ((cell.y % BACKEND_TILE_GRID_SIZE) + BACKEND_TILE_GRID_SIZE) % BACKEND_TILE_GRID_SIZE;

  switch (cell.explorationDirection) {
    case "East":
      return { boardX: cell.x + 1, boardY: cell.y - sourceLocalY };
    case "West":
      return { boardX: cell.x - BACKEND_TILE_GRID_SIZE, boardY: cell.y - sourceLocalY };
    case "North":
      return { boardX: cell.x - sourceLocalX, boardY: cell.y - BACKEND_TILE_GRID_SIZE };
    case "South":
      return { boardX: cell.x - sourceLocalX, boardY: cell.y + 1 };
    default: {
      const sourceTile = session.placedTiles.find((tile) => tile.tileId === cell.tileId);
      return { boardX: sourceTile?.boardX ?? 0, boardY: sourceTile?.boardY ?? 0 };
    }
  }
}

export function bestPlacementFromExploration(session: GameSession, cell: MazeCell, tileId?: string) {
  const rotations: Array<0 | 90 | 180 | 270> = [0, 90, 180, 270];
  const rotation = rotations.find((candidate) => hasMatchingEntryForExploration(tileId, cell, candidate)) ?? 0;
  return {
    ...placementFromExploration(session, cell, tileId, rotation),
    rotation,
  };
}

export function playerCanExplore(session: GameSession, playerId?: string): boolean {
  const player = session.players.find((candidate) => candidate.playerId === playerId);
  return Boolean(player?.assignedActionCard?.actions.includes("ExploreTile" as ActionType));
}

export function isSoloPlayer(session: GameSession, playerId?: string): boolean {
  const activePlayers = session.players.filter((candidate) => candidate.isConnected && !candidate.isSpectator);
  return activePlayers.length === 1 && activePlayers[0]?.playerId === playerId;
}
