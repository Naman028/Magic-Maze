import { ActionType, Direction, Player } from "../game/gameTypes.js";

export function requiredActionForDirection(direction: Direction): ActionType {
  switch (direction) {
    case Direction.North:
      return ActionType.MoveNorth;
    case Direction.South:
      return ActionType.MoveSouth;
    case Direction.East:
      return ActionType.MoveEast;
    case Direction.West:
      return ActionType.MoveWest;
  }
}

export function assertPlayerCanUseDirection(player: Player, direction: Direction): void {
  const requiredAction = requiredActionForDirection(direction);
  if (!player.assignedActionCard?.actions.includes(requiredAction)) {
    throw new Error("Player is not assigned the required action.");
  }
}

export function assertCanSendSignal(player: Player): void {
  if (!player.assignedActionCard?.actions.includes(ActionType.SendSignal)) {
    throw new Error("Player is not assigned the signal action.");
  }
}

