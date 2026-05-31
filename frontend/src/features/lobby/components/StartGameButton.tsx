import { emitters } from "@/services/socket/socketEmitters";

export function StartGameButton({ isHost }: { isHost: boolean }) {
  return <button className="gold-button" disabled={!isHost} onClick={() => emitters.startGame()}>{isHost ? "START GAME" : "Waiting for host"}</button>;
}
