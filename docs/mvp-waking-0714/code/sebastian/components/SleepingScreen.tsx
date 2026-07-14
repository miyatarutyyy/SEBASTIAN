import type { Steward } from '@/lib/useSteward';
import StatusHeader from './StatusHeader';
import styles from './screen.module.css';
import own from './SleepingScreen.module.css';

export default function SleepingScreen({ steward }: { steward: Steward }) {
  return (
    <div className={styles.screen + ' ' + own.root}>
      <StatusHeader state="sleeping" />
      <div className={styles.grow} />
      <div className={own.center}>
        <div className={own.title}>就寝中</div>
        <div className={own.steward}>STEWARD · 状態管理</div>
      </div>
      <div className={styles.grow} style={{ flex: 1.3 }} />
      <button className={styles.primary} onClick={steward.wake}>目覚めた</button>
      <p className={styles.note}>目覚めたら起床シーケンスを開始します。</p>
    </div>
  );
}