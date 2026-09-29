import { useEffect, useState } from "react";
import type { Preset, TimerConfig } from "../types";
import { clampInt, formatDuration, sessionTotalSeconds } from "../lib/time";
import { TimeInput } from "./TimeInput";
import { PresetList } from "./PresetList";
import { LuchadorMask } from "./LuchadorMask";

interface SetupViewProps {
  config: TimerConfig;
  onConfigChange: (config: TimerConfig) => void;
  presets: Preset[];
  onSavePreset: (name: string, config: TimerConfig) => void;
  onDeletePreset: (id: string) => void;
  onStart: () => void;
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
  };

  const changeRounds = (delta: number) => {
    const next = clampInt(config.rounds + delta, 1, 99);
    setRoundsDraft(String(next));
    patch({ rounds: next });
  };

  return (
    <main className="setup">
      <header className="app-header">
        <LuchadorMask className="header-mask" size={68} />
        <h1 className="app-title">Sports Watch</h1>
        <div className="rope-divider" aria-hidden="true">
          <span />
        </div>
      </header>

      <section className="card" aria-labelledby="presets-heading">
        <h2 className="card-title" id="presets-heading">
          Presets
        </h2>
        <PresetList
          presets={presets}
          onLoad={(next) => onConfigChange({ ...next })}
          onDelete={onDeletePreset}
        />
        <div className="preset-save">
          <input
            className="text-input"
            type="text"
            placeholder="Preset name"
            maxLength={40}
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
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
      </section>

      <section className="card" aria-labelledby="timer-heading">
        <h2 className="card-title" id="timer-heading">
          Timer
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
          <span className="field-label" id="rounds-label">
            Rounds
          </span>
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
              className="rounds-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Number of rounds"
              value={roundsDraft}
              onChange={(e) => {
                const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
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
    </main>
  );
}
