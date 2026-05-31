import { DifficultyLevel } from "@/domain/game.types";
import { emitters } from "@/services/socket/socketEmitters";

export function DifficultySelector({ value, disabled }: { value: DifficultyLevel; disabled: boolean }) {
  return (
    <label className="field-label">Difficulty
      <select value={value} disabled={disabled} onChange={(event) => emitters.selectDifficulty(event.target.value as DifficultyLevel)}>
        <option value="Easy">Easy · 04:00</option>
        <option value="Normal">Normal · 03:00</option>
        <option value="Hard">Hard · 02:00</option>
      </select>
    </label>
  );
}
