import { useState } from "react";
import { GameSession } from "@/domain/game.types";
import { emitters } from "@/services/socket/socketEmitters";
import { getMagicMazeLogoImage } from "@/shared/utils/assetPaths";

export function GameTopBar({ session, onLeaveGame }: { session: GameSession; onLeaveGame: () => void }) {
  const [openPanel, setOpenPanel] = useState<"help" | "settings" | "menu" | undefined>();

  const togglePanel = (panel: "help" | "settings" | "menu") => {
    setOpenPanel((current) => (current === panel ? undefined : panel));
  };

  return (
    <header className="game-topbar">
      <img className="brand-logo brand-logo-game" src={getMagicMazeLogoImage()} alt="Magic Maze Online" />
      <button className="ghost-button return-lobby-button" onClick={onLeaveGame} aria-label="Leave game">
        <BackIcon />
        <span>Leave Game</span>
      </button>
      <div className="scenario-banner">
        <strong>{session.scenario.name.toUpperCase()}</strong>
        <span>{session.scenario.description}</span>
      </div>
      <button className="ghost-button rules-button topbar-action-button" onClick={() => togglePanel("help")} aria-label="Open rules">
        <RulesIcon />
        <span>Rules</span>
      </button>
      <button className="icon-button topbar-action-button" aria-label="Settings" onClick={() => togglePanel("settings")}>Settings</button>
      <button className="icon-button topbar-action-button" aria-label="Menu" onClick={() => togglePanel("menu")}>Menu</button>

      {openPanel === "help" && (
        <div className="topbar-popover help-popover">
          <h2>Rules</h2>
          <p>Use only the action shown on your card. In solo mode, press Next Action until the action you need is current.</p>
          <p>Move heroes in straight lines until a wall, another hero, or the edge stops them.</p>
          <p>Search places the randomized next maze tile when a matching hero stands on an unused search space.</p>
          <p>Vortex sends the selected hero to any open same-colour vortex before theft. Elevator moves the selected hero between paired escalator spaces.</p>
          <button className="purple-button" onClick={() => setOpenPanel(undefined)}>Close</button>
        </div>
      )}

      {openPanel === "settings" && (
        <div className="topbar-popover settings-popover">
          <h2>Settings</h2>
          <p>Use Ctrl + mouse wheel or trackpad pinch over the board to zoom. Drag or use the board arrows to pan.</p>
          <p>The board camera is local to your browser and does not affect other players.</p>
          <button className="purple-button" onClick={() => setOpenPanel(undefined)}>Close</button>
        </div>
      )}

      {openPanel === "menu" && (
        <div className="topbar-popover menu-popover">
          <button onClick={onLeaveGame}>Leave Game</button>
          <button onClick={() => emitters.signal("Attention")}>Do Something</button>
          <button onClick={() => setOpenPanel(undefined)}>Close Menu</button>
        </div>
      )}
    </header>
  );
}

function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 5-7 7 7 7" />
    </svg>
  );
}

function RulesIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
