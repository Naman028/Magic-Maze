import { ACTION_CARDS } from "../data/actionCards.js";
import { ActionType, CellType, GameStatus, HeroType, MazeCell, Room } from "../game/gameTypes.js";
import { RoomService } from "../rooms/roomService.js";
import { RoomStore } from "../rooms/roomStore.js";

export function createRoomService(): RoomService {
  return new RoomService(new RoomStore());
}

export function createStartedRoom(playerCount = 4): { service: RoomService; room: Room } {
  const service = createRoomService();
  const room = service.createRoom({ nickname: "Host" });
  for (let index = 1; index < playerCount; index += 1) {
    service.joinRoom({ roomCode: room.roomCode, nickname: `Player ${index}` });
  }
  service.startGame(room.roomCode, room.session.players[0].playerId);
  return { service, room };
}

export function givePlayerAction(room: Room, playerIndex: number, action: ActionType): void {
  room.session.players[playerIndex].assignedActionCard = {
    actionCardId: `test-${action}`,
    imageKey: "test-action-card.png",
    actions: [action, ActionType.SendSignal],
    label: action,
    icons: [],
  };
}

export function clearOccupancy(room: Room): void {
  for (const cell of Object.values(room.session.board.cells)) {
    delete cell.occupiedByHeroId;
  }
}

export function placeHero(room: Room, heroId: string, cellId: string): void {
  const hero = room.session.heroes.find((candidate) => candidate.heroId === heroId);
  if (!hero) {
    throw new Error(`Missing hero ${heroId}`);
  }
  if (hero.positionCellId) {
    delete room.session.board.cells[hero.positionCellId]?.occupiedByHeroId;
  }
  hero.positionCellId = cellId;
  hero.hasEscaped = false;
  const cell = room.session.board.cells[cellId];
  cell.occupiedByHeroId = heroId;
  hero.isOnItemSpace = cell.type === CellType.Item && cell.itemForHeroType === hero.heroType;
}

export function markCellAsSandTimer(room: Room, cellId = "tile1A-1-0"): string {
  const cell = room.session.board.cells[cellId];
  if (!cell) {
    throw new Error(`Missing cell ${cellId}`);
  }
  cell.type = CellType.SandTimer;
  delete cell.itemForHeroType;
  delete cell.exitForHeroType;
  delete cell.vortexForHeroType;
  delete cell.explorationForHeroType;
  delete cell.explorationDirection;
  return cellId;
}

export function placeHeroOnSandTimer(room: Room, heroId = "hero-mage", cellId = "tile1A-1-0"): string {
  markCellAsSandTimer(room, cellId);
  placeHero(room, heroId, cellId);
  return cellId;
}

export function upsertTestCell(room: Room, cell: MazeCell): void {
  room.session.board.cells[cell.cellId] = cell;
}

export function ensureTheftTestCells(room: Room): void {
  upsertTestCell(room, {
    cellId: "test-item-mage",
    tileId: "test",
    x: 20,
    y: 20,
    type: CellType.Item,
    walls: [],
    neighborCellIds: {},
    itemForHeroType: HeroType.Mage,
  });
  upsertTestCell(room, {
    cellId: "test-before-item-mage",
    tileId: "test",
    x: 20,
    y: 21,
    type: CellType.Normal,
    walls: [],
    neighborCellIds: { North: "test-item-mage" },
  });
  room.session.board.cells["test-item-mage"].neighborCellIds.South = "test-before-item-mage";
  upsertTestCell(room, {
    cellId: "test-item-barbarian",
    tileId: "test",
    x: 21,
    y: 20,
    type: CellType.Item,
    walls: [],
    neighborCellIds: {},
    itemForHeroType: HeroType.Barbarian,
  });
  upsertTestCell(room, {
    cellId: "test-item-elf",
    tileId: "test",
    x: 20,
    y: 21,
    type: CellType.Item,
    walls: [],
    neighborCellIds: {},
    itemForHeroType: HeroType.Elf,
  });
  upsertTestCell(room, {
    cellId: "test-item-dwarf",
    tileId: "test",
    x: 21,
    y: 21,
    type: CellType.Item,
    walls: [],
    neighborCellIds: {},
    itemForHeroType: HeroType.Dwarf,
  });
}

export function setTheftReadyExceptMage(room: Room): void {
  clearOccupancy(room);
  ensureTheftTestCells(room);
  placeHero(room, "hero-mage", "test-before-item-mage");
  placeHero(room, "hero-barbarian", "test-item-barbarian");
  placeHero(room, "hero-elf", "test-item-elf");
  placeHero(room, "hero-dwarf", "test-item-dwarf");
}

export function findCardWithAction(action: ActionType) {
  const card = ACTION_CARDS.find((candidate) => candidate.actions.includes(action));
  if (!card) {
    throw new Error(`Missing action card for ${action}`);
  }
  return card;
}

export function markAllButMageEscaped(room: Room): void {
  clearOccupancy(room);
  for (const hero of room.session.heroes) {
      hero.hasItem = true;
      if (hero.heroType === HeroType.Mage) {
        hero.hasEscaped = false;
      hero.positionCellId = "tile1A-start-elf";
      room.session.board.cells["tile1A-start-elf"].occupiedByHeroId = hero.heroId;
    } else {
      hero.hasEscaped = true;
      hero.positionCellId = null;
    }
  }
  room.session.status = GameStatus.Escape;
}


