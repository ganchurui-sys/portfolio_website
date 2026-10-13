"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useRef, useState, type ReactNode } from "react";
import NavigationLink from "./NavigationLink";
import styles from "./PortfolioLanyard.module.css";
import projectLinkStyles from "./UrbanProjectLinks.module.css";

const loadLanyard = () => import("./PortfolioLanyard");
const Lanyard = dynamic(loadLanyard, { ssr: false });

// Start the module and its small model/texture requests as the cover leaves.
// This does not gate entry or navigation.
export function preloadPortfolioBadge() {
  return loadLanyard();
}

class LanyardBoundary extends Component<{ children: ReactNode; onUnavailable?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onUnavailable?.(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function PortfolioBadge({ onPrepared }: { onPrepared?: () => void }) {
  const [ready, setReady] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const profileLinkRef = useRef<HTMLAnchorElement>(null);
  const handleReady = useCallback(() => { setReady(true); onPrepared?.(); }, [onPrepared]);
  const handleOpen = useCallback(() => profileLinkRef.current?.click(), []);

  return (
    <div
      className={styles.wrapper}
      data-portfolio-lanyard
      data-badge-ready={ready}
      aria-label="Zhong — Spatial Designer & Creative Technologist。可拖拽的 3D 挂绳工牌，点击进入自我介绍页面"
    >
      {!ready && (
        <NavigationLink className={styles.fallback} href="/about" aria-label="点击工牌进入 About Me">
          <span className={styles.fallbackStrap} aria-hidden="true" />
          <span className={styles.fallbackCard} aria-hidden="true">
            <span>Spatial Designer &amp; Creative Technologist</span>
          </span>
        </NavigationLink>
      )}
      <div className={styles.scene} data-ready={ready}>
        <LanyardBoundary onUnavailable={onPrepared}>
          <Lanyard onReady={handleReady} onOpen={handleOpen} keyboardFocused={keyboardFocused} />
        </LanyardBoundary>
      </div>
      <div className={styles.entryHint}>
        <NavigationLink
          ref={profileLinkRef}
          className={`${projectLinkStyles.link} ${styles.profileLink}`}
          href="/about"
          aria-label="进入 About Me，了解 Zhong"
          onFocus={(event) => setKeyboardFocused(event.currentTarget.matches(":focus-visible"))}
          onBlur={() => setKeyboardFocused(false)}
        >
          <span className={projectLinkStyles.title} lang="en">EXPLORE ABOUT ME</span>
          <span className={projectLinkStyles.arrow} aria-hidden="true">↗</span>
        </NavigationLink>
      </div>
    </div>
  );
}
