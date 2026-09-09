"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import navigationStyles from "../../about/about.module.css";
import type { UrbanProject } from "../projects";
import { URBAN_RETURN_HREF } from "../projects";
import styles from "./book-portfolio.module.css";

type BookPortfolioProjectProps = {
  title: string;
  book: NonNullable<UrbanProject["book"]>;
};

type PageFlipInstance = {
  currentPage: number;
  totalPages: number;
  isAnimating: boolean;
  next: () => void;
  prev: () => void;
  destroy: () => void;
};

const padPageNumber = (value: number) => String(value).padStart(2, "0");

export default function BookPortfolioProject({ title, book }: BookPortfolioProjectProps) {
  const flipbookElement = useRef<HTMLDivElement | null>(null);
  const flipbook = useRef<PageFlipInstance | null>(null);
  const wheelDistance = useRef(0);
  const wheelResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelLockUntil = useRef(0);
  const [currentPage, setCurrentPage] = useState(book.startPage);
  const [totalPages, setTotalPages] = useState(book.pageCount);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    let instance: PageFlipInstance | null = null;

    const initialiseFlipbook = async () => {
      if (!flipbookElement.current) return;

      try {
        const { default: PageFlipOpen } = await import("pageflipopen");
        if (cancelled || !flipbookElement.current) return;

        PageFlipOpen.setPdfWorkerSrc("/vendor/pageflipopen/pdf.worker.mjs");
        instance = new PageFlipOpen(flipbookElement.current, {
          source: book.source,
          startPage: book.startPage,
          autoLayout: true,
          singlePageMode: false,
          autoHeight: false,
          flipDuration: 900,
          enableZoom: true,
          zoomMax: 3,
          enableKeyboard: true,
          enableTouch: true,
          enableFullscreen: true,
          enableDownload: false,
          toolbar: false,
          backgroundColor: "transparent",
          pageBackground: "#fff",
          onReady: () => {
            if (!instance || cancelled) return;
            flipbook.current = instance;
            setCurrentPage(instance.currentPage);
            setTotalPages(instance.totalPages);
            setStatus("ready");
          },
          onPageChange: (page: number) => {
            if (!cancelled) setCurrentPage(page);
          },
          onError: () => {
            if (!cancelled) setStatus("error");
          },
        });
        flipbook.current = instance;
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    initialiseFlipbook();

    return () => {
      cancelled = true;
      if (wheelResetTimer.current) clearTimeout(wheelResetTimer.current);
      instance?.destroy();
      flipbook.current = null;
    };
  }, [book.pageCount, book.source, book.startPage]);

  const turnPage = useCallback((direction: "next" | "previous") => {
    const instance = flipbook.current;
    if (!instance || instance.isAnimating) return;

    if (direction === "next") instance.next();
    else instance.prev();
  }, []);

  const handleWheel = (event: React.WheelEvent<HTMLElement>) => {
    if (event.ctrlKey || event.metaKey) return;
    event.preventDefault();

    const instance = flipbook.current;
    if (!instance || instance.isAnimating || performance.now() < wheelLockUntil.current) return;

    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
      ? event.deltaY
      : event.deltaX;

    wheelDistance.current += delta;
    if (wheelResetTimer.current) clearTimeout(wheelResetTimer.current);
    wheelResetTimer.current = setTimeout(() => {
      wheelDistance.current = 0;
    }, 160);

    if (Math.abs(wheelDistance.current) < 42) return;

    const direction = wheelDistance.current > 0 ? "next" : "previous";
    wheelDistance.current = 0;
    wheelLockUntil.current = performance.now() + 920;
    turnPage(direction);
  };

  const currentSpread = Math.max(
    1,
    book.pageMode === "split-spreads"
      ? Math.floor(currentPage / 2)
      : Math.ceil(currentPage / 2),
  );
  const totalSpreads = Math.max(
    1,
    book.pageMode === "split-spreads"
      ? Math.floor(totalPages / 2)
      : Math.ceil(totalPages / 2),
  );

  return (
    <main className={styles.shell}>
      <aside className={styles.introduction} aria-label="项目介绍">
        <div className={styles.sidebarHeader}>
          <Link className={navigationStyles.back} href={URBAN_RETURN_HREF}>
            <span aria-hidden="true">←</span>
            BACK
          </Link>
        </div>

        <div className={styles.introductionBody}>
          <p className={styles.eyebrow}>{book.eyebrow}</p>
          <h1>{title}</h1>
          <p className={styles.description}>{book.description}</p>

          <dl className={styles.projectFacts}>
            <div>
              <dt>TYPE</dt>
              <dd>{book.type}</dd>
            </div>
            <div>
              <dt>YEARS</dt>
              <dd>{book.years}</dd>
            </div>
            <div>
              <dt>WORKS</dt>
              <dd>{book.works}</dd>
            </div>
          </dl>
        </div>

        <p className={styles.sidebarHint}>SCROLL, DRAG OR USE ARROWS TO TURN PAGES</p>
      </aside>

      <section
        className={styles.reader}
        aria-label={`${title} 翻页阅读器`}
        onWheel={handleWheel}
      >
        <header className={`${navigationStyles.header} ${styles.readerHeader}`}>
          <span aria-hidden="true" />
          <span className={navigationStyles.wordmark}>ZHONG / URBAN</span>
          <nav className={navigationStyles.indexNav} aria-label="作品集页面导航">
            <Link href="/?scene=0">INTRO</Link>
            <Link href="/?scene=1">ABOUT</Link>
            <Link href={URBAN_RETURN_HREF} aria-current="page">URBAN</Link>
            <Link href="/?scene=3">AIGC</Link>
            <Link href="/?scene=4">CONTACT</Link>
          </nav>
        </header>

        <div className={`${styles.readerBody} ${book.pageMode === "single-pages" ? styles.singlePageReaderBody : ""}`}>
          <div className={`${styles.flipbookStage} ${book.pageMode === "single-pages" ? styles.singlePageBook : ""}`}>
            <div ref={flipbookElement} className={styles.flipbookHost} />
            {status !== "ready" && (
              <div className={styles.readerStatus} role="status">
                <span aria-hidden="true" />
                <p>{status === "loading" ? "LOADING PORTFOLIO" : "PORTFOLIO COULD NOT BE LOADED"}</p>
              </div>
            )}
          </div>

          <div className={styles.controls}>
            <button
              type="button"
              onClick={() => turnPage("previous")}
              disabled={status !== "ready" || currentPage <= book.startPage}
              aria-label="上一跨页"
            >
              ←
            </button>
            <div className={styles.progress} aria-live="polite">
              <span>{padPageNumber(currentSpread)}</span>
              <i aria-hidden="true">
                <b style={{ width: `${(currentSpread / totalSpreads) * 100}%` }} />
              </i>
              <span>{padPageNumber(totalSpreads)}</span>
            </div>
            <button
              type="button"
              onClick={() => turnPage("next")}
              disabled={status !== "ready" || currentPage >= totalPages - 1}
              aria-label="下一跨页"
            >
              →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
