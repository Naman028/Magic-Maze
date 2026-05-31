import { useState } from "react";
import { emitters } from "@/services/socket/socketEmitters";

export function CreateRoomPanel({ nickname }: { nickname: string }) {
  const [name, setName] = useState(nickname || "Guest");
  const safeName = name.trim() || "Guest";

  return (
    <section className="create-panel">
      <div className="create-die">◆</div>
      <div>
        <h2>Create a Room</h2>
        <p>Choose solo for one-player action deck play, or multiplayer to invite friends by code.</p>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nickname" />
        <div className="room-mode-actions">
          <button className="gold-button" onClick={() => emitters.createRoom(safeName)}>Solo Room</button>
          <button className="purple-button" onClick={() => emitters.createRoom(safeName)}>Multiplayer Room</button>
        </div>
      </div>
    </section>
  );
}
