import { describe, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import type { TimerConfig } from "../types";
import { advance, createEngine, useTimer, type FlashKind } from "./useTimer";

function runningEngine(config: TimerConfig, deadline: number) {
  const engine = createEngine(config);
  engine.status = "running";
  engine.deadline = deadline;
  return engine;
}

describe("createEngine", () => {
  test("starts idle on the first round", () => {
    const engine = createEngine({ workoutSeconds: 45, breakSeconds: 10, rounds: 3 });
    expect(engine.status).toBe("idle");
    expect(engine.phase).toBe("work");
    expect(engine.round).toBe(1);
    expect(engine.deadline).toBeNull();
    expect(engine.remainingMs).toBe(45000);
  });
});

describe("advance", () => {
  test("cycles work and break rounds until finished", () => {
    const engine = runningEngine({ workoutSeconds: 10, breakSeconds: 5, rounds: 3 }, 1000);
    const out: FlashKind[] = [];

    advance(engine, 1000, out);
    expect(engine.phase).toBe("break");
    expect(engine.deadline).toBe(6000);

    advance(engine, 6000, out);
    expect(engine.phase).toBe("work");
    expect(engine.round).toBe(2);
    expect(engine.deadline).toBe(16000);

    advance(engine, 16000, out);
    expect(engine.phase).toBe("break");
    expect(engine.round).toBe(2);

    advance(engine, 21000, out);
    expect(engine.phase).toBe("work");
    expect(engine.round).toBe(3);
    expect(engine.deadline).toBe(31000);

    advance(engine, 31000, out);
    expect(engine.status).toBe("finished");
    expect(engine.deadline).toBeNull();
    expect(engine.remainingMs).toBe(0);

    expect(out).toEqual(["break", "work", "break", "work", "end"]);
  });

  test("skips zero-length breaks without a break flash", () => {
    const engine = runningEngine({ workoutSeconds: 10, breakSeconds: 0, rounds: 2 }, 1000);
    const out: FlashKind[] = [];

    advance(engine, 1000, out);
    expect(engine.phase).toBe("work");
    expect(engine.round).toBe(2);
    expect(engine.deadline).toBe(11000);
    expect(out).toEqual(["work"]);

    advance(engine, 11000, out);
    expect(engine.status).toBe("finished");
    expect(out).toEqual(["work", "end"]);
  });

  test("catches up when several phases elapsed at once", () => {
    const engine = runningEngine({ workoutSeconds: 10, breakSeconds: 5, rounds: 3 }, 1000);
    const out: FlashKind[] = [];

    advance(engine, 50000, out);
    expect(engine.status).toBe("finished");
    expect(engine.deadline).toBeNull();
    expect(out[out.length - 1]).toBe("end");
  });

  test("does not finish while rounds remain", () => {
    const engine = runningEngine({ workoutSeconds: 10, breakSeconds: 5, rounds: 2 }, 1000);
    const out: FlashKind[] = [];

    advance(engine, 15000, out);
    expect(engine.status).toBe("running");
    expect(engine.round).toBe(2);
    expect(engine.phase).toBe("work");
    expect(out).toEqual(["break", "work"]);
    expect(out).not.toContain("end");
  });

  test("does nothing before the deadline", () => {
    const engine = runningEngine({ workoutSeconds: 10, breakSeconds: 5, rounds: 3 }, 5000);
    const out: FlashKind[] = [];

    advance(engine, 4999, out);
    expect(engine.phase).toBe("work");
    expect(engine.deadline).toBe(5000);
    expect(out).toEqual([]);
  });
});

describe("useTimer controls", () => {
  test("skip advances phases while paused and stays paused", () => {
    const { result } = renderHook(() => useTimer());

    act(() => result.current.start({ workoutSeconds: 10, breakSeconds: 5, rounds: 3 }));
    expect(result.current.snapshot.status).toBe("running");

    act(() => result.current.pause());
    expect(result.current.snapshot.status).toBe("paused");

    act(() => result.current.skip());
    expect(result.current.snapshot.status).toBe("paused");
    expect(result.current.snapshot.phase).toBe("break");
    expect(result.current.snapshot.remainingMs).toBe(5000);

    act(() => result.current.skip());
    expect(result.current.snapshot.status).toBe("paused");
    expect(result.current.snapshot.phase).toBe("work");
    expect(result.current.snapshot.round).toBe(2);
    expect(result.current.snapshot.remainingMs).toBe(10000);
  });
});
