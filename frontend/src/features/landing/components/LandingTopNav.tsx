import { useState } from "react";
import { useConnectionStore } from "@/app/stores/useConnectionStore";
import { getMagicMazeLogoImage } from "@/shared/utils/assetPaths";

const NAV_CONTENT = {
  how: {
    title: "How it Works",
    body: [
      "Create a room, share the code, then move shared heroes using only the action card assigned to you.",
      "Explore new tiles, collect all four hero items, then escape before the sand timer runs out.",
    ],
  },
  scenarios: {
    title: "Scenarios",
    body: [
      "Start with Discovery, then unlock matching exits, action-card passing, orange walls, crystal balls, and security cameras.",
      "Each scenario keeps the same core board but adds one rule layer at a time.",
    ],
  },
  about: {
    title: "About",
    body: [
      "Magic Maze Online is a real-time cooperative board-game adaptation with server-validated movement and room sync.",
      "Sessions are MVP in-memory rooms, with same-browser reconnect support while the room is active.",
    ],
  },
} as const;

type NavPanel = keyof typeof NAV_CONTENT;

export function LandingTopNav() {
  const connected = useConnectionStore((state) => state.connected);
  const [openPanel, setOpenPanel] = useState<NavPanel | undefined>();

  const togglePanel = (panel: NavPanel) => {
    setOpenPanel((current) => (current === panel ? undefined : panel));
  };

  const content = openPanel ? NAV_CONTENT[openPanel] : undefined;

  return (
    <header className="landing-nav">
      <img className="brand-logo brand-logo-landing" src={getMagicMazeLogoImage()} alt="Magic Maze Online" />
      <nav>
        <button className="landing-nav-link" type="button" onClick={() => togglePanel("how")}>How it Works</button>
        <button className="landing-nav-link" type="button" onClick={() => togglePanel("scenarios")}>Scenarios</button>
        <button className="landing-nav-link" type="button" onClick={() => togglePanel("about")}>About</button>
      </nav>
      <span className={`connection-pill ${connected ? "connected" : ""}`}>{connected ? "Connected" : "Disconnected"}</span>
      {content && (
        <div className="landing-nav-overlay" onClick={() => setOpenPanel(undefined)}>
          <section
            className="landing-nav-popover"
            role="dialog"
            aria-modal="true"
            aria-labelledby="landing-nav-popover-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div>
              <h2 id="landing-nav-popover-title">{content.title}</h2>
              {content.body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <button className="ghost-button" type="button" onClick={() => setOpenPanel(undefined)}>Close</button>
          </section>
        </div>
      )}
    </header>
  );
}
