import { emitters } from "@/services/socket/socketEmitters";

export function PostGameControls({ isHost }: { isHost: boolean }) {
  if (!isHost) return <p>Waiting for host to reset the room.</p>;
  return (
    <div className="button-row">
      <button className="gold-button" onClick={() => emitters.playAgain()}>Play Again</button>
      <button className="purple-button" onClick={() => emitters.returnToLobby()}>Return to Lobby</button>
    </div>
  );
}
