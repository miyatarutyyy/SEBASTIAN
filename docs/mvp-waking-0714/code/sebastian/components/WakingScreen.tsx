import { OVERDUE_MESSAGE } from '@/lib/steward';
import type { Steward } from '@/lib/useSteward';
import StatusHeader from './StatusHeader';
import WakeTimer from './WakeTimer';
import styles from './screen.module.css';
import own from './WakingScreen.module.css';

const SPEEDS = [1, 8, 60];

export default function WakingScreen({ steward }: { steward: Steward }) {
  return (
    <div className={styles.screen + ' ' + own.root}>
      <StatusHeader state="waking" />
      <WakeTimer steward={steward} />
      <div className={styles.grow} />
      {steward.isOverdue && (
        <div className={own.overdue}>
          <div className={own.overdueKicker}>目標時間 経過</div>
          <p className={own.overdueText}>{OVERDUE_MESSAGE}</p>
        </div>
      )}
      <button className={styles.primary} onClick={steward.complete}>起床完了</button>
      <div className={styles.dev}>
        <div className={styles.devRow}>
          <span className={styles.devTag}>DEV</span>
          <span className={styles.devLabel}>開発用 · 再生速度</span>
        </div>
        <div className={styles.seg}>
          {SPEEDS.map(n => (
            <button
              key={n}
              className={steward.speed === n ? styles.segOpt + ' ' + styles.segActive : styles.segOpt}
              onClick={() => steward.setSpeed(n)}
            >
              {'×' + n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}