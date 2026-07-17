import { Temporal } from "@js-temporal/polyfill";
import { afterEach, expect, test } from "vitest";

import {
  INITIAL_STEWARD_STATE,
  resetToSleeping,
  startWaking,
  STEWARD_STORAGE_KEY,
} from "./steward";
import {
  clearStewardState,
  loadStewardState,
  saveStewardState,
} from "./stewardStorage";

class MemoryStorage implements Storage {
  private items = new Map<string, string>();

  get length(): number {
    return this.items.size;
  }

  clear(): void {
    this.items.clear();
  }

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.items.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.items.delete(key);
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
}

function setWindowStorage(storage: Storage): void {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: storage,
    },
  });
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

test("loadStewardState returns initial state when window is unavailable", () => {
  expect(loadStewardState()).toEqual(INITIAL_STEWARD_STATE);
});

test("loadStewardState returns initial state when stored state is missing", () => {
  setWindowStorage(new MemoryStorage());

  expect(loadStewardState()).toEqual(INITIAL_STEWARD_STATE);
});

test("loadStewardState restores valid stored state", () => {
  const storage = new MemoryStorage();
  const now = Temporal.Instant.from("2026-07-17T00:00:00Z");
  const state = startWaking(resetToSleeping(), now);
  storage.setItem(STEWARD_STORAGE_KEY, JSON.stringify(state));
  setWindowStorage(storage);

  expect(loadStewardState()).toEqual(state);
});

test("loadStewardState resets invalid JSON to initial state", () => {
  const storage = new MemoryStorage();
  storage.setItem(STEWARD_STORAGE_KEY, "{invalid json");
  setWindowStorage(storage);

  expect(loadStewardState()).toEqual(INITIAL_STEWARD_STATE);
  expect(storage.getItem(STEWARD_STORAGE_KEY)).toBe(
    JSON.stringify(INITIAL_STEWARD_STATE),
  );
});

test("loadStewardState resets invalid steward state to initial state", () => {
  const storage = new MemoryStorage();
  storage.setItem(
    STEWARD_STORAGE_KEY,
    JSON.stringify({
      lifeState: "waking",
      wakeStartedAt: null,
      wakeCompletedAt: null,
    }),
  );
  setWindowStorage(storage);

  expect(loadStewardState()).toEqual(INITIAL_STEWARD_STATE);
  expect(storage.getItem(STEWARD_STORAGE_KEY)).toBe(
    JSON.stringify(INITIAL_STEWARD_STATE),
  );
});

test("saveStewardState stores state with steward storage key", () => {
  const storage = new MemoryStorage();
  const state = resetToSleeping();
  setWindowStorage(storage);

  saveStewardState(state);

  expect(storage.getItem(STEWARD_STORAGE_KEY)).toBe(JSON.stringify(state));
});

test("clearStewardState removes state with steward storage key", () => {
  const storage = new MemoryStorage();
  storage.setItem(STEWARD_STORAGE_KEY, JSON.stringify(resetToSleeping()));
  setWindowStorage(storage);

  clearStewardState();

  expect(storage.getItem(STEWARD_STORAGE_KEY)).toBeNull();
});
