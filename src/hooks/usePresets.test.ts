import { beforeEach, describe, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { usePresets } from "./usePresets";
import type { TimerConfig } from "../types";

const STORAGE_KEY = "sports-watch/presets/v1";

const config: TimerConfig = { workoutSeconds: 45, breakSeconds: 15, rounds: 5 };

beforeEach(() => {
  window.localStorage.clear();
});

describe("usePresets", () => {
  test("saves a preset to state and localStorage", () => {
    const { result } = renderHook(() => usePresets());

    act(() => result.current.savePreset("Leg day", config));

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe("Leg day");
    expect(result.current.presets[0].config).toEqual(config);

    const stored: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(Array.isArray(stored)).toBe(true);
    expect((stored as unknown[]).length).toBe(1);
  });

  test("ignores blank preset names", () => {
    const { result } = renderHook(() => usePresets());

    act(() => result.current.savePreset("   ", config));

    expect(result.current.presets).toHaveLength(0);
  });

  test("deletes a preset from state and localStorage", () => {
    const { result } = renderHook(() => usePresets());
    act(() => result.current.savePreset("Leg day", config));
    const id = result.current.presets[0].id;

    act(() => result.current.deletePreset(id));

    expect(result.current.presets).toHaveLength(0);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("[]");
  });

  test("filters out malformed entries when reading storage", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ name: "broken" }, { id: "a", name: "ok", createdAt: 1, config }]),
    );

    const { result } = renderHook(() => usePresets());

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe("ok");
  });

  test("returns an empty list when storage holds invalid JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "not json");

    const { result } = renderHook(() => usePresets());

    expect(result.current.presets).toHaveLength(0);
  });
});
