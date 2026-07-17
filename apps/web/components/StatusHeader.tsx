import type { LifeState } from "../features/steward/steward";
import styles from "./StatusHeader.module.css";

const MESSAGE_BY_STATE = {
  awake: "おはようございます",
  sleeping: "目覚めたら起床シーケンスを開始します。",
  waking: "二度寝しないと判断できたら完了してください。",
} as const satisfies Record<LifeState, string>;

type StatusHeaderProps = {
  lifeState: LifeState;
};

export function StatusHeader({ lifeState }: StatusHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        <p className={styles.appName}>SEBASTIAN</p>
        <p className={styles.stewardName}>Steward</p>
      </div>
      <div className={styles.statusBlock}>
        <p className={styles.statusLabel}>現在の生活状態</p>
        <p className={styles.statusValue}>{lifeState}</p>
      </div>
      <p className={styles.message}>{MESSAGE_BY_STATE[lifeState]}</p>
    </header>
  );
}
