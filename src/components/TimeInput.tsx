import { useEffect, useRef, useState } from "react";
import { clampInt, partsFromSeconds, secondsFromParts } from "../lib/time";

interface TimeInputProps {
  label: string;
  seconds: number;
  onChange: (seconds: number) => void;
}

type Draft = [string, string, string];

function draftFromSeconds(seconds: number): Draft {
  const [hours, minutes, remainingSeconds] = partsFromSeconds(seconds);
  return [String(hours), String(minutes), String(remainingSeconds)];
}

function parsePart(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, "").slice(0, 3);
  return digits === "" ? 0 : Number(digits);
}

function draftToSeconds(draft: Draft): number {
  return secondsFromParts(
    clampInt(parsePart(draft[0]), 0, 99),
    clampInt(parsePart(draft[1]), 0, 59),
    clampInt(parsePart(draft[2]), 0, 59),
  );
}

export function TimeInput({ label, seconds, onChange }: TimeInputProps) {
  const [draft, setDraft] = useState<Draft>(() => draftFromSeconds(seconds));
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (draftToSeconds(draftRef.current) !== seconds) {
      setDraft(draftFromSeconds(seconds));
    }
  }, [seconds]);

  const update = (index: 0 | 1 | 2, raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "").slice(0, 3);
    const next: Draft = [...draft];
    next[index] = digits;
    setDraft(next);
    onChange(draftToSeconds(next));
  };

  const parts: Array<{ index: 0 | 1 | 2; unit: string }> = [
    { index: 0, unit: "h" },
    { index: 1, unit: "m" },
    { index: 2, unit: "s" },
  ];

  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="time-group">
        {parts.map(({ index, unit }, partIndex) => (
          <div className="time-part" key={unit}>
            <input
              className="time-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label={`${label} in ${unit === "h" ? "hours" : unit === "m" ? "minutes" : "seconds"}`}
              value={draft[index]}
              onChange={(event) => update(index, event.target.value)}
              onBlur={() => setDraft(draftFromSeconds(draftToSeconds(draftRef.current)))}
            />
            <span className="time-unit">{unit}</span>
            {partIndex < parts.length - 1 && (
              <span className="time-sep" aria-hidden="true">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
