import { useCallback, useState } from "react";
import type { Preset, TimerConfig } from "../types";

const STORAGE_KEY = "sports-watch/presets/v1";

function isValidPreset(value: unknown): value is Preset {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Preset>;
  if (typeof candidate.id !== "string" || typeof candidate.name !== "string") return false;
  if (typeof candidate.createdAt !== "number") return false;
  const config = candidate.config as Partial<TimerConfig> | undefined;
  if (!config) return false;
  return (
    typeof config.workoutSeconds === "number" &&
    typeof config.breakSeconds === "number" &&
    typeof config.rounds === "number"
  );
}

function readPresets(): Preset[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidPreset);
  } catch {
    return [];
  }
}

function writePresets(presets: Preset[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // Storage may be unavailable or full; presets stay in memory for this session.
  }
}

export interface PresetsApi {
  presets: Preset[];
  savePreset: (name: string, config: TimerConfig) => void;
  deletePreset: (id: string) => void;
}

export function usePresets(): PresetsApi {
  const [presets, setPresets] = useState<Preset[]>(readPresets);

  const savePreset = useCallback((name: string, config: TimerConfig) => {
    const trimmed = name.trim().slice(0, 40);
    if (trimmed === "") return;
    const preset: Preset = {
      id:
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: trimmed,
      config: { ...config },
      createdAt: Date.now(),
    };
    setPresets((prev) => {
      const next = [preset, ...prev].slice(0, 30);
      writePresets(next);
      return next;
    });
  }, []);

  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => {
      const next = prev.filter((preset) => preset.id !== id);
      writePresets(next);
      return next;
    });
  }, []);

  return { presets, savePreset, deletePreset };
}
