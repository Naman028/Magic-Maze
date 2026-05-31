import { Link } from "react-router-dom";
import { ResultOverlay } from "@/features/game/components/ResultOverlay";
import { useGameStore } from "@/app/stores/useGameStore";

export function ResultPage() {
  const { session, playerId } = useGameStore();
  const me = session?.players.find((player) => player.playerId === playerId);
  if (!session) return <main className="center-page"><Link className="gold-button" to="/">Back Home</Link></main>;
  return (
    <main className="center-page">
      <ResultOverlay session={session} isHost={Boolean(me?.isHost)} />
    </main>
  );
}
