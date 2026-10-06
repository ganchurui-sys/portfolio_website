"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { AigcProject } from "../projects";
import introductionStyles from "./project-introduction.module.css";
import overviewStyles from "./project-overview.module.css";
import galleryStyles from "./pose-gallery.module.css";
import styles from "./character-consistency.module.css";

type CharacterConsistencyProps = {
  projectSlug: string;
  content: NonNullable<AigcProject["characterConsistency"]>;
};

const number = (value: number) => String(value).padStart(2, "0");

export default function CharacterConsistency({ projectSlug, content }: CharacterConsistencyProps) {
  const [viewportRef, carousel] = useEmblaCarousel({ loop: true, duration: 32 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const reducedMotion = useRef(false);
  const selectedImage = content.images[selectedIndex];
  const titleId = `${projectSlug}-character-consistency-title`;

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
    <section
      id="project-character-consistency"
      className={styles.gallery}
      aria-labelledby={titleId}
      aria-roledescription="轮播图"
    >
      <div className={`${introductionStyles.description} ${styles.copy}`}>
        <h2 id={titleId} className={overviewStyles.overviewHeading}>
          <span lang="en">CHARACTER CONSISTENCY</span>
          <span className={overviewStyles.headingTranslation} lang="zh-CN">人物一致性</span>
        </h2>
        <p lang="en">{content.description}</p>
        <p lang="zh-CN">{content.translation}</p>
      </div>

      <div className={styles.visual}>
        <div className={styles.viewport} ref={viewportRef}>
          <div className={styles.track}>
            {content.images.map((image, index) => (
              <div
                className={styles.slide}
                key={image.src}
                role="group"
                aria-roledescription="幻灯片"
                aria-label={`${index + 1} / ${content.images.length}：${image.titleZh}`}
                aria-hidden={selectedIndex !== index}
              >
                <a
                  className={styles.sheet}
                  href={image.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={selectedIndex === index ? 0 : -1}
                  aria-label={`查看${image.titleZh}大图（新标签页）`}
                  onKeyDown={handleKeys}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    sizes="(max-width: 900px) 75vw, 55vw"
                    loading="eager"
                    draggable={false}
                  />
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.caption}>
          <p aria-live="polite" aria-atomic="true">
            <span lang="en">{selectedImage.title}</span>
            <span lang="zh-CN">{selectedImage.titleZh}</span>
          </p>
          <a href={selectedImage.src} target="_blank" rel="noopener noreferrer" aria-label="查看当前人物大图（新标签页）">
            VIEW FULL SIZE <span aria-hidden="true">↗</span>
          </a>
        </div>

        <nav aria-label="选择人物一致性图片">
          <ol className={styles.previews}>
            {content.images.map((image, index) => (
              <li key={image.src}>
                <button
                  className={styles.preview}
                  type="button"
                  aria-label={`切换至${image.titleZh}`}
                  aria-current={selectedIndex === index ? "true" : undefined}
                  onClick={() => carousel?.scrollTo(index, reducedMotion.current)}
                  onKeyDown={handleKeys}
                >
                  <Image src={image.src} alt="" width={image.width} height={image.height} sizes="160px" loading="eager" draggable={false} />
                  <span>{number(index + 1)} / {image.titleZh}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <footer className={styles.footer}>
          <p className={galleryStyles.counter}>
            <span>{number(selectedIndex + 1)}</span>
            <span className={galleryStyles.divider}>/</span>
            <span>{number(content.images.length)}</span>
          </p>
          <div className={galleryStyles.controls}>
            <button type="button" aria-label="上一张人物一致性图片" onClick={() => move(-1)} onKeyDown={handleKeys}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg>
            </button>
            <button type="button" aria-label="下一张人物一致性图片" onClick={() => move(1)} onKeyDown={handleKeys}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}
