import { useCallback, useEffect, useRef, useState } from "react";
import type { Phase, TimerConfig } from "../types";
import { playPhaseStart, playSessionEnd, vibrateEnd, vibratePhase } from "../lib/alerts";

export type TimerStatus = "idle" | "running" | "paused" | "finished";
export type FlashKind = Phase | "end";

export interface TimerSnapshot {
  status: TimerStatus;
  phase: Phase;
  round: number;
  remainingMs: number;
  totalMs: number;
  config: TimerConfig;
}

export interface Flash {
  kind: FlashKind;
  key: number;
}

export interface TimerApi {
  snapshot: TimerSnapshot;
  flash: Flash | null;
  start: (config: TimerConfig) => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  stop: () => void;
}

interface Engine {
  status: TimerStatus;
  phase: Phase;
  round: number;
  totalMs: number;
  deadline: number | null;
  remainingMs: number;
  config: TimerConfig;
}

const DEFAULT_CONFIG: TimerConfig = {
  workoutSeconds: 0,
  breakSeconds: 0,
  rounds: 5,
};

export function createEngine(config: TimerConfig): Engine {
  const totalMs = config.workoutSeconds * 1000;
  return {
    status: "idle",
    phase: "work",
    round: 1,
    totalMs,
    deadline: null,
    remainingMs: totalMs,
    config,
  };
}

function durationOf(engine: Engine, phase: Phase): number {
  const seconds = phase === "work" ? engine.config.workoutSeconds : engine.config.breakSeconds;
  return Math.max(0, seconds) * 1000;
}

export function advance(engine: Engine, now: number, out: FlashKind[]): void {
  let guard = 0;
  while (engine.deadline !== null && now >= engine.deadline && guard < 10000) {
    guard += 1;
    if (engine.phase === "work") {
      if (engine.round >= engine.config.rounds) {
        engine.status = "finished";
        engine.deadline = null;
        engine.remainingMs = 0;
        out.push("end");
        return;
      }
      engine.phase = "break";
      const breakMs = durationOf(engine, "break");
      engine.totalMs = breakMs;
      engine.deadline += breakMs;
      if (breakMs > 0) out.push("break");
    } else {
      engine.phase = "work";
      engine.round += 1;
      const workMs = durationOf(engine, "work");
      engine.totalMs = workMs;
      engine.deadline += workMs;
      out.push("work");
    }
  }
}

function displaySignature(engine: Engine, now: number): string {
  const remaining =
    engine.deadline !== null ? Math.max(0, engine.deadline - now) : engine.remainingMs;
  const bucket =
    engine.totalMs > 0
      ? Math.min(200, Math.max(0, Math.round((1 - remaining / engine.totalMs) * 200)))
      : 0;
  return `${engine.status}|${engine.phase}|${engine.round}|${Math.ceil(remaining / 1000)}|${bucket}`;
}

export function useTimer(): TimerApi {
  const engineRef = useRef<Engine | null>(null);
  if (engineRef.current === null) engineRef.current = createEngine(DEFAULT_CONFIG);
  const flashKeyRef = useRef(0);
  const [, setVersion] = useState(0);
  const [flash, setFlash] = useState<Flash | null>(null);

  const render = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const signatureRef = useRef("");

  const announce = useCallback((kinds: FlashKind[]) => {
    if (kinds.length === 0) return;
    for (const kind of kinds) {
      if (kind === "end") {
        playSessionEnd();
        vibrateEnd();
      } else {
        playPhaseStart(kind);
        vibratePhase(kind);
      }
    }
    const last = kinds[kinds.length - 1];
    flashKeyRef.current += 1;
    setFlash({ kind: last, key: flashKeyRef.current });
  }, []);

  const pump = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || engine.status !== "running" || engine.deadline === null) return;
    const now = Date.now();
    if (now >= engine.deadline) {
      const kinds: FlashKind[] = [];
      advance(engine, now, kinds);
      announce(kinds);
    }
    const signature = displaySignature(engine, now);
    if (signature !== signatureRef.current) {
      signatureRef.current = signature;
      render();
    }
  }, [announce, render]);

  const status = engineRef.current.status;

  useEffect(() => {
    if (status !== "running") return;
    let raf = 0;
    const loop = () => {
      pump();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const interval = window.setInterval(pump, 1000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(interval);
    };
  }, [pump, status]);

  const start = useCallback(
    (config: TimerConfig) => {
      const engine = engineRef.current;
      if (!engine) return;
      const next: TimerConfig = {
        workoutSeconds: Math.max(1, Math.floor(config.workoutSeconds)),
        breakSeconds: Math.max(0, Math.floor(config.breakSeconds)),
        rounds: Math.max(1, Math.floor(config.rounds)),
      };
      const totalMs = next.workoutSeconds * 1000;
      engine.status = "running";
      engine.phase = "work";
      engine.round = 1;
      engine.config = next;
      engine.totalMs = totalMs;
      engine.remainingMs = totalMs;
      engine.deadline = Date.now() + totalMs;
      render();
    },
    [render],
  );

  const pause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || engine.status !== "running" || engine.deadline === null) return;
    engine.remainingMs = Math.max(0, engine.deadline - Date.now());
    engine.deadline = null;
    engine.status = "paused";
    render();
  }, [render]);

  const resume = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || engine.status !== "paused") return;
    engine.deadline = Date.now() + engine.remainingMs;
    engine.status = "running";
    render();
  }, [render]);

  const skip = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.status !== "running" && engine.status !== "paused") return;
    const now = Date.now();
    const wasPaused = engine.status === "paused";
    engine.deadline = now;
    const kinds: FlashKind[] = [];
    advance(engine, now, kinds);
    if (engine.deadline !== null) {
      engine.remainingMs = Math.max(0, engine.deadline - now);
      if (wasPaused) {
        engine.deadline = null;
      }
    }
    announce(kinds);
    render();
  }, [announce, render]);

  const stop = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const fresh = createEngine(engine.config);
    engine.status = fresh.status;
    engine.phase = fresh.phase;
    engine.round = fresh.round;
    engine.totalMs = fresh.totalMs;
    engine.remainingMs = fresh.remainingMs;
    engine.deadline = null;
    setFlash(null);
    render();
  }, [render]);

  const engine = engineRef.current;
  const now = Date.now();
  const remainingMs =
    engine.status === "running" && engine.deadline !== null
      ? Math.max(0, engine.deadline - now)
      : engine.remainingMs;

  const snapshot: TimerSnapshot = {
    status: engine.status,
    phase: engine.phase,
    round: engine.round,
    remainingMs,
    totalMs: engine.totalMs,
    config: engine.config,
  };

  return { snapshot, flash, start, pause, resume, skip, stop };
}
