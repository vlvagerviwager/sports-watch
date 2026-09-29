import { describe, expect, test } from "bun:test";
import {
  clampInt,
  formatClock,
  formatDuration,
  partsFromSeconds,
  secondsFromParts,
  sessionTotalSeconds,
} from "./time";

describe("clampInt", () => {
  test("clamps below the minimum", () => {
    expect(clampInt(-5, 1, 99)).toBe(1);
  });

  test("clamps above the maximum", () => {
    expect(clampInt(500, 1, 99)).toBe(99);
  });

  test("returns the minimum for NaN", () => {
    expect(clampInt(Number.NaN, 1, 99)).toBe(1);
  });

  test("rounds fractional values", () => {
    expect(clampInt(4.6, 1, 99)).toBe(5);
  });
});

describe("partsFromSeconds and secondsFromParts", () => {
  test("splits a total into hours, minutes, and seconds", () => {
    expect(partsFromSeconds(3661)).toEqual([1, 1, 1]);
    expect(partsFromSeconds(59)).toEqual([0, 0, 59]);
  });

  test("never returns negative parts", () => {
    expect(partsFromSeconds(-10)).toEqual([0, 0, 0]);
  });

  test("roundtrip preserves totals", () => {
    expect(secondsFromParts(...partsFromSeconds(7531))).toBe(7531);
  });
});

describe("formatClock", () => {
  test("uses mm:ss below one hour", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(95)).toBe("01:35");
  });

  test("uses hh:mm:ss at one hour or more", () => {
    expect(formatClock(3600)).toBe("01:00:00");
    expect(formatClock(3661)).toBe("01:01:01");
  });
});

describe("formatDuration", () => {
  test("returns 0 s for zero", () => {
    expect(formatDuration(0)).toBe("0 s");
  });

  test("formats seconds, minutes, and hours", () => {
    expect(formatDuration(45)).toBe("45 s");
    expect(formatDuration(120)).toBe("2 min");
    expect(formatDuration(3660)).toBe("1 hr 1 min");
  });

  test("drops seconds when hours are present", () => {
    expect(formatDuration(3725)).toBe("1 hr 2 min");
  });
});

describe("sessionTotalSeconds", () => {
  test("adds workout for every round and break between rounds", () => {
    expect(
      sessionTotalSeconds({ workoutSeconds: 30, breakSeconds: 15, rounds: 4 }),
    ).toBe(30 * 4 + 15 * 3);
  });

  test("has no break after the final round", () => {
    expect(sessionTotalSeconds({ workoutSeconds: 30, breakSeconds: 15, rounds: 1 })).toBe(30);
  });
});
