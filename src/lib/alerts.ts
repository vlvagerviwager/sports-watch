import type { Phase } from "../types";

let audioContext: AudioContext | null = null;

export function unlockAudio(): void {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    if (!audioContext) audioContext = new Ctor();
    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }
  } catch {
    audioContext = null;
  }
}

function tone(frequency: number, durationMs: number, delayMs = 0): void {
  if (!audioContext || audioContext.state !== "running") return;
  const start = audioContext.currentTime + delayMs / 1000;
  const end = start + durationMs / 1000;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.18, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.05);
}

export function playPhaseStart(phase: Phase): void {
  if (phase === "work") {
    tone(880, 160);
    tone(880, 160, 200);
  } else {
    tone(520, 140);
    tone(520, 140, 180);
    tone(520, 140, 360);
  }
}

export function playSessionEnd(): void {
  tone(660, 160);
  tone(880, 160, 180);
  tone(1100, 320, 360);
}

export function vibratePhase(phase: Phase): void {
  if (typeof navigator.vibrate !== "function") return;
  if (phase === "work") {
    navigator.vibrate(150);
  } else {
    navigator.vibrate([100, 80, 100]);
  }
}

export function vibrateEnd(): void {
  if (typeof navigator.vibrate !== "function") return;
  navigator.vibrate([300, 100, 300, 100, 400]);
}
