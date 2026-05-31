import { useState } from "react";
import { emitters } from "@/services/socket/socketEmitters";

export function JoinRoomPanel({ defaultNickname }: { defaultNickname: string }) {
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState(defaultNickname);
  return (
    <section className="join-panel">
      <h2>JOIN A ROOM</h2>
      <input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="Nickname" />
      <div className="inline-form">
        <input value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} placeholder="# Room Code" />
        <button className="purple-button" onClick={() => emitters.joinRoom(roomCode, nickname || "Guest")}>JOIN LOBBY →</button>
      </div>
    </section>
  );
}
