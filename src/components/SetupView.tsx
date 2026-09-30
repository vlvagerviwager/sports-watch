import { useEffect, useState } from "react";
import type { Preset, TimerConfig } from "../types";
import { clampInt, formatDuration, sessionTotalSeconds } from "../lib/time";
import { MAX_PRESET_NAME_LENGTH } from "../hooks/usePresets";
import { TimeInput } from "./TimeInput";
import { PresetList } from "./PresetList";

interface SetupViewProps {
  config: TimerConfig;
  onConfigChange: (config: TimerConfig) => void;
  presets: Preset[];
  onSavePreset: (name: string, config: TimerConfig) => void;
  onDeletePreset: (id: string) => void;
  onStart: () => void;
}

function configsEqual(a: TimerConfig, b: TimerConfig): boolean {
  return (
    a.workoutSeconds === b.workoutSeconds &&
    a.breakSeconds === b.breakSeconds &&
    a.rounds === b.rounds
  );
}

export function SetupView({
  config,
  onConfigChange,
  presets,
  onSavePreset,
  onDeletePreset,
  onStart,
}: SetupViewProps) {
  const [presetName, setPresetName] = useState("");
  const [roundsDraft, setRoundsDraft] = useState(String(config.rounds));
  const [presetsOpen, setPresetsOpen] = useState(presets.length === 0);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  useEffect(() => {
    if (presets.length === 0) {
      setPresetsOpen(true);
    }
  }, [presets.length]);

  useEffect(() => {
    if (selectedPresetId === null) return;
    const preset = presets.find((candidate) => candidate.id === selectedPresetId);
    if (!preset || !configsEqual(preset.config, config)) {
      setSelectedPresetId(null);
    }
  }, [config, presets, selectedPresetId]);

  const handleLoadPreset = (preset: Preset) => {
    onConfigChange({ ...preset.config });
    setSelectedPresetId(preset.id);
  };

  const handleDeletePreset = (id: string) => {
    onDeletePreset(id);
    if (selectedPresetId === id) {
      setSelectedPresetId(null);
    }
  };

  useEffect(() => {
    const parsed =
      roundsDraft.trim() === ""
        ? config.rounds
        : clampInt(Number(roundsDraft), 1, 99);
    if (parsed !== config.rounds) {
      setRoundsDraft(String(config.rounds));
    }
  }, [config.rounds, roundsDraft]);

  const patch = (partial: Partial<TimerConfig>) => {
    onConfigChange({ ...config, ...partial });
  };

  const canStart = config.workoutSeconds >= 1 && config.rounds >= 1;

  const save = () => {
    const name = presetName.trim();
    if (name === "") return;
    onSavePreset(name, config);
    setPresetName("");
    setPresetsOpen(true);
  };

  const changeRounds = (delta: number) => {
    const next = clampInt(config.rounds + delta, 1, 99);
    setRoundsDraft(String(next));
    patch({ rounds: next });
  };

  return (
    <main className="setup">
      <header className="app-header">
        <h1 className="app-title">Sports Watch</h1>
        <div className="rope-divider" aria-hidden="true">
          <span />
        </div>
      </header>

      <section className="card" aria-labelledby="presets-heading">
        <h2 className="card-title" id="presets-heading">
          <button
            type="button"
            className="card-toggle"
            aria-expanded={presetsOpen}
            aria-controls="presets-panel"
            onClick={() => setPresetsOpen((open) => !open)}
          >
            <span className="card-title-text">Presets</span>
            <svg
              className={"chevron" + (presetsOpen ? " is-open" : "")}
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M3 6 L8 11 L13 6" />
            </svg>
          </button>
        </h2>
        <div id="presets-panel" className="presets-panel" hidden={!presetsOpen}>
          <PresetList
            presets={presets}
            selectedId={selectedPresetId}
            onLoad={handleLoadPreset}
            onDelete={handleDeletePreset}
          />
          <div className="preset-save">
            <input
              className="text-input"
              type="text"
              placeholder="Preset name"
              maxLength={MAX_PRESET_NAME_LENGTH}
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") save();
              }}
              aria-label="Preset name"
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={save}
              disabled={presetName.trim() === ""}
            >
              Save
            </button>
          </div>
        </div>
      </section>

      <section className="card" aria-labelledby="timer-heading">
        <h2 className="card-title" id="timer-heading">
          <span className="card-title-text">Timer</span>
        </h2>

        <TimeInput
          label="Workout"
          seconds={config.workoutSeconds}
          onChange={(workoutSeconds) => patch({ workoutSeconds })}
        />
        <TimeInput
          label="Break"
          seconds={config.breakSeconds}
          onChange={(breakSeconds) => patch({ breakSeconds })}
        />

        <div className="field">
          <label className="field-label" id="rounds-label" htmlFor="rounds-input">
            Rounds
          </label>
          <div className="stepper" role="group" aria-labelledby="rounds-label">
            <button
              type="button"
              className="btn btn-step"
              onClick={() => changeRounds(-1)}
              disabled={config.rounds <= 1}
              aria-label="Decrease rounds"
            >
              −
            </button>
            <input
              id="rounds-input"
              className="rounds-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Number of rounds"
              value={roundsDraft}
              onChange={(event) => {
                const digits = event.target.value.replace(/[^0-9]/g, "").slice(0, 2);
                setRoundsDraft(digits);
                if (digits !== "") {
                  patch({ rounds: clampInt(Number(digits), 1, 99) });
                }
              }}
              onBlur={() => {
                const next =
                  roundsDraft.trim() === "" ? 1 : clampInt(Number(roundsDraft), 1, 99);
                setRoundsDraft(String(next));
                patch({ rounds: next });
              }}
            />
            <button
              type="button"
              className="btn btn-step"
              onClick={() => changeRounds(1)}
              disabled={config.rounds >= 99}
              aria-label="Increase rounds"
            >
              +
            </button>
          </div>
        </div>

        <p className="total-line">
          Total session: <strong>{formatDuration(sessionTotalSeconds(config))}</strong>
        </p>

        <button
          type="button"
          className="btn btn-primary btn-start"
          onClick={onStart}
          disabled={!canStart}
        >
          Start workout
        </button>
      </section>

      <footer className="app-footer">
        <a
          className="footer-link"
          href="https://github.com/vlvagerviwager/sports-watch"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </footer>
    </main>
  );
}
