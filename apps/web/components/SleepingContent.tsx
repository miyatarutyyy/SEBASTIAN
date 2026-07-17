import { StatusHeader } from "./StatusHeader";
import styles from "./SleepingContent.module.css";

type SleepingContentProps = {
  onWake: () => void;
};

export function SleepingContent({ onWake }: SleepingContentProps) {
  return (
    <>
      <StatusHeader lifeState="sleeping" />
      <div className={styles.body}>
        <p className={styles.title}>就寝中</p>
        <p className={styles.description}>
          目覚めたら起床シーケンスを開始します。
        </p>
      </div>
      <div className={styles.actions} aria-label="次の行動">
        <p className={styles.actionLabel}>次の行動</p>
        <button className={styles.primaryButton} type="button" onClick={onWake}>
          目覚めた
        </button>
      </div>
    </>
  );
}
