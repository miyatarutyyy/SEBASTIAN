"use client";

import { useSteward } from "../features/steward/useSteward";

const NEXT_ACTION_LABEL = {
  awake: "睡眠状態にする",
  sleeping: "目覚めた",
  waking: "起床完了",
} as const;

const STATE_LABEL = {
  awake: "awake",
  sleeping: "sleeping",
  waking: "waking",
} as const;

export default function Home() {
  const steward = useSteward();

  const handleNext = () => {
    if (steward.lifeState === "awake") {
      steward.resetToSleeping();
      return;
    }

    if (steward.lifeState === "sleeping") {
      steward.startWaking();
      return;
    }

    steward.completeWaking();
  };

  return (
    <main style={styles.main}>
      <section style={styles.panel} aria-label="Steward temporary check">
        <p style={styles.caption}>Steward temporary check</p>
        <h1 style={styles.title}>{STATE_LABEL[steward.lifeState]}</h1>
        <dl style={styles.details}>
          <div style={styles.detailRow}>
            <dt style={styles.detailTerm}>loaded</dt>
            <dd style={styles.detailValue}>{steward.isLoaded ? "yes" : "no"}</dd>
          </div>
          <div style={styles.detailRow}>
            <dt style={styles.detailTerm}>wakeStartedAt</dt>
            <dd style={styles.detailValue}>{steward.wakeStartedAt ?? "-"}</dd>
          </div>
          <div style={styles.detailRow}>
            <dt style={styles.detailTerm}>wakeCompletedAt</dt>
            <dd style={styles.detailValue}>{steward.wakeCompletedAt ?? "-"}</dd>
          </div>
        </dl>
        <button type="button" style={styles.button} onClick={handleNext}>
          {NEXT_ACTION_LABEL[steward.lifeState]}
        </button>
        <p style={styles.note}>
          仮の確認画面です。正式な状態別 UI 実装時に置き換えます。
        </p>
      </section>
    </main>
  );
}

const styles = {
  main: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "24px",
    background: "#f6f7f9",
  },
  panel: {
    width: "min(100%, 520px)",
    display: "grid",
    gap: "20px",
    padding: "28px",
    border: "1px solid #d9dde3",
    borderRadius: "8px",
    background: "#ffffff",
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
  },
  caption: {
    color: "#596273",
    fontSize: "13px",
    lineHeight: 1.4,
  },
  title: {
    color: "#111827",
    fontSize: "44px",
    lineHeight: 1,
    letterSpacing: 0,
  },
  details: {
    display: "grid",
    gap: "10px",
  },
  detailRow: {
    display: "grid",
    gridTemplateColumns: "128px minmax(0, 1fr)",
    gap: "12px",
    alignItems: "baseline",
  },
  detailTerm: {
    color: "#596273",
    fontSize: "13px",
    lineHeight: 1.4,
  },
  detailValue: {
    minWidth: 0,
    overflowWrap: "anywhere",
    color: "#111827",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "13px",
    lineHeight: 1.4,
  },
  button: {
    minHeight: "44px",
    border: 0,
    borderRadius: "8px",
    padding: "0 18px",
    color: "#ffffff",
    background: "#2563eb",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  note: {
    color: "#596273",
    fontSize: "13px",
    lineHeight: 1.5,
  },
} satisfies Record<string, React.CSSProperties>;
