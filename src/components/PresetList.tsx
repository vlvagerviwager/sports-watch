import type { Preset, TimerConfig } from "../types";
import { formatDuration } from "../lib/time";

interface PresetListProps {
  presets: Preset[];
  onLoad: (config: TimerConfig) => void;
  onDelete: (id: string) => void;
}

export function PresetList({ presets, onLoad, onDelete }: PresetListProps) {
  if (presets.length === 0) {
    return <p className="muted small">No presets yet. Save the current setup to reuse it later.</p>;
  }

  return (
    <ul className="preset-list">
      {presets.map((preset) => (
        <li className="preset-row" key={preset.id}>
          <button
            type="button"
            className="preset-load"
            onClick={() => onLoad(preset.config)}
          >
            <span className="preset-name">{preset.name}</span>
            <span className="preset-meta">
              {formatDuration(preset.config.workoutSeconds)} work /{" "}
              {formatDuration(preset.config.breakSeconds)} break / {preset.config.rounds} rounds
            </span>
          </button>
          <button
            type="button"
            className="preset-delete"
            aria-label={`Delete preset ${preset.name}`}
            onClick={() => onDelete(preset.id)}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
