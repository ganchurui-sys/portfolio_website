"use client";

import LoadingPercentage from "./components/LoadingPercentage";
import { useLoadingEstimate } from "./components/useLoadingEstimate";
import styles from "./loading.module.css";

export default function Loading() {
  const progress = useLoadingEstimate();

  return (
    <main className={styles.page} aria-busy="true">
      <p className={styles.brand}>ZHONGISM / PORTFOLIO</p>
      <div className={styles.message} role="status" aria-live="polite">
        <div className={styles.label}>
          <span>OPENING PROJECT</span>
          <LoadingPercentage value={progress} estimated />
        </div>
        <div className={styles.track} aria-hidden="true">
          <i style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </div>
    </main>
  );
}
