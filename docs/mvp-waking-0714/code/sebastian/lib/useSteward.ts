'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LifeState,
  TimerMode,
  WakeResult,
  WAKE_GOAL_MS,
} from './steward';

const STORAGE_KEY = 'sebastian_v1';

interface Persisted {
  lifeState: LifeState;
  elapsedMs: number;
  wakeStartedAt: number | null;
  speed: number;
  timerMode: TimerMode;
  result: WakeResult | null;
}

const DEFAULTS: Persisted = {
  lifeState: 'sleeping',
  elapsedMs: 0,
  wakeStartedAt: null,
  speed: 1,
  timerMode: 'remaining',
  result: null,
};

function load(): Persisted {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

export function useSteward() {
  const [s, setS] = useState<Persisted>(DEFAULTS);
  const lastTick = useRef<number>(Date.now());

  // マウント後にのみ localStorage から復元（SSR ハイドレーション対策）
  useEffect(() => { setS(load()); }, []);

  // 永続化
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
  }, [s]);

  // タイマー：waking のときだけ経過を積む（開発用倍速 speed）
  useEffect(() => {
    if (s.lifeState !== 'waking') return;
    lastTick.current = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const dt = now - lastTick.current;
      lastTick.current = now;
      setS(prev => ({ ...prev, elapsedMs: prev.elapsedMs + dt * prev.speed }));
    }, 200);
    return () => clearInterval(id);
  }, [s.lifeState, s.speed]);

  const wake = useCallback(() => {
    setS(prev => ({
      ...prev,
      lifeState: 'waking',
      elapsedMs: 0,
      wakeStartedAt: Date.now(),
      speed: 1,
      timerMode: 'remaining',
      result: null,
    }));
  }, []);

  const complete = useCallback(() => {
    setS(prev => {
      const startedAt = prev.wakeStartedAt ?? Date.now();
      const durationMs = prev.elapsedMs;
      return {
        ...prev,
        lifeState: 'awake',
        result: { startedAt, completedAt: startedAt + durationMs, durationMs },
      };
    });
  }, []);

  // 開発用：睡眠状態に戻す
  const resetToSleeping = useCallback(() => {
    setS(() => ({ ...DEFAULTS }));
  }, []);

  const toggleTimerMode = useCallback(() => {
    setS(prev => ({
      ...prev,
      timerMode: prev.timerMode === 'remaining' ? 'elapsed' : 'remaining',
    }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setS(prev => ({ ...prev, speed }));
  }, []);

  const remainingMs = Math.max(0, WAKE_GOAL_MS - s.elapsedMs);
  const isOverdue = s.elapsedMs >= WAKE_GOAL_MS;
  const progress = Math.min(1, s.elapsedMs / WAKE_GOAL_MS);

  return {
    ...s,
    remainingMs,
    isOverdue,
    progress,
    wake,
    complete,
    resetToSleeping,
    toggleTimerMode,
    setSpeed,
  };
}

export type Steward = ReturnType<typeof useSteward>;