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
            <svg className="trash-icon" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
              <rect x="197" y="25" width="117" height="39" rx="6" />
              <path d="M236 64 L276 64 L294 97 L218 97 Z" />
              <rect x="63" y="97" width="386" height="41" rx="9" />
              <path
                className="trash-body"
                d="M104 138 L134 461 Q134 477 150 477 L362 477 Q378 477 378 461 L408 138"
              />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
