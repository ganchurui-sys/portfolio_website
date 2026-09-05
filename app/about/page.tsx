import type { Metadata } from "next";
import Link from "next/link";

import AboutExperience from "./AboutExperience";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About — Zhongism",
  description: "About Zhong — urban designer and AIGC creator.",
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} href="/" aria-label="返回作品集主页">
          <span aria-hidden="true">←</span>
          BACK
        </Link>
        <span className={styles.wordmark}>ZHONG / ABOUT</span>
        <nav className={styles.indexNav} aria-label="作品集页面导航">
          <Link href="/?scene=0">INTRO</Link>
          <Link href="/?scene=1" aria-current="page">ABOUT</Link>
          <Link href="/?scene=2">UCL</Link>
          <Link href="/?scene=3">AIGC</Link>
          <Link href="/?scene=4">CONTACT</Link>
        </nav>
      </header>

      <AboutExperience />
    </main>
  );
}
