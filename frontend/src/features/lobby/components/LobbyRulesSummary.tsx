import { GameSession } from "@/domain/game.types";

export function LobbyRulesSummary({ session }: { session: GameSession }) {
  return (
    <section className="panel rules-summary">
      <h2>Rules Preview</h2>
      <p>{session.scenario.description}</p>
      <ul>
        <li>Communication: {session.scenario.communicationAlwaysOpen ? "Open tutorial mode" : "Silent gameplay"}</li>
        <li>Exit rule: {session.scenario.matchingExitsRequired ? "Matching exits" : "Single purple exit"}</li>
        <li>Timer: {session.difficultySettings.timeLimitSeconds}s</li>
      </ul>
    </section>
  );
}
