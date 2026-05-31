import { ActionCard, ActionType } from "../game/gameTypes.js";

export const ACTION_CARDS: ActionCard[] = [
  { actionCardId: "action-card-1", imageKey: "ActionCard1.png", actions: [ActionType.MoveEast], label: "Move East", icons: ["arrow-right"] },
  { actionCardId: "action-card-2", imageKey: "ActionCard2.png", actions: [ActionType.MoveWest, ActionType.UseVortex], label: "Move West + Vortex", icons: ["arrow-left", "vortex"] },
  { actionCardId: "action-card-3", imageKey: "ActionCard3.png", actions: [ActionType.MoveNorth, ActionType.MoveEast, ActionType.UseVortex], label: "Move North/East + Vortex", icons: ["arrow-up", "arrow-right", "vortex"] },
  { actionCardId: "action-card-4", imageKey: "ActionCard4.png", actions: [ActionType.MoveNorth], label: "Move North", icons: ["arrow-up"] },
  { actionCardId: "action-card-5", imageKey: "ActionCard5.png", actions: [ActionType.MoveSouth], label: "Move South", icons: ["arrow-down"] },
  { actionCardId: "action-card-6", imageKey: "ActionCard6.png", actions: [ActionType.MoveNorth], label: "Move North", icons: ["arrow-up"] },
  { actionCardId: "action-card-7", imageKey: "ActionCard7.png", actions: [ActionType.MoveSouth, ActionType.ExploreTile], label: "Move South + Explore", icons: ["arrow-down", "search"] },
  { actionCardId: "action-card-8", imageKey: "ActionCard8.png", actions: [ActionType.MoveEast, ActionType.TakeEscalator], label: "Move East + Elevator", icons: ["arrow-right", "stairs"] },
  { actionCardId: "action-card-9", imageKey: "ActionCard9.png", actions: [ActionType.MoveWest], label: "Move West", icons: ["arrow-left"] },
];
