import type { TimerConfig } from "../types";

export function clampInt(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function partsFromSeconds(totalSeconds: number): [number, number, number] {
  const total = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds];
}

export function secondsFromParts(hours: number, minutes: number, seconds: number): number {
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatClock(totalSeconds: number): string {
  const [hours, minutes, seconds] = partsFromSeconds(totalSeconds);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function formatDuration(totalSeconds: number): string {
  const [hours, minutes, seconds] = partsFromSeconds(totalSeconds);
  const pieces: string[] = [];
  if (hours > 0) pieces.push(`${hours} hr`);
  if (minutes > 0) pieces.push(`${minutes} min`);
  if (seconds > 0 && hours === 0) pieces.push(`${seconds} s`);
  if (pieces.length === 0) return "0 s";
  return pieces.join(" ");
}

export function sessionTotalSeconds(config: TimerConfig): number {
  const rounds = Math.max(1, config.rounds);
  return config.workoutSeconds * rounds + config.breakSeconds * Math.max(0, rounds - 1);
}
