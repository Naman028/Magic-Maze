import { ScenarioDefinition } from "@/domain/game.types";
import { emitters } from "@/services/socket/socketEmitters";

export function ScenarioSelector({ scenarios, selectedId, disabled }: { scenarios: ScenarioDefinition[]; selectedId: string; disabled: boolean }) {
  return (
    <label className="field-label">Scenario
      <select value={selectedId} disabled={disabled} onChange={(event) => emitters.selectScenario(event.target.value)}>
        {scenarios.map((scenario) => <option key={scenario.scenarioId} value={scenario.scenarioId}>{scenario.name}</option>)}
      </select>
    </label>
  );
}
