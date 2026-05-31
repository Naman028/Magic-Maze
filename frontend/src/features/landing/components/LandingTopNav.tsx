import { useConnectionStore } from "@/app/stores/useConnectionStore";

export function LandingTopNav() {
  const connected = useConnectionStore((state) => state.connected);
  return (
    <header className="landing-nav">
      <div className="brand-mark">MAGIC<br /><span>MAZE</span><small>ONLINE</small></div>
      <nav>
        <a>How it Works</a>
        <a>Scenarios</a>
        <a>About</a>
      </nav>
      <span className={`connection-pill ${connected ? "connected" : ""}`}>{connected ? "Connected" : "Disconnected"}</span>
    </header>
  );
}
