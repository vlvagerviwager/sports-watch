import { useState } from "react";
import type { TimerConfig } from "./types";
import { useTimer } from "./hooks/useTimer";
import { usePresets } from "./hooks/usePresets";
import { useWakeLock } from "./hooks/useWakeLock";
import { unlockAudio } from "./lib/alerts";
import { SetupView } from "./components/SetupView";
import { SessionView } from "./components/SessionView";

type View = "setup" | "session";

const INITIAL_CONFIG: TimerConfig = {
  workoutSeconds: 45,
  breakSeconds: 15,
  rounds: 4,
};

export default function App() {
  const [config, setConfig] = useState<TimerConfig>(INITIAL_CONFIG);
  const [view, setView] = useState<View>("setup");
  const timer = useTimer();
  const { presets, savePreset, deletePreset } = usePresets();

  useWakeLock(view === "session" && timer.snapshot.status === "running");

  const handleStart = () => {
    unlockAudio();
    timer.start(config);
    setView("session");
  };

  const handleStop = () => {
    timer.stop();
    setView("setup");
  };

  return (
    <div className="app">
      {view === "setup" ? (
        <SetupView
          config={config}
          onConfigChange={setConfig}
          presets={presets}
          onSavePreset={savePreset}
          onDeletePreset={deletePreset}
          onStart={handleStart}
        />
      ) : (
        <SessionView timer={timer} onStop={handleStop} />
      )}
      {timer.flash && (
        <div
          key={timer.flash.key}
          className={`flash flash-${timer.flash.kind}`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
