import { useState } from "react";
import { LandingHeroSection } from "@/features/landing/components/LandingHeroSection";
import { LandingTopNav } from "@/features/landing/components/LandingTopNav";
import { emitters } from "@/services/socket/socketEmitters";

export function LandingPage() {
  const [nickname, setNickname] = useState(localStorage.getItem("magicMaze.nickname") ?? "Guest");
  const [roomCode, setRoomCode] = useState("");
  const safeName = nickname.trim() || "Guest";

  return (
    <div className="landing-page">
      <LandingTopNav />
      <main className="landing-grid">
        <LandingHeroSection />
        <aside className="landing-actions">
          <section className="start-game-panel">
            <div className="start-game-header">
              <span className="start-game-gem">◆</span>
              <h2>START GAME</h2>
            </div>
            <label className="field-label">
              Nickname
              <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Guest" />
            </label>
            <div className="mode-section">
              <p className="mode-label">Choose Mode</p>
              <div className="room-mode-actions">
                <button className="gold-button mode-btn" onClick={() => emitters.createRoom(safeName)}>Solo Room</button>
                <button className="purple-button mode-btn" onClick={() => emitters.createRoom(safeName)}>Multiplayer Room</button>
              </div>
            </div>
            <div className="join-section">
              <div className="inline-form">
                <input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                />
                <button className="purple-button" onClick={() => emitters.joinRoom(roomCode, safeName)}>Join Room</button>
              </div>
            </div>
            <button className="gold-button create-room-btn" onClick={() => emitters.createRoom(safeName)}>
              Create Room
            </button>
          </section>
        </aside>
      </main>
    </div>
  );
}
