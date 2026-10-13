import styles from "./LoadingPercentage.module.css";

export default function LoadingPercentage({ value, estimated = false }: { value: number; estimated?: boolean }) {
  const percent = Number.isFinite(value) ? Math.max(0, Math.min(100, Math.floor(value))) : 0;

  return (
    <span
      className={styles.percentage}
      title={estimated ? "预计加载进度" : "加载进度"}
      aria-label={`${estimated ? "预计" : ""}加载进度 ${percent}%`}
    >
      {estimated && "≈ "}{percent}%
    </span>
  );
}
