import { Temporal } from "@js-temporal/polyfill";

// Steward が扱う生活状態を明示的な union にして、boolean 状態の増殖を避ける。
export type LifeState = "sleeping" | "waking" | "awake";

// localStorage に保存する最小単位。タイマー値は保存せず、Temporal.Instant 由来の時刻から復元する。
// ただしDBを実装したらこの記述とその関連はこれを削除する。
export type StewardState = {
  lifeState: LifeState;
  wakeStartedAt: string | null;
  wakeCompletedAt: string | null;
};

// 保存キーは Steward 境界の定数として一元化し、保存先を差し替える時の影響範囲を狭める。
export const STEWARD_STORAGE_KEY = "sebastian:steward:state";

// 初回表示では awake とし、ユーザーを不自然に睡眠中扱いしない。
export const INITIAL_STEWARD_STATE: StewardState = {
  lifeState: "awake",
  wakeStartedAt: null,
  wakeCompletedAt: null,
};

// runtime validation で LifeState を判定するため、型定義とは別に値集合を持つ。
// JS にコンパイルすると型定義が消えるので実体のある値リストを別に作成
// その文字列が許容されるかを調べるのだから Array ではなく Set を使用
const LIFE_STATES = new Set<LifeState>(["sleeping", "waking", "awake"]);

// localStorage 由来の unknown を安全に検査するため、まず plain object に絞る。
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// 保存データの lifeState が仕様内の値かを runtime で保証する。
function isLifeState(value: unknown): value is LifeState {
  return typeof value === "string" && LIFE_STATES.has(value as LifeState);
}

// Temporal.Instant として解釈できる ISO 8601 文字列だけを保存状態として受け入れる。
function parseInstant(value: string): Temporal.Instant | null {
  try {
    return Temporal.Instant.from(value);
  } catch {
    return null;
  }
}

// 未開始・未完了を null で表す設計なので、日時または null だけを許可する。
function isInstantStringOrNull(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && parseInstant(value) !== null);
}

// 完了時刻が開始時刻より前の保存データは壊れているものとして扱う。
function isChronological(startedAt: string, completedAt: string): boolean {
  const started = parseInstant(startedAt);
  const completed = parseInstant(completedAt);

  if (started === null || completed === null) {
    return false;
  }

  return Temporal.Instant.compare(completed, started) >= 0;
}

// 開発用操作として、どの状態からでも起床シーケンス前の sleeping に戻す。
export function resetToSleeping(): StewardState {
  return {
    lifeState: "sleeping",
    wakeStartedAt: null,
    wakeCompletedAt: null,
  };
}

// 起床シーケンス開始は sleeping からのみ許可し、時刻は Date ではなく Temporal.Instant で受け取る。
export function startWaking(
  state: StewardState,
  now: Temporal.Instant,
): StewardState {
  if (state.lifeState !== "sleeping") {
    return state;
  }

  return {
    lifeState: "waking",
    wakeStartedAt: now.toString(),
    wakeCompletedAt: null,
  };
}

// 起床完了は waking からのみ許可し、開始時刻を保持して結果計算に使える状態を残す。
export function completeWaking(
  state: StewardState,
  now: Temporal.Instant,
): StewardState {
  if (state.lifeState !== "waking" || state.wakeStartedAt === null) {
    return state;
  }

  const started = parseInstant(state.wakeStartedAt);

  if (started === null || Temporal.Instant.compare(now, started) <0) {
    // そのままにすれば良い
    return state;
  }
  
  return {
    lifeState: "awake",
    wakeStartedAt: state.wakeStartedAt,
    wakeCompletedAt: now.toString(),
  };
}

// 保存済みデータを StewardState として信用してよいか検証し、不正なら復元しない。
export function validateStewardState(value: unknown): StewardState | null {
  if (!isRecord(value)) {
    return null;
  }

  const { lifeState, wakeStartedAt, wakeCompletedAt } = value;

  if (
    !isLifeState(lifeState) ||
    !isInstantStringOrNull(wakeStartedAt) ||
    !isInstantStringOrNull(wakeCompletedAt)
  ) {
    return null;
  }

  // sleeping は起床前なので、起床開始・完了時刻を持たない状態だけを有効にする。
  if (lifeState === "sleeping") {
    return wakeStartedAt === null && wakeCompletedAt === null
      ? { lifeState, wakeStartedAt, wakeCompletedAt }
      : null;
  }

  // waking は実行中なので、開始時刻だけを持ち、完了時刻はまだ持たない。
  if (lifeState === "waking") {
    return wakeStartedAt !== null && wakeCompletedAt === null
      ? { lifeState, wakeStartedAt, wakeCompletedAt }
      : null;
  }

  // awake は通常状態として時刻なしでも成立する。
  if (wakeStartedAt === null && wakeCompletedAt === null) {
    return { lifeState, wakeStartedAt, wakeCompletedAt };
  }

  // 起床完了後の awake は、開始と完了の両方が時系列として正しい場合だけ復元する。
  if (
    wakeStartedAt !== null &&
    wakeCompletedAt !== null &&
    isChronological(wakeStartedAt, wakeCompletedAt)
  ) {
    return { lifeState, wakeStartedAt, wakeCompletedAt };
  }

  return null;
}

// 経過時間は保存せず、Temporal.Instant 同士の差分から都度計算する。
export function getWakeDurationSeconds(
  state: StewardState,
  now: Temporal.Instant,
): number | null {
  if (state.wakeStartedAt === null) {
    return null;
  }

  const started = parseInstant(state.wakeStartedAt);
  const completed =
    state.wakeCompletedAt === null ? now : parseInstant(state.wakeCompletedAt);

  if (started === null || completed === null) {
    return null;
  }

  if (Temporal.Instant.compare(completed, started) < 0) {
    return 0;
  }

  return Math.floor(started.until(completed).total({ unit: "seconds" }));
}
