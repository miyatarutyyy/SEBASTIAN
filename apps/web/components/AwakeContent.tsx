import type { StewardState } from "../features/steward/steward";
import { getWakeResultContent } from "../features/waking/wakingContent";
import { StatusHeader } from "./StatusHeader";
import styles from "./AwakeContent.module.css";

type AwakeContentProps = {
  state: StewardState;
  onSleep: () => void;
};

export function AwakeContent({ state, onSleep }: AwakeContentProps) {
  const result = getWakeResultContent(state);

  return (
    <>
      <StatusHeader lifeState="awake" />
      <section className={styles.greeting}>
        <p className={styles.title}>おはようございます</p>
      </section>
      {result === null ? null : (
        <section className={styles.result} aria-label="起床結果">
          <p className={styles.resultTitle}>起床結果</p>
          <dl className={styles.resultRows}>
            <div className={styles.resultRow}>
              <dt>起床開始時刻</dt>
              <dd>{result.startedAtLabel}</dd>
            </div>
            <div className={styles.resultRow}>
              <dt>起床完了時刻</dt>
              <dd>{result.completedAtLabel}</dd>
            </div>
            <div className={styles.resultRow}>
              <dt>起床にかかった時間</dt>
              <dd>{result.durationLabel}</dd>
            </div>
          </dl>
        </section>
      )}
      <div className={styles.actions} aria-label="次の行動">
        <p className={styles.actionLabel}>次の行動</p>
        <div className={styles.devBlock}>
          <span className={styles.devTag}>開発用</span>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={onSleep}
          >
            睡眠状態にする
          </button>
        </div>
      </div>
    </>
  );
}
