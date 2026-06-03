import { useConnectionStore } from "@/app/stores/useConnectionStore";
import { getMagicMazeLogoImage } from "@/shared/utils/assetPaths";

export function LandingTopNav() {
  const connected = useConnectionStore((state) => state.connected);
  return (
    <header className="landing-nav">
      <img className="brand-logo brand-logo-landing" src={getMagicMazeLogoImage()} alt="Magic Maze Online" />
      <nav>
        <a>How it Works</a>
        <a>Scenarios</a>
        <a>About</a>
      </nav>
      <span className={`connection-pill ${connected ? "connected" : ""}`}>{connected ? "Connected" : "Disconnected"}</span>
    </header>
  );
}
