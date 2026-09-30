import { expect, test } from "bun:test";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { TimeInput } from "./TimeInput";

function Harness() {
  const [seconds, setSeconds] = useState(0);
  return <TimeInput label="Workout" seconds={seconds} onChange={setSeconds} />;
}

test("strips non digit characters from typed input", () => {
  render(<Harness />);
  const minutesInput = screen.getByLabelText("Workout in minutes") as HTMLInputElement;

  fireEvent.change(minutesInput, { target: { value: "1a2" } });
  expect(minutesInput.value).toBe("12");
});

test("clamps minutes to 59 when the field blurs", () => {
  render(<Harness />);
  const minutesInput = screen.getByLabelText("Workout in minutes") as HTMLInputElement;

  fireEvent.change(minutesInput, { target: { value: "99" } });
  fireEvent.blur(minutesInput);
  expect(minutesInput.value).toBe("59");
});

test("clamps hours to 99 when the field blurs", () => {
  render(<Harness />);
  const hoursInput = screen.getByLabelText("Workout in hours") as HTMLInputElement;

  fireEvent.change(hoursInput, { target: { value: "123" } });
  fireEvent.blur(hoursInput);
  expect(hoursInput.value).toBe("99");
});

test("empties the field on focus so typing starts fresh", () => {
  render(<Harness />);
  const minutesInput = screen.getByLabelText("Workout in minutes") as HTMLInputElement;

  fireEvent.change(minutesInput, { target: { value: "45" } });
  expect(minutesInput.value).toBe("45");

  fireEvent.focus(minutesInput);
  expect(minutesInput.value).toBe("");
});

test("restores the original value when a cleared field blurs untouched", () => {
  render(<Harness />);
  const hoursInput = screen.getByLabelText("Workout in hours") as HTMLInputElement;
  const minutesInput = screen.getByLabelText("Workout in minutes") as HTMLInputElement;

  fireEvent.change(hoursInput, { target: { value: "2" } });
  fireEvent.change(minutesInput, { target: { value: "30" } });
  expect(hoursInput.value).toBe("2");

  fireEvent.focus(hoursInput);
  expect(hoursInput.value).toBe("");

  fireEvent.blur(hoursInput);
  expect(hoursInput.value).toBe("2");
  expect(minutesInput.value).toBe("30");
});
