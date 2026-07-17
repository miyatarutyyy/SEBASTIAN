import type { ReactNode } from "react";
import styles from "./ScreenShell.module.css";

type ScreenShellProps = {
  children: ReactNode;
};

export function ScreenShell({ children }: ScreenShellProps) {
  return (
    <main className={styles.main}>
      <section className={styles.panel}>{children}</section>
    </main>
  );
}
