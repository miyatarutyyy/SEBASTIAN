import { Temporal } from "@js-temporal/polyfill";
import { expect, test } from "vitest";

import type { StewardState } from "../steward/steward";
import {
  formatDuration,
  getWakeResultContent,
  getWakeTimerContent,
} from "./wakingContent";

function createWakingState(wakeStartedAt: string | null): StewardState {
  return {
    lifeState: "waking",
    wakeStartedAt,
    wakeCompletedAt: null,
  };
}

function createAwakeState(
  wakeStartedAt: string | null,
  wakeCompletedAt: string | null,
): StewardState {
  return {
    lifeState: "awake",
    wakeStartedAt,
    wakeCompletedAt,
  };
}

test("formatDuration formats zero seconds", () => {
  expect(formatDuration(0)).toBe("00:00");
});

test("formatDuration formats minutes and seconds", () => {
  expect(formatDuration(90)).toBe("01:30");
});

test("formatDuration floors fractional seconds", () => {
  expect(formatDuration(90.9)).toBe("01:30");
});

test("formatDuration clamps negative seconds to zero", () => {
  expect(formatDuration(-1)).toBe("00:00");
});

test("getWakeTimerContent returns elapsed and remaining time before target", () => {
  const startedAt = Temporal.Instant.from("2026-07-17T00:00:00Z");
  const now = Temporal.Instant.from("2026-07-17T00:05:00Z");
  const content = getWakeTimerContent(createWakingState(startedAt.toString()), now);

  expect(content).toMatchObject({
    elapsedSeconds: 5 * 60,
    remainingSeconds: 25 * 60,
    elapsedLabel: "05:00",
    remainingLabel: "25:00",
    isOverdue: false,
  });
});

test("getWakeTimerContent marks timer overdue at target time", () => {
  const startedAt = Temporal.Instant.from("2026-07-17T00:00:00Z");
  const now = Temporal.Instant.from("2026-07-17T00:30:00Z");
  const content = getWakeTimerContent(createWakingState(startedAt.toString()), now);

  expect(content).toMatchObject({
    elapsedSeconds: 30 * 60,
    remainingSeconds: 0,
    elapsedLabel: "30:00",
    remainingLabel: "00:00",
    isOverdue: true,
  });
});

test("getWakeTimerContent keeps remaining time at zero after target time", () => {
  const startedAt = Temporal.Instant.from("2026-07-17T00:00:00Z");
  const now = Temporal.Instant.from("2026-07-17T00:31:00Z");
  const content = getWakeTimerContent(createWakingState(startedAt.toString()), now);

  expect(content).toMatchObject({
    elapsedSeconds: 31 * 60,
    remainingSeconds: 0,
    elapsedLabel: "31:00",
    remainingLabel: "00:00",
    isOverdue: true,
  });
});

test("getWakeTimerContent returns null when wake has not started", () => {
  const now = Temporal.Instant.from("2026-07-17T00:00:00Z");

  expect(getWakeTimerContent(createWakingState(null), now)).toBeNull();
});

test("getWakeResultContent returns completed wake duration", () => {
  const startedAt = Temporal.Instant.from("2026-07-17T00:00:00Z");
  const completedAt = Temporal.Instant.from("2026-07-17T00:05:00Z");
  const content = getWakeResultContent(
    createAwakeState(startedAt.toString(), completedAt.toString()),
  );

  expect(content).toMatchObject({
    durationSeconds: 5 * 60,
    durationLabel: "05:00",
  });
});

test("getWakeResultContent returns null when wake has not completed", () => {
  const startedAt = Temporal.Instant.from("2026-07-17T00:00:00Z");

  expect(getWakeResultContent(createAwakeState(startedAt.toString(), null))).toBeNull();
});
