import type { TimerApi } from "../hooks/useTimer";
import { formatClock, formatDuration } from "../lib/time";

interface SessionViewProps {
  timer: TimerApi;
  onStop: () => void;
}

export function SessionView({ timer, onStop }: SessionViewProps) {
  const { snapshot } = timer;
  const { status, phase, round, remainingMs, totalMs, config } = snapshot;

  if (status === "finished") {
    return (
      <main className="session session-finished">
        <div className="session-center">
          <p className="phase-label phase-end">Done</p>
          <h2 className="finished-title">Session complete</h2>
          <p className="finished-stats">
            {config.rounds} rounds
            <br />
            {formatDuration(
              config.workoutSeconds * config.rounds +
                config.breakSeconds * Math.max(0, config.rounds - 1),
            )}{" "}
            of work and breaks
          </p>
        </div>
        <div className="controls">
          <button type="button" className="btn btn-primary" onClick={onStop}>
            Back to setup
          </button>
        </div>
      </main>
    );
  }

  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const progress =
    totalMs > 0 ? Math.min(1, Math.max(0, 1 - remainingMs / totalMs)) : 0;
  const isLastRound = phase === "work" && round >= config.rounds;

  const nextHint =
    phase === "work"
      ? isLastRound
        ? "Last round. Finish strong."
        : `Next: ${formatDuration(config.breakSeconds)} break`
      : `Next: ${formatDuration(config.workoutSeconds)} workout`;

  const paused = status === "paused";
  const dots = config.rounds <= 24 ? Array.from({ length: config.rounds }, (_, i) => i + 1) : [];

  return (
    <main className="session" data-phase={phase} data-paused={paused}>
      <div className="session-top">
        <div className="round-line">
          <span className="round-text">
            Round {round} / {config.rounds}
          </span>
          <div className="round-dots" aria-hidden="true">
            {dots.map((n) => (
              <span
                key={n}
                className={
                  "round-dot" +
                  (n < round ? " is-done" : n === round ? " is-active" : "")
                }
              />
            ))}
          </div>
        </div>

        <p className="phase-label">{phase === "work" ? "Work" : "Break"}</p>

        <div className="clock" aria-live="off">
          {formatClock(remainingSeconds)}
        </div>

        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
        </div>

        <p className="next-hint">{paused ? "Paused" : nextHint}</p>
      </div>

      <div className="controls">
        <button
          type="button"
          className="btn btn-primary btn-big"
          onClick={() => (paused ? timer.resume() : timer.pause())}
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <div className="controls-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={timer.skip}
            disabled={status === "idle"}
          >
            Skip
          </button>
          <button type="button" className="btn btn-danger" onClick={onStop}>
            Stop
          </button>
        </div>
      </div>
    </main>
  );
}
