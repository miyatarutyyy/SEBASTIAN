import { formatClock, formatMMSS } from '@/lib/steward';
import type { Steward } from '@/lib/useSteward';
import StatusHeader from './StatusHeader';
import styles from './screen.module.css';
import own from './AwakeScreen.module.css';

export default function AwakeScreen({ steward }: { steward: Steward }) {
  const r = steward.result;
  return (
    <div className={styles.screen + ' ' + own.root}>
      <StatusHeader state="awake" />
      <div className={own.greeting}>おはようございます</div>

      {r && (
        <div className={own.result}>
          <div className={own.resultKicker}>Result</div>
          <div className={own.resultTitle}>起床結果</div>
          <dl className={own.rows}>
            <div className={own.row}><dt>起床開始時刻</dt><dd>{formatClock(r.startedAt)}</dd></div>
            <div className={own.row}><dt>起床完了時刻</dt><dd>{formatClock(r.completedAt)}</dd></div>
            <div className={own.row}><dt>起床にかかった時間</dt><dd className={own.dur}>{formatMMSS(r.durationMs)}</dd></div>
          </dl>
        </div>
      )}

      <div className={own.next}>
        <div className={own.nextLabel}>次の行動</div>
        <div className={own.nextActions}>
          <button className={own.nextPrimary}>今日を始める</button>
          <button className={own.nextSecondary}>予定を確認</button>
        </div>
      </div>

      <div className={styles.grow} style={{ minHeight: 26 }} />

      <div className={own.dev}>
        <div className={own.devRow}>
          <span className={own.devTag}>DEV</span>
          <span className={own.devLabel}>開発用 · 状態を戻す</span>
        </div>
        <button className={own.devButton} onClick={steward.resetToSleeping}>睡眠状態にする</button>
      </div>
    </div>
  );
}