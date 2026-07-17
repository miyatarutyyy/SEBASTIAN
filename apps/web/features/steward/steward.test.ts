import { Temporal } from "@js-temporal/polyfill";
import { expect, test } from "vitest";

import {
  completeWaking,
  getWakeDurationSeconds,
  resetToSleeping,
  startWaking,
  validateStewardState,
  type StewardState,
} from "./steward";

test("resetToSleeping returns sleeping state", () => {
  expect(resetToSleeping()).toEqual({
    lifeState: "sleeping",
    wakeStartedAt: null,
    wakeCompletedAt: null,
  });
});

test("startWaking changes lifeState from sleeping to waking", () => {
  const now = Temporal.Instant.from("2026-07-17T00:00:00Z");

  expect(startWaking(resetToSleeping(), now)).toEqual({
    lifeState: "waking",
    wakeStartedAt: now.toString(),
    wakeCompletedAt: null,
  });
});

test("startWaking does not change awake state", () => {
  const now = Temporal.Instant.from("2026-07-17T00:00:00Z");

  const state: StewardState = {
    lifeState: "awake",
    wakeStartedAt: null,
    wakeCompletedAt: null,
  };

  // 変化せずもとのオブジェクトと同じかを確認したいので
  // toEqual ではなく toBe を使う
  expect(startWaking(state, now)).toBe(state);
});

test("startWaking does not change waking state", () => {
  const now = Temporal.Instant.from("2026-07-17T00:00:00Z");

  const state: StewardState = {
    lifeState: "waking",
    wakeStartedAt: now.toString(),
    wakeCompletedAt: null,
  };

  expect(startWaking(state, now)).toBe(state);
});

test("completeWaking changes lifeState from waking to awake", () => {
  const startedAt = Temporal.Instant.from("2026-07-17T00:00:00Z");
  const completedAt = Temporal.Instant.from("2026-07-17T00:05:00Z");
  const state = startWaking(resetToSleeping(), startedAt);

  expect(completeWaking(state, completedAt)).toEqual({
    lifeState: "awake",
    wakeStartedAt: startedAt.toString(),
    wakeCompletedAt: completedAt.toString(),
  });
});

test("completeWaking does not change sleeping state", () => {
  const now = Temporal.Instant.from("2026-07-17T00:00:00Z");
  const state = resetToSleeping();

  expect(completeWaking(state, now)).toBe(state);
});

test("completeWaking does not change awake state", () => {
  const now = Temporal.Instant.from("2026-07-17T00:00:00Z");
  const state: StewardState = {
    lifeState: "awake",
    wakeStartedAt: null,
    wakeCompletedAt: null,
  };

  expect(completeWaking(state, now)).toBe(state);
});

test("completeWaking does not complete when completed time is before started time", () => {
  const startedAt = Temporal.Instant.from("2026-07-17T00:05:00Z");
  const completedAt = Temporal.Instant.from("2026-07-17T00:00:00Z");
  const state = startWaking(resetToSleeping(), startedAt);

  expect(completeWaking(state, completedAt)).toBe(state);
});

test("validateStewardState accepts valid sleeping state", () => {
  expect(validateStewardState(resetToSleeping())).toEqual({
    lifeState: "sleeping",
    wakeStartedAt: null,
    wakeCompletedAt: null,
  });
});

test("validateStewardState accepts valid waking state", () => {
  const now = Temporal.Instant.from("2026-07-17T00:00:00Z");
  const state = startWaking(resetToSleeping(), now);

  expect(validateStewardState(state)).toEqual(state);
});

test("validateStewardState accepts valid awake state with completed wake times", () => {
  const startedAt = Temporal.Instant.from("2026-07-17T00:00:00Z");
  const completedAt = Temporal.Instant.from("2026-07-17T00:05:00Z");
  const state = completeWaking(
    startWaking(resetToSleeping(), startedAt),
    completedAt,
  );

  expect(validateStewardState(state)).toEqual(state);
});

test("validateStewardState rejects invalid lifeState", () => {
  expect(
    validateStewardState({
      lifeState: "running",
      wakeStartedAt: null,
      wakeCompletedAt: null,
    }),
  ).toBeNull();
});

test("validateStewardState rejects waking state without wakeStartedAt", () => {
  expect(
    validateStewardState({
      lifeState: "waking",
      wakeStartedAt: null,
      wakeCompletedAt: null,
    }),
  ).toBeNull();
});

test("validateStewardState rejects awake state when wakeCompletedAt is before wakeStartedAt", () => {
  expect(
    validateStewardState({
      lifeState: "awake",
      wakeStartedAt: "2026-07-17T00:05:00Z",
      wakeCompletedAt: "2026-07-17T00:00:00Z",
    }),
  ).toBeNull();
});

test("getWakeDurationSeconds returns null when wake has not started", () => {
  const now = Temporal.Instant.from("2026-07-17T00:00:00Z");

  expect(getWakeDurationSeconds(resetToSleeping(), now)).toBeNull();
});

test("getWakeDurationSeconds returns elapsed seconds for waking state", () => {
  const startedAt = Temporal.Instant.from("2026-07-17T00:00:00Z");
  const now = Temporal.Instant.from("2026-07-17T00:02:30Z");
  const state = startWaking(resetToSleeping(), startedAt);

  expect(getWakeDurationSeconds(state, now)).toBe(150);
});

test("getWakeDurationSeconds returns completed wake duration for awake state", () => {
  const startedAt = Temporal.Instant.from("2026-07-17T00:00:00Z");
  const completedAt = Temporal.Instant.from("2026-07-17T00:05:00Z");
  const later = Temporal.Instant.from("2026-07-17T00:10:00Z");
  const state = completeWaking(
    startWaking(resetToSleeping(), startedAt),
    completedAt,
  );

  expect(getWakeDurationSeconds(state, later)).toBe(300);
});
