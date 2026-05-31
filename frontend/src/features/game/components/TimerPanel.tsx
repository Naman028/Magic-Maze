import { SandTimer } from "@/domain/game.types";

function format(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.max(0, seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export function TimerPanel({ sandTimer }: { sandTimer: SandTimer }) {
  return (
    <section className={`timer-panel ${sandTimer.remainingSeconds < 30 ? "danger" : ""}`}>
      <span>⌛</span>
      <strong>{format(sandTimer.remainingSeconds)}</strong>
      <small>{sandTimer.isFinalCountdown ? "Final countdown" : `${sandTimer.usedSandTimerCellIds.length} timer spaces used`}</small>
    </section>
  );
}
