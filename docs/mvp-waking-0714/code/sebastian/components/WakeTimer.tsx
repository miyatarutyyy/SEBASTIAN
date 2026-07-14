import { formatClock, formatMMSS } from '@/lib/steward';
import type { Steward } from '@/lib/useSteward';
import styles from './WakeTimer.module.css';

export default function WakeTimer({ steward }: { steward: Steward }) {
  const isRemaining = steward.timerMode === 'remaining';
  const value = isRemaining ? steward.remainingMs : steward.elapsedMs;
  return (
    <section className={styles.timer}>
      <button className={styles.face} onClick={steward.toggleTimerMode}>
        <div className={styles.kicker}>
          {isRemaining ? '残り時間 · Remaining' : '経過時間 · Elapsed'}
        </div>
        <div className={styles.value}>{formatMMSS(value)}</div>
      </button>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: steward.progress * 100 + '%' }} />
      </div>
      <div className={styles.startedAt}>
        起床開始 <span className={styles.clock}>
          {steward.wakeStartedAt ? formatClock(steward.wakeStartedAt) : '--:--'}
        </span>
      </div>
      <div className={styles.hint}>tap — 残り / 経過 切替</div>
    </section>
  );
}