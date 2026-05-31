import { useState } from "react";
import { CreateRoomPanel } from "@/features/landing/components/CreateRoomPanel";
import { JoinRoomPanel } from "@/features/landing/components/JoinRoomPanel";
import { LandingHeroSection } from "@/features/landing/components/LandingHeroSection";
import { LandingTopNav } from "@/features/landing/components/LandingTopNav";

export function LandingPage() {
  const [nickname, setNickname] = useState(localStorage.getItem("magicMaze.nickname") ?? "Guest");
  return (
    <div className="landing-page">
      <LandingTopNav />
      <main className="landing-grid">
        <LandingHeroSection />
        <aside className="landing-actions">
          <section className="auth-panel room-first-panel">
            <h2>PLAY WITHOUT LOGIN</h2>
            <label>Nickname<input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="Guest name" /></label>
            <p>Create a solo room or host a multiplayer room. Friends join with the room code.</p>
          </section>
          <JoinRoomPanel defaultNickname={nickname} />
          <CreateRoomPanel nickname={nickname} />
        </aside>
      </main>
    </div>
  );
}
