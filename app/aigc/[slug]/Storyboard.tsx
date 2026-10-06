"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { AigcProject } from "../projects";
import overviewStyles from "./project-overview.module.css";
import styles from "./storyboard.module.css";

type StoryboardProps = {
  projectSlug: string;
  content: NonNullable<AigcProject["storyboard"]>;
};

const fields = [
  { key: "action", label: "ACTION" },
  { key: "sound", label: "SOUND" },
  { key: "purpose", label: "PURPOSE" },
] as const;

export default function Storyboard({ projectSlug, content }: StoryboardProps) {
  const [viewportRef, carousel] = useEmblaCarousel({ align: "start", loop: false, duration: 32 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const reducedMotion = useRef(false);
  const titleId = `${projectSlug}-storyboard-title`;
  const viewportId = `${projectSlug}-storyboard-viewport`;
  const count = content.shots.length;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reducedMotion.current = preference.matches; };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!carousel) return;
    const update = () => setSelectedIndex(carousel.selectedScrollSnap());
    carousel.on("select", update);
    carousel.on("reInit", update);
    return () => {
      carousel.off("select", update);
      carousel.off("reInit", update);
    };
  }, [carousel]);

  const move = (direction: -1 | 1) => {
    if (direction === -1) carousel?.scrollPrev(reducedMotion.current);
    else carousel?.scrollNext(reducedMotion.current);
  };

  const handleKeys = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    move(event.key === "ArrowLeft" ? -1 : 1);
  };

  return (
    <section id="project-storyboard" className={styles.section} aria-labelledby={titleId} aria-roledescription="轮播故事板">
      <header className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <h2 id={titleId} className={overviewStyles.overviewHeading} lang="en">STORYBOARD</h2>
          <span lang="zh-CN">故事板</span>
        </div>
        <div className={styles.controls}>
          <p className={styles.counter} aria-live="polite" aria-atomic="true">
            <span className={styles.srOnly}>当前镜头 </span>
            {String(selectedIndex + 1).padStart(2, "0")}
            <span className={styles.divider}> / </span>
            {String(count).padStart(2, "0")}
          </p>
          <button type="button" aria-label="上一个故事板镜头" aria-controls={viewportId} disabled={selectedIndex === 0} onClick={() => move(-1)} onKeyDown={handleKeys}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg>
          </button>
          <button type="button" aria-label="下一个故事板镜头" aria-controls={viewportId} disabled={selectedIndex === count - 1} onClick={() => move(1)} onKeyDown={handleKeys}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </button>
        </div>
      </header>

      <div id={viewportId} className={styles.viewport} ref={viewportRef}>
        <ol className={styles.shots}>
          {content.shots.map((shot, index) => (
            <li className={styles.shot} key={shot.id} inert={selectedIndex !== index}>
              <article aria-labelledby={`${projectSlug}-shot-${shot.id}`}>
                <header className={styles.shotHeading}>
                  <h3 id={`${projectSlug}-shot-${shot.id}`} lang="en">
                    {`SHOT ${index + 1}`}
                  </h3>
                </header>

                <div className={styles.shotBody}>
                  <figure className={styles.figure}>
                    <a
                      className={styles.imageLink}
                      href={shot.image.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={selectedIndex === index ? 0 : -1}
                      aria-label={`查看 SHOT ${index + 1} 原图（新标签页）`}
                    >
                      <Image
                        src={shot.image.src}
                        alt={shot.image.alt}
                        width={shot.image.width}
                        height={shot.image.height}
                        unoptimized
                        loading={Math.abs(selectedIndex - index) <= 1 ? "eager" : "lazy"}
                        draggable={false}
                      />
                    </a>
                  </figure>

                  <div className={styles.details}>
                    <div className={styles.metadata} lang="en">
                      <p className={styles.timecode}>{shot.timeRange}</p>
                      <p className={styles.framing}>{shot.framing}</p>
                    </div>

                    <dl className={styles.description}>
                      {fields.map(({ key, label }) => (
                        <div key={key}>
                          <dt lang="en">{label}</dt>
                          <dd>
                            <p lang="en">{shot[key].en}</p>
                            <p lang="zh-CN">{shot[key].zh}</p>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>

      <nav aria-label="选择故事板镜头" className={styles.navigation}>
        {content.shots.map((shot, index) => (
          <button
            key={shot.id}
            type="button"
            aria-label={`切换至 SHOT ${index + 1}`}
            aria-current={selectedIndex === index ? "true" : undefined}
            aria-controls={viewportId}
            onClick={() => carousel?.scrollTo(index, reducedMotion.current)}
            onKeyDown={handleKeys}
          >
            {String(index + 1).padStart(2, "0")}
          </button>
        ))}
      </nav>
    </section>
  );
}
