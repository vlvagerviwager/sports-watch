export interface TimerConfig {
  workoutSeconds: number;
  breakSeconds: number;
  rounds: number;
}

export interface Preset {
  id: string;
  name: string;
  config: TimerConfig;
  createdAt: number;
}

export type Phase = "work" | "break";
