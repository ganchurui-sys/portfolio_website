"use client";

import Image from "../../components/ProjectImage";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import galleryStyles from "./pose-gallery.module.css";
import styles from "./character-turnarounds.module.css";

type StudyImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type StudyLook = StudyImage & {
  title: string;
  description: string;
  thumbnail: string;
  reference?: StudyImage;
};

type CharacterStudyGalleryProps = {
  id: string;
  title: string;
  translation: string;
  descriptionEn: string;
  descriptionZh: string;
  detailLabel: string;
  looks: StudyLook[];
};

const number = (value: number) => String(value).padStart(2, "0");

function StudyMedia({ look, detail = false }: { look: StudyLook; detail?: boolean }) {
  const board = (
    <Image
      className={detail && !look.reference ? styles.detailImage : styles.lookImage}
      src={look.src}
      alt={look.alt}
      width={look.width}
      height={look.height}
      sizes={detail ? "100vw" : "(max-width: 900px) calc(100vw - 64px), (max-width: 1500px) 65vw, 1000px"}
      unoptimized={detail}
      draggable={false}
      loading={detail ? "eager" : "lazy"}
    />
  );

  if (!look.reference) return board;

  return (
    <span className={`${styles.comparison} ${detail ? `${styles.detailImage} ${styles.detailComparison}` : ""}`}>
      <span className={styles.reference}>
        <Image
          className={styles.referenceImage}
          src={look.reference.src}
          alt={look.reference.alt}
          width={look.reference.width}
          height={look.reference.height}
          unoptimized
          loading={detail ? "eager" : "lazy"}
          draggable={false}
        />
        <span className={styles.referenceCaption}>STYLE REFERENCE</span>
      </span>
      {board}
    </span>
  );
}

export default function CharacterStudyGallery({
  id, title, translation, descriptionEn, descriptionZh, detailLabel, looks,
}: CharacterStudyGalleryProps) {
  const [viewportRef, carousel] = useEmblaCarousel({ loop: true, duration: 32 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectedLook = looks[selectedIndex];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
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

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [expanded]);

  const openSheet = (index: number) => {
    carousel?.scrollTo(index, true);
    setSelectedIndex(index);
    setZoomed(false);
    setExpanded(true);
    dialogRef.current?.showModal();
  };

  const move = (direction: -1 | 1) => {
    setZoomed(false);
    if (direction === -1) carousel?.scrollPrev(reducedMotion);
    else carousel?.scrollNext(reducedMotion);
  };

  const handleKeys = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    move(event.key === "ArrowLeft" ? -1 : 1);
  };

  const controls = (
    <div className={galleryStyles.controls}>
      <button type="button" aria-label={`上一组${detailLabel}`} onClick={() => move(-1)}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg>
      </button>
      <button type="button" aria-label={`下一组${detailLabel}`} onClick={() => move(1)}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
      </button>
    </div>
  );

  return (
    <section
      id={id}
      className={styles.gallery}
      style={{ "--look-count": looks.length } as CSSProperties}
      aria-labelledby={`${id}-heading`}
      aria-roledescription="轮播图"
    >
      <div className={styles.copy}>
        <header className={styles.header}>
          <h2 id={`${id}-heading`}>
            <span lang="en">{title}</span>
            <span className={styles.titleTranslation} lang="zh-CN">{translation}</span>
          </h2>
        </header>
        <div className={styles.description}>
          <p lang="en">{descriptionEn}</p>
          <p lang="zh-CN">{descriptionZh}</p>
        </div>
      </div>

      <div className={styles.visual}>
        <div className={styles.viewport} ref={viewportRef}>
          <div className={styles.track}>
            {looks.map((look, index) => (
              <div
                className={styles.slide}
                key={look.src}
                role="group"
                aria-roledescription="幻灯片"
                aria-label={`${index + 1} / ${looks.length}`}
              >
                <button
                  type="button"
                  className={styles.sheet}
                  tabIndex={selectedIndex === index ? 0 : -1}
                  aria-label={`放大查看造型 ${number(index + 1)}：${look.description}${detailLabel}`}
                  onClick={() => openSheet(index)}
                  onKeyDown={handleKeys}
                >
                  <StudyMedia look={look} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.caption}>
          <p aria-live="polite" aria-atomic="true">LOOK {number(selectedIndex + 1)} / {selectedLook.title}</p>
          <button type="button" onClick={() => openSheet(selectedIndex)} aria-label={`放大查看当前${detailLabel}`}>
            VIEW FULL SIZE <span aria-hidden="true">↗</span>
          </button>
        </div>

        <nav className={styles.previews} aria-label={`选择${detailLabel}造型`}>
          <ol className={styles.previewList}>
            {looks.map((look, index) => (
              <li key={look.src}>
                <button
                  className={styles.preview}
                  type="button"
                  aria-label={`查看造型 ${number(index + 1)}：${look.description}${detailLabel}`}
                  aria-current={selectedIndex === index ? "true" : undefined}
                  onClick={() => carousel?.scrollTo(index, reducedMotion)}
                  onKeyDown={handleKeys}
                >
                  <Image src={look.thumbnail} alt="" width={480} height={270} unoptimized loading="lazy" draggable={false} />
                  <span>{number(index + 1)}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <footer className={styles.footer}>
          <p className={galleryStyles.counter}>
            <span>{number(selectedIndex + 1)}</span>
            <span className={galleryStyles.divider}>/</span>
            <span>{number(looks.length)}</span>
          </p>
          {controls}
        </footer>
      </div>

      <dialog
        className={styles.dialog}
        ref={dialogRef}
        aria-labelledby={`${id}-detail-title`}
        onKeyDown={handleKeys}
        onClose={() => { setExpanded(false); setZoomed(false); }}
      >
        <header className={styles.dialogHeader}>
          <p id={`${id}-detail-title`}>LOOK {number(selectedIndex + 1)} / {selectedLook.title}</p>
          <button type="button" className={styles.close} onClick={() => dialogRef.current?.close()} aria-label={`关闭${detailLabel}大图`}>CLOSE <span aria-hidden="true">×</span></button>
        </header>
        <div className={styles.detailViewport} data-zoomed={zoomed}>
          {expanded && <StudyMedia look={selectedLook} detail />}
        </div>
        <footer className={styles.dialogFooter}>
          <button type="button" className={styles.zoom} onClick={() => setZoomed(!zoomed)} aria-pressed={zoomed} aria-label={zoomed ? `完整显示${detailLabel}` : `放大${detailLabel}细节`}>
            {zoomed ? "FIT TO SCREEN −" : "ZOOM IN +"}
          </button>
          {controls}
        </footer>
      </dialog>
    </section>
  );
}
