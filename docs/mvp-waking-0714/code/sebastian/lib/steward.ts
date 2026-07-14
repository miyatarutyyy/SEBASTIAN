export type LifeState = 'sleeping' | 'waking' | 'awake';

/** 起床目標時間 = 30 分 */
export const WAKE_GOAL_MS = 30 * 60 * 1000;

/** 残り時間 0 到達後に表示する誘導文 */
export const OVERDUE_MESSAGE =
  '起床目標を過ぎています。もう起きたと判断できたら起床完了してください。';

export type TimerMode = 'remaining' | 'elapsed';

export interface WakeResult {
  /** 起床開始時刻 (epoch ms) */
  startedAt: number;
  /** 起床完了時刻 (epoch ms) */
  completedAt: number;
  /** 起床にかかった時間 (ms) */
  durationMs: number;
}

/** ms を MM:SS に整形 */
export function formatMMSS(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return m + ':' + s;
}

/** epoch ms を HH:MM に整形 */
export function formatClock(ms: number): string {
  const d = new Date(ms);
  return (
    String(d.getHours()).padStart(2, '0') +
    ':' +
    String(d.getMinutes()).padStart(2, '0')
  );
}