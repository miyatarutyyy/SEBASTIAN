"use client";

import { useEffect, useMemo, useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import type { StewardState } from "../features/steward/steward";
import {
  getWakeTimerContent,
  OVERDUE_MESSAGE,
  type WakeTimerMode,
} from "../features/waking/wakingContent";
import { StatusHeader } from "./StatusHeader";
import styles from "./WakingContent.module.css";

type WakingContentProps = {
  state: StewardState;
  onComplete: () => void;
};

export function WakingContent({ state, onComplete }: WakingContentProps) {
  const [mode, setMode] = useState<WakeTimerMode>("remaining");
  const [now, setNow] = useState(() => Temporal.Now.instant());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Temporal.Now.instant());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const timerContent = useMemo(
    () => getWakeTimerContent(state, now),
    [now, state],
  );

  const isRemaining = mode === "remaining";
  const timerLabel = isRemaining
    ? "起床目標までの残り時間"
    : "目覚めてからの経過時間";
  const timerValue =
    timerContent === null
      ? "--:--"
      : isRemaining
        ? timerContent.remainingLabel
        : timerContent.elapsedLabel;

  return (
    <>
      <StatusHeader lifeState="waking" />
      <section className={styles.timer} aria-label="起床タイマー">
        <button
          className={styles.timerFace}
          type="button"
          onClick={() =>
            setMode((currentMode) =>
              currentMode === "remaining" ? "elapsed" : "remaining",
            )
          }
        >
          <span className={styles.timerLabel}>{timerLabel}</span>
          <span className={styles.timerValue}>{timerValue}</span>
        </button>
        <dl className={styles.meta}>
          <div className={styles.metaRow}>
            <dt>起床開始時刻</dt>
            <dd>{timerContent?.startedAtLabel ?? "--:--"}</dd>
          </div>
        </dl>
        {timerContent?.isOverdue ? (
          <p className={styles.overdue}>{OVERDUE_MESSAGE}</p>
        ) : null}
      </section>
      <div className={styles.actions} aria-label="次の行動">
        <p className={styles.actionLabel}>次の行動</p>
        <button
          className={styles.primaryButton}
          type="button"
          onClick={onComplete}
        >
          起床完了
        </button>
      </div>
    </>
  );
}
