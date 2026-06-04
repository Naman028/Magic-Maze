import { SandTimer } from "@/domain/game.types";

function format(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const mins = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
  const secs = (safeSeconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export function TimerPanel({ sandTimer }: { sandTimer: SandTimer }) {
  const displaySeconds = sandTimer.remainingSeconds;

  return (
    <section className={`timer-panel ${displaySeconds < 30 ? "danger" : ""}`}>
      <span>TIME</span>
      <strong>{format(displaySeconds)}</strong>
      <small>{sandTimer.isFinalCountdown ? "Final countdown" : `${sandTimer.usedSandTimerCellIds.length} timer spaces used`}</small>
    </section>
  );
}
