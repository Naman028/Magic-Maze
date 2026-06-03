import { useEffect, useState } from "react";
import { SandTimer } from "@/domain/game.types";

function format(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.max(0, seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export function TimerPanel({ sandTimer }: { sandTimer: SandTimer }) {
  const [displaySeconds, setDisplaySeconds] = useState(sandTimer.remainingSeconds);

  useEffect(() => {
    setDisplaySeconds(sandTimer.remainingSeconds);
  }, [sandTimer.remainingSeconds]);

  useEffect(() => {
    if (!sandTimer.isRunning || displaySeconds <= 0) return undefined;
    const timerId = window.setInterval(() => {
      setDisplaySeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [displaySeconds, sandTimer.isRunning]);

  return (
    <section className={`timer-panel ${displaySeconds < 30 ? "danger" : ""}`}>
      <span>TIME</span>
      <strong>{format(displaySeconds)}</strong>
      <small>{sandTimer.isFinalCountdown ? "Final countdown" : `${sandTimer.usedSandTimerCellIds.length} timer spaces used`}</small>
    </section>
  );
}
