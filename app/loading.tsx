import styles from "./loading.module.css";

export default function Loading() {
  return (
    <main className={styles.page} aria-busy="true">
      <p className={styles.brand}>ZHONGISM / PORTFOLIO</p>
      <div className={styles.message} role="status" aria-live="polite">
        <span>OPENING PROJECT</span>
        <div className={styles.track} aria-hidden="true"><i /></div>
      </div>
    </main>
  );
}
