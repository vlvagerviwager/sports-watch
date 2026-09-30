import { expect, test } from "bun:test";
import { useEffect } from "react";
import { render } from "@testing-library/react";
import { useTimer } from "./useTimer";

const OBSERVATION_WINDOW_MS = 1100;
const MINIMUM_RENDER_COUNT = 4;
const UNTHROTTLED_RENDER_COUNT = 30;

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

test("re-renders only when visible values change while running", async () => {
  let renderCount = 0;

  function Probe() {
    renderCount += 1;
    const timer = useTimer();
    useEffect(() => {
      timer.start({ workoutSeconds: 60, breakSeconds: 10, rounds: 3 });
      // Start once on mount; the timer reference is recreated every render.
    }, []);

    return <div>{timer.snapshot.status}</div>;
  }

  render(<Probe />);
  // The timer updates from rAF and interval callbacks outside React events,
  // so the renders are intentionally not wrapped in act.
  await sleep(OBSERVATION_WINDOW_MS);

  expect(renderCount).toBeGreaterThanOrEqual(MINIMUM_RENDER_COUNT);
  expect(renderCount).toBeLessThanOrEqual(UNTHROTTLED_RENDER_COUNT);
});
