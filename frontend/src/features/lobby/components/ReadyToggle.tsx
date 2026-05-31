import { Player } from "@/domain/game.types";
import { emitters } from "@/services/socket/socketEmitters";

export function ReadyToggle({ player }: { player?: Player }) {
  return <button className="purple-button" disabled={!player} onClick={() => emitters.ready(!player?.isReady)}>{player?.isReady ? "Mark Not Ready" : "Ready Up"}</button>;
}
