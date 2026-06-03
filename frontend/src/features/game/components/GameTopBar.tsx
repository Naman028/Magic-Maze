import { useState } from "react";
import { GameSession } from "@/domain/game.types";
import { emitters } from "@/services/socket/socketEmitters";

export function GameTopBar({ session }: { session: GameSession }) {
  const [openPanel, setOpenPanel] = useState<"help" | "settings" | "menu" | undefined>();

  const togglePanel = (panel: "help" | "settings" | "menu") => {
    setOpenPanel((current) => (current === panel ? undefined : panel));
  };

  return (
    <header className="game-topbar">
      <div className="brand-mark compact">MAGIC<br /><span>MAZE</span></div>
      <button className="ghost-button" onClick={() => emitters.returnToLobby()}>{"<-"} Back to Lobby</button>
      <div className="scenario-banner">
        <strong>{session.scenario.name.toUpperCase()}</strong>
        <span>{session.scenario.description}</span>
      </div>
      <button className="ghost-button" onClick={() => togglePanel("help")}>? How to Play</button>
      <button className="icon-button" aria-label="Settings" onClick={() => togglePanel("settings")}>Settings</button>
      <button className="icon-button" aria-label="Menu" onClick={() => togglePanel("menu")}>Menu</button>

      {openPanel === "help" && (
        <div className="topbar-popover help-popover">
          <h2>How to Play</h2>
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
          <button onClick={() => emitters.returnToLobby()}>Return to Lobby</button>
          <button onClick={() => emitters.signal("Attention")}>Do Something</button>
          <button onClick={() => setOpenPanel(undefined)}>Close Menu</button>
        </div>
      )}
    </header>
  );
}
