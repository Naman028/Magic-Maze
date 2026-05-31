import { createStarterBoard } from "../data/starterBoard.js";
import { createStarterHeroes } from "../data/heroes.js";
import { getScenario, STARTER_SCENARIO } from "../data/scenarios.js";
import { getMallTile } from "../data/mallTiles.js";
import { createCommunicationState } from "../rules/communicationState.js";
import { difficultySettingsFor } from "../rules/difficultyRules.js";
import { createObjectives } from "../rules/objectiveRules.js";
import { CommunicationMode, GameSession, GameStatus, Player } from "./gameTypes.js";

export function shuffleTileDeck(tileIds: string[]): string[] {
  const shuffled = [...tileIds];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function createGameSession(roomCode: string, host: Player): GameSession {
  const now = Date.now();
  const startingTile = getMallTile(STARTER_SCENARIO.startingTileId);
  const scenario = getScenario(STARTER_SCENARIO.scenarioId);
  return {
    roomCode,
    status: GameStatus.Waiting,
    players: [host],
    heroes: createStarterHeroes(),
    board: createStarterBoard(),
    placedTiles: [
      {
        tileId: startingTile.tileId,
        imageKey: startingTile.imageKey,
        boardX: 0,
        boardY: 0,
        rotation: 0,
      },
    ],
    tileDeck: {
      remainingTileIds: shuffleTileDeck(scenario.tileDeckIds),
      usedTileIds: [],
    },
    scenario,
    difficultySettings: difficultySettingsFor("Normal"),
    objectives: createObjectives(scenario.ruleFlags.securityCamerasEnabled),
    achievements: [],
    unlockedScenarioIds: [STARTER_SCENARIO.scenarioId],
    challengeState: { guards: [], caughtHeroIds: [] },
    effectLog: [],
    sandTimer: {
      remainingSeconds: STARTER_SCENARIO.sandTimerSeconds,
      isRunning: false,
      isFinalCountdown: false,
      canBeFlipped: true,
      usedSandTimerCellIds: [],
    },
    communicationState: createCommunicationState(CommunicationMode.Open, false, "Lobby", false),
    actionsLocked: false,
    createdAt: now,
    updatedAt: now,
  };
}
