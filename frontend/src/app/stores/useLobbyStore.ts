import { create } from "zustand";
import { ScenarioDefinition } from "@/domain/game.types";

interface LobbyState {
  scenarios: ScenarioDefinition[];
  setScenarios: (scenarios: ScenarioDefinition[]) => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
  scenarios: [],
  setScenarios: (scenarios) => set({ scenarios }),
}));
