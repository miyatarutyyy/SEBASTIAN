import { LifeState } from '@/lib/steward';
import styles from './StatusHeader.module.css';

const LABELS: Record<LifeState, { en: string; ja: string }> = {
  sleeping: { en: 'sleeping', ja: '就寝中' },
  waking: { en: 'waking', ja: '起床中' },
  awake: { en: 'awake', ja: '覚醒' },
};

export default function StatusHeader({ state }: { state: LifeState }) {
  const label = LABELS[state];
  return (
    <header className={styles.header} data-state={state}>
      <div className={styles.wordmark}>SEBASTIAN</div>
      <div className={styles.status}>
        <span className={styles.dot} aria-hidden />
        <span className={styles.en}>{label.en}</span>
        <span className={styles.ja}>{label.ja}</span>
      </div>
    </header>
  );
}