import { ACTION_CARDS } from "../data/actionCards.js";
import { ActionCard, ActionType, Player } from "./gameTypes.js";

export const SOLO_ACTION_CARDS: ActionCard[] = [
  ...ACTION_CARDS,
];

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function createMvpCard(actionCardId: string, label: string, actions: ActionType[]) {
  return { actionCardId, imageKey: `${actionCardId}.png`, actions, label, icons: actions.map((action) => action) };
}

export function assignActionCards(players: Player[]): void {
  const activePlayers = players.filter((player) => !player.isSpectator && player.isConnected);
  if (activePlayers.length === 1) {
    activePlayers[0].assignedActionCard = shuffled(SOLO_ACTION_CARDS)[0];
    return;
  }
  // TODO: Replace MVP balanced assignment with exact official player-count action-tile distribution when the action-card lower-right player-count metadata is mapped.
  if (activePlayers.length === 2) {
    const cards = shuffled([
      createMvpCard("mvp-2p-1", "North/East + Vortex", [ActionType.MoveNorth, ActionType.MoveEast, ActionType.UseVortex]),
      createMvpCard("mvp-2p-2", "South/West + Explore/Elevator", [ActionType.MoveSouth, ActionType.MoveWest, ActionType.ExploreTile, ActionType.TakeEscalator]),
    ]);
    activePlayers.forEach((player, index) => {
      player.assignedActionCard = cards[index];
    });
    return;
  }
  if (activePlayers.length === 3) {
    const cards = shuffled([
      createMvpCard("mvp-3p-1", "North/East + Vortex", [ActionType.MoveNorth, ActionType.MoveEast, ActionType.UseVortex]),
      createMvpCard("mvp-3p-2", "South + Explore", [ActionType.MoveSouth, ActionType.ExploreTile]),
      createMvpCard("mvp-3p-3", "West + Elevator", [ActionType.MoveWest, ActionType.TakeEscalator]),
    ]);
    activePlayers.forEach((player, index) => {
      player.assignedActionCard = cards[index];
    });
    return;
  }
  if (activePlayers.length === 4) {
    const cards = shuffled([
      createMvpCard("mvp-4p-1", "North", [ActionType.MoveNorth]),
      createMvpCard("mvp-4p-2", "South + Explore", [ActionType.MoveSouth, ActionType.ExploreTile]),
      createMvpCard("mvp-4p-3", "East + Elevator", [ActionType.MoveEast, ActionType.TakeEscalator]),
      createMvpCard("mvp-4p-4", "West + Vortex", [ActionType.MoveWest, ActionType.UseVortex]),
    ]);
    activePlayers.forEach((player, index) => {
      player.assignedActionCard = cards[index];
    });
    return;
  }
  const cards = shuffled(ACTION_CARDS);
  activePlayers.forEach((player, index) => {
    player.assignedActionCard = cards[index % cards.length];
  });
  if (!activePlayers.some((player) => player.assignedActionCard?.actions.includes(ActionType.ExploreTile))) {
    activePlayers[activePlayers.length - 1].assignedActionCard = ACTION_CARDS.find((card) => card.actions.includes(ActionType.ExploreTile));
  }
}

export function assignNextSoloActionCard(players: Player[], playerId: string, targetAction?: ActionType): ActionCard {
  const activePlayers = players.filter((player) => !player.isSpectator && player.isConnected);
  if (activePlayers.length !== 1 || activePlayers[0].playerId !== playerId) {
    throw new Error("Solo action cycling is only available in a one-player game.");
  }

  const player = activePlayers[0];
  const currentIndex = SOLO_ACTION_CARDS.findIndex((card) => card.actionCardId === player.assignedActionCard?.actionCardId);
  let nextCard = SOLO_ACTION_CARDS[(currentIndex + 1) % SOLO_ACTION_CARDS.length];

  if (targetAction) {
    for (let offset = 1; offset <= SOLO_ACTION_CARDS.length; offset += 1) {
      const candidate = SOLO_ACTION_CARDS[(currentIndex + offset) % SOLO_ACTION_CARDS.length];
      if (candidate.actions.includes(targetAction)) {
        nextCard = candidate;
        break;
      }
    }
  }

  player.assignedActionCard = nextCard;
  return nextCard;
}
