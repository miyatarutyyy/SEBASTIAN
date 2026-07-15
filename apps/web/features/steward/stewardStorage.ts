import {
  INITIAL_STEWARD_STATE,
  STEWARD_STORAGE_KEY,
  type StewardState,
  validateStewardState,
} from "./steward";

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function resetStoredState(storage: Storage): StewardState {
  try {
    storage.setItem(STEWARD_STORAGE_KEY, JSON.stringify(INITIAL_STEWARD_STATE));
  } catch {
    // Storage failures should not prevent the UI from falling back to a valid state.
  }

  return INITIAL_STEWARD_STATE;
}

export function loadStewardState(): StewardState {
  const storage = getLocalStorage();

  if (storage === null) {
    return INITIAL_STEWARD_STATE;
  }

  try {
    const rawState = storage.getItem(STEWARD_STORAGE_KEY);

    if (rawState === null) {
      return INITIAL_STEWARD_STATE;
    }

    const parsedState: unknown = JSON.parse(rawState);
    const validatedState = validateStewardState(parsedState);

    return validatedState ?? resetStoredState(storage);
  } catch {
    return resetStoredState(storage);
  }
}

export function saveStewardState(state: StewardState): void {
  const storage = getLocalStorage();

  if (storage === null) {
    return;
  }

  try {
    storage.setItem(STEWARD_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence is best-effort in the browser.
  }
}

export function clearStewardState(): void {
  const storage = getLocalStorage();

  if (storage === null) {
    return;
  }

  try {
    storage.removeItem(STEWARD_STORAGE_KEY);
  } catch {
    // Persistence is best-effort in the browser.
  }
}
