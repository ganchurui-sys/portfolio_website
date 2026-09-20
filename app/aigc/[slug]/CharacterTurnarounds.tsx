"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import galleryStyles from "./pose-gallery.module.css";
import styles from "./character-turnarounds.module.css";

const looks = [
  { title: "RACING JACKET", description: "金发、眼镜与紫色赛车夹克" },
  { title: "FOREST HOODIE", description: "黑发、深绿色卫衣与牛仔短裤" },
  { title: "LAYERED STREETWEAR", description: "黑发、眼镜、黑色外套与格纹衬衫" },
  { title: "CAP & HEADPHONES", description: "棕色棒球帽、银色耳机与黑白拼色夹克" },
  { title: "BROWN JACKET", description: "金发、眼镜与棕色夹克" },
  { title: "DENIM & TIE", description: "黑框眼镜、浅蓝牛仔夹克与条纹领带" },
  { title: "CHECKED SHIRT", description: "黑发与蓝色格纹衬衫" },
].map((look, index) => ({
  ...look,
  src: `/aigc/project-01/turnarounds-white-v1/turnaround-${String(index + 1).padStart(2, "0")}.webp`,
  alt: `${look.description}：人物展示及正面、侧面、背面三视图`,
}));

const number = (value: number) => String(value).padStart(2, "0");

export default function CharacterTurnarounds() {
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
      <button type="button" aria-label="上一组三视图" onClick={() => move(-1)}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg>
      </button>
      <button type="button" aria-label="下一组三视图" onClick={() => move(1)}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
      </button>
    </div>
  );

  return (
    <section
      id="character-turnarounds"
      className={styles.gallery}
      aria-labelledby="turnarounds-heading"
      aria-roledescription="轮播图"
    >
      <div className={styles.copy}>
        <header className={styles.header}>
          <h2 id="turnarounds-heading">
            <span lang="en">CHARACTER TURNAROUNDS</span>
            <span className={styles.titleTranslation} lang="zh-CN">角色转变</span>
          </h2>
        </header>

        <div className={styles.description}>
          <p lang="en">
            Each character is generated across multiple viewpoints to test visual consistency.
            Facial structure, hairstyle, proportions and styling are maintained from front to
            side and back.
          </p>
          <p lang="zh-CN">
            通过生成每个角色的多个视角，检验其视觉一致性。从正面到侧面及背面，始终保持面部结构、发型、身体比例与整体造型的一致。
          </p>
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
                  aria-label={`放大查看造型 ${number(index + 1)}：${look.description}三视图`}
                  onClick={() => openSheet(index)}
                  onKeyDown={handleKeys}
                >
                  <Image
                    src={look.src}
                    alt={look.alt}
                    width={3840}
                    height={2160}
                    sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 900px) calc(100vw - 104px), (max-width: 1500px) 65vw, 1000px"
                    draggable={false}
                    loading="lazy"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.caption}>
          <p aria-live="polite" aria-atomic="true">LOOK {number(selectedIndex + 1)} / {selectedLook.title}</p>
          <button type="button" onClick={() => openSheet(selectedIndex)} aria-label="放大查看当前三视图">
            VIEW FULL SIZE <span aria-hidden="true">↗</span>
          </button>
        </div>

        <nav className={styles.previews} aria-label="选择三视图造型">
          <ol className={styles.previewList}>
            {looks.map((look, index) => (
              <li key={look.src}>
                <button
                  className={styles.preview}
                  type="button"
                  aria-label={`查看造型 ${number(index + 1)}：${look.description}三视图`}
                  aria-current={selectedIndex === index ? "true" : undefined}
                  onClick={() => carousel?.scrollTo(index, reducedMotion)}
                  onKeyDown={handleKeys}
                >
                  <Image src={look.src.replace(".webp", "-thumb.webp")} alt="" width={480} height={270} unoptimized loading="eager" draggable={false} />
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
        aria-labelledby="turnaround-detail-title"
        onKeyDown={handleKeys}
        onClose={() => { setExpanded(false); setZoomed(false); }}
      >
        <header className={styles.dialogHeader}>
          <p id="turnaround-detail-title">LOOK {number(selectedIndex + 1)} / {selectedLook.title}</p>
          <button type="button" className={styles.close} onClick={() => dialogRef.current?.close()} aria-label="关闭三视图大图">CLOSE <span aria-hidden="true">×</span></button>
        </header>
        <div className={styles.detailViewport} data-zoomed={zoomed}>
          {expanded && (
            <Image
              className={styles.detailImage}
              src={selectedLook.src}
              alt={selectedLook.alt}
              width={3840}
              height={2160}
              unoptimized
              draggable={false}
            />
          )}
        </div>
        <footer className={styles.dialogFooter}>
          <button type="button" className={styles.zoom} onClick={() => setZoomed(!zoomed)} aria-pressed={zoomed} aria-label={zoomed ? "完整显示三视图" : "放大三视图细节"}>
            {zoomed ? "FIT TO SCREEN −" : "ZOOM IN +"}
          </button>
          {controls}
        </footer>
      </dialog>
    </section>
  );
}
