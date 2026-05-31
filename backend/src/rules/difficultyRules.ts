import { DifficultyLevel, DifficultySettings } from "../game/gameTypes.js";

export function difficultySettingsFor(difficulty: DifficultyLevel): DifficultySettings {
  switch (difficulty) {
    case "Easy":
      return { difficulty, timeLimitSeconds: 240, guardSpeedMultiplier: 0.75, extraGuardCount: 0, tileDeckModifier: "Short" };
    case "Hard":
      return { difficulty, timeLimitSeconds: 120, guardSpeedMultiplier: 1.25, extraGuardCount: 1, tileDeckModifier: "Long" };
    case "Normal":
      return { difficulty, timeLimitSeconds: 180, guardSpeedMultiplier: 1, extraGuardCount: 0, tileDeckModifier: "Normal" };
  }
}

