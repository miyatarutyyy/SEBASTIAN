import { Temporal } from "@js-temporal/polyfill";
import {
  getWakeDurationSeconds,
  type StewardState,
} from "../steward/steward";

export const WAKE_TARGET_SECONDS = 30 * 60;

export const OVERDUE_MESSAGE =
  "起床目標を過ぎています。もう起きたと判断できたら起床完了してください。";

export type WakeTimerMode = "remaining" | "elapsed";

export type WakeTimerContent = {
  startedAtLabel: string;
  elapsedSeconds: number;
  remainingSeconds: number;
  elapsedLabel: string;
  remainingLabel: string;
  isOverdue: boolean;
};

export type WakeResultContent = {
  startedAtLabel: string;
  completedAtLabel: string;
  durationSeconds: number;
  durationLabel: string;
};

function parseInstant(value: string | null): Temporal.Instant | null {
  if (value === null) {
    return null;
  }

  try {
    return Temporal.Instant.from(value);
  } catch {
    return null;
  }
}

export function formatDuration(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function formatLocalTime(instant: Temporal.Instant): string {
  const zonedDateTime = instant.toZonedDateTimeISO(
    Temporal.Now.timeZoneId(),
  );

  return `${String(zonedDateTime.hour).padStart(2, "0")}:${String(
    zonedDateTime.minute,
  ).padStart(2, "0")}`;
}

export function getWakeTimerContent(
  state: StewardState,
  now: Temporal.Instant,
): WakeTimerContent | null {
  const startedAt = parseInstant(state.wakeStartedAt);
  const elapsedSeconds = getWakeDurationSeconds(state, now);

  if (startedAt === null || elapsedSeconds === null) {
    return null;
  }

  const remainingSeconds = Math.max(0, WAKE_TARGET_SECONDS - elapsedSeconds);

  return {
    startedAtLabel: formatLocalTime(startedAt),
    elapsedSeconds,
    remainingSeconds,
    elapsedLabel: formatDuration(elapsedSeconds),
    remainingLabel: formatDuration(remainingSeconds),
    isOverdue: remainingSeconds === 0,
  };
}

export function getWakeResultContent(
  state: StewardState,
): WakeResultContent | null {
  const startedAt = parseInstant(state.wakeStartedAt);
  const completedAt = parseInstant(state.wakeCompletedAt);

  if (startedAt === null || completedAt === null) {
    return null;
  }

  const durationSeconds = getWakeDurationSeconds(state, completedAt);

  if (durationSeconds === null) {
    return null;
  }

  return {
    startedAtLabel: formatLocalTime(startedAt),
    completedAtLabel: formatLocalTime(completedAt),
    durationSeconds,
    durationLabel: formatDuration(durationSeconds),
  };
}
