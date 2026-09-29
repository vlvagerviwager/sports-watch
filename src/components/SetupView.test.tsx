import { expect, test } from "bun:test";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { SetupView } from "./SetupView";
import type { Preset, TimerConfig } from "../types";

interface HarnessProps {
  initialPresets?: Preset[];
}

function Harness({ initialPresets = [] }: HarnessProps) {
  const [config, setConfig] = useState<TimerConfig>({
    workoutSeconds: 0,
    breakSeconds: 0,
    rounds: 4,
  });
  const [presets, setPresets] = useState<Preset[]>(initialPresets);

  return (
    <SetupView
      config={config}
      onConfigChange={setConfig}
      presets={presets}
      onSavePreset={(name, cfg) => {
        setPresets((list) => [
          { id: `p${list.length + 1}`, name, config: { ...cfg }, createdAt: 0 },
          ...list,
        ]);
      }}
      onDeletePreset={(id) => setPresets((list) => list.filter((p) => p.id !== id))}
      onStart={() => {}}
    />
  );
}

const savedPreset: Preset = {
  id: "p1",
  name: "Leg day",
  config: { workoutSeconds: 60, breakSeconds: 30, rounds: 5 },
  createdAt: 0,
};

test("shows zeroed timers, four rounds, and the repo link by default", () => {
  render(<Harness />);
  expect(screen.getByLabelText("Workout in hours").getAttribute("value")).toBe("0");
  expect(screen.getByLabelText("Workout in minutes").getAttribute("value")).toBe("0");
  expect(screen.getByLabelText("Workout in seconds").getAttribute("value")).toBe("0");
  expect(screen.getByLabelText("Number of rounds").getAttribute("value")).toBe("4");
  expect(screen.getByText(/Total session:/, { selector: "p.total-line" })).toBeTruthy();
  expect(screen.getByText("0 s", { selector: "strong" })).toBeTruthy();

  const link = screen.getByRole("link", { name: "GitHub" });
  expect(link.getAttribute("href")).toBe("https://github.com/vlvagerviwager/sports-watch");
});

test("rounds stepper increments and decrements", () => {
  render(<Harness />);
  const rounds = screen.getByLabelText("Number of rounds");

  fireEvent.click(screen.getByRole("button", { name: "Increase rounds" }));
  expect(rounds.getAttribute("value")).toBe("5");

  fireEvent.click(screen.getByRole("button", { name: "Decrease rounds" }));
  expect(rounds.getAttribute("value")).toBe("4");
});

test("start stays disabled until the workout has a duration", () => {
  render(<Harness />);
  const start = screen.getByRole("button", { name: "Start workout" });
  expect(start.hasAttribute("disabled")).toBe(true);

  fireEvent.change(screen.getByLabelText("Workout in seconds"), { target: { value: "30" } });
  expect(start.hasAttribute("disabled")).toBe(false);
});

test("saves the current setup as a named preset", () => {
  render(<Harness />);
  fireEvent.change(screen.getByLabelText("Workout in seconds"), { target: { value: "45" } });
  fireEvent.change(screen.getByLabelText("Preset name"), { target: { value: "Leg day" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));

  expect(screen.getByText("Leg day")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
});

test("collapses and expands the preset panel", () => {
  render(<Harness />);
  const toggle = screen.getByRole("button", { name: "Presets" });
  expect(toggle.getAttribute("aria-expanded")).toBe("true");

  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByRole("textbox", { name: "Preset name" })).toBeNull();

  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("textbox", { name: "Preset name" })).toBeTruthy();
});

test("loads a preset, highlights it, and deselects on edit", () => {
  render(<Harness initialPresets={[savedPreset]} />);
  const toggle = screen.getByRole("button", { name: "Presets" });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");

  fireEvent.click(toggle);
  const loadButton = screen.getByRole("button", { name: /^Leg day/ });
  fireEvent.click(loadButton);

  expect(loadButton.getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByLabelText("Workout in minutes").getAttribute("value")).toBe("1");
  expect(screen.getByLabelText("Break in seconds").getAttribute("value")).toBe("30");
  expect(screen.getByLabelText("Number of rounds").getAttribute("value")).toBe("5");

  fireEvent.change(screen.getByLabelText("Workout in seconds"), { target: { value: "10" } });
  expect(loadButton.getAttribute("aria-pressed")).toBe("false");
});

test("deletes a preset from the list", () => {
  render(<Harness initialPresets={[savedPreset]} />);
  fireEvent.click(screen.getByRole("button", { name: "Presets" }));

  fireEvent.click(screen.getByRole("button", { name: "Delete preset Leg day" }));
  expect(screen.queryByText("Leg day")).toBeNull();
});
