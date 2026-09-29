import { beforeEach, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  window.localStorage.clear();
});

function startWorkout() {
  fireEvent.change(screen.getByLabelText("Workout in seconds"), { target: { value: "60" } });
  fireEvent.change(screen.getByLabelText("Break in seconds"), { target: { value: "10" } });
  fireEvent.click(screen.getByRole("button", { name: "Start workout" }));
}

test("runs the full workout workflow from setup to stop", () => {
  render(<App />);

  const start = screen.getByRole("button", { name: "Start workout" });
  expect(start.hasAttribute("disabled")).toBe(true);

  startWorkout();
  expect(screen.getByText("Round 1 / 4")).toBeTruthy();
  expect(screen.getByText("Work")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Pause" }));
  expect(screen.getByRole("button", { name: "Resume" })).toBeTruthy();
  expect(screen.getByText("Paused")).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Resume" }));
  expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Skip" }));
  expect(screen.getByText("Break")).toBeTruthy();
  expect(screen.getByText("Round 1 / 4")).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Skip" }));
  expect(screen.getByText("Work")).toBeTruthy();
  expect(screen.getByText("Round 2 / 4")).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Stop" }));
  expect(screen.getByRole("button", { name: "Start workout" })).toBeTruthy();
});

test("finishes a single-round session and returns to setup", () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText("Workout in seconds"), { target: { value: "60" } });
  fireEvent.change(screen.getByLabelText("Number of rounds"), { target: { value: "1" } });
  fireEvent.click(screen.getByRole("button", { name: "Start workout" }));

  expect(screen.getByText("Round 1 / 1")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Skip" }));

  expect(screen.getByText("Session complete")).toBeTruthy();
  expect(screen.getByText("Done")).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Back to setup" }));
  expect(screen.getByRole("button", { name: "Start workout" })).toBeTruthy();
});

test("keeps a saved preset after saving on the setup screen", () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText("Workout in seconds"), { target: { value: "45" } });
  fireEvent.change(screen.getByLabelText("Preset name"), { target: { value: "Tabata" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));

  expect(screen.getByText("Tabata")).toBeTruthy();
  expect(JSON.parse(window.localStorage.getItem("sports-watch/presets/v1") ?? "[]")).toHaveLength(
    1,
  );
});
