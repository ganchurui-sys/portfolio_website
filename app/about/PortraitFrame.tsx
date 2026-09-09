import type { ReactNode } from "react";
import styles from "./about.module.css";

type IconName = "camera" | "video" | "send" | "more" | "heart" | "comment" | "bookmark" | "home" | "search" | "add" | "user";

function FrameIcon({ name, filled = false }: { name: IconName; filled?: boolean }) {
  const paths: Record<IconName, ReactNode> = {
    camera: <><path d="M8 5 9.5 3h5L16 5h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" /><circle cx="12" cy="12.5" r="4" /></>,
    video: <><rect x="3" y="6" width="18" height="15" rx="5" /><path d="m8 2 4 4 4-4M8 14l3-2v5l5-3" /></>,
    send: <><path d="m22 3-8 19-4-8L2 9Z" /><path d="m10 14 12-11" /></>,
    more: <><circle cx="12" cy="5" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="19" r="1" fill="currentColor" /></>,
    heart: <path d="M20.7 4.8a5.5 5.5 0 0 0-7.8 0l-.9.9-.9-.9a5.5 5.5 0 0 0-7.8 7.8L12 22l8.7-9.4a5.5 5.5 0 0 0 0-7.8Z" />,
    comment: <path d="M21 11.5a9 9 0 1 0-5 8.1l5 1.4-1.4-5a8.8 8.8 0 0 0 1.4-4.5Z" />,
    bookmark: <path d="M5 3h14v19l-7-5-7 5Z" />,
    home: <path d="m3 10 9-8 9 8v12h-6v-8H9v8H3Z" />,
    search: <><circle cx="10.5" cy="10.5" r="7.5" /><path d="m16 16 6 6" /></>,
    add: <><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M12 7v10M7 12h10" /></>,
    user: <><circle cx="12" cy="7" r="4" /><path d="M3 22v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2" /></>,
  };

  return <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}

export default function PortraitFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.portraitCard}>
      <div className={styles.frameHeader} aria-hidden="true">
        <FrameIcon name="camera" />
        <span className={styles.frameWordmark}>Instagram</span>
        <span className={styles.frameVideoIcon}><FrameIcon name="video" /><i /></span>
        <FrameIcon name="send" />
      </div>
      <div className={styles.frameAccount} aria-hidden="true">
        <span className={styles.frameAvatar} />
        <FrameIcon name="more" />
      </div>

      <div className={styles.portraitMedia}>{children}</div>

      <div className={styles.frameActions} aria-hidden="true">
        <span className={styles.frameHeart}><FrameIcon name="heart" filled /></span>
        <FrameIcon name="comment" />
        <FrameIcon name="send" />
        <span className={styles.frameBookmark}><FrameIcon name="bookmark" /></span>
      </div>
      <div className={styles.frameNavigation} aria-hidden="true">
        <FrameIcon name="home" filled />
        <FrameIcon name="search" />
        <FrameIcon name="add" />
        <FrameIcon name="heart" />
        <FrameIcon name="user" />
      </div>
    </div>
  );
}
