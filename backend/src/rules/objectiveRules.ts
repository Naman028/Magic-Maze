import { Objective, ObjectiveType, GameSession } from "../game/gameTypes.js";
import { addEffect } from "./effectRules.js";

export function createObjectives(securityCamerasEnabled: boolean): Objective[] {
  const objectives: Objective[] = [
    { objectiveId: "objective-explore", type: "ExploreMall", description: "Place the first mall tile.", isCompleted: false },
    { objectiveId: "objective-items", type: "CollectItems", description: "Collect all hero items.", isCompleted: false },
    { objectiveId: "objective-exit", type: "ReachExit", description: "Escape through the exit.", isCompleted: false },
    { objectiveId: "objective-timer", type: "UseTimer", description: "Flip a sand timer.", isCompleted: false },
    { objectiveId: "objective-guards", type: "AvoidGuards", description: "Avoid guard capture.", isCompleted: false },
  ];
  if (securityCamerasEnabled) {
    objectives.push({ objectiveId: "objective-cameras", type: "DisableCameras", description: "Disable a security camera.", isCompleted: false });
  }
  return objectives;
}

export function completeObjective(session: GameSession, type: ObjectiveType): boolean {
  const objective = session.objectives.find((candidate) => candidate.type === type);
  if (!objective || objective.isCompleted) return false;
  objective.isCompleted = true;
  objective.completedAt = new Date().toISOString();
  addEffect(session, { effectType: "ObjectiveCompleted", animationKey: type });
  return true;
}

