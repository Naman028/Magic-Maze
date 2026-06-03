import { create } from "zustand";

interface UiState {
  lastError?: string;
  setLastError: (lastError?: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  setLastError: (lastError) => set({ lastError }),
}));
