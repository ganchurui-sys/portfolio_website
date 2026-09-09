"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import styles from "./pose-gallery.module.css";

const poses = Array.from({ length: 9 }, (_, index) => ({
  src: `/aigc/project-01/poses-alpha-v1/pose-${String(index + 1).padStart(2, "0")}.png`,
  alt: `Zhong 个人 IP 动作形象 ${index + 1}`,
  width: index === 5 || index === 7 ? 1248 : 1296,
  height: index === 5 || index === 7 ? 1872 : 1728,
}));

const formatNumber = (value: number) => String(value).padStart(2, "0");

export default function PoseGallery() {
  const [viewportRef, carousel] = useEmblaCarousel({
    align: "center",
    loop: true,
    duration: 38,
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!carousel) return;
    const cards = carousel.slideNodes().map((slide) =>
      slide.querySelector<HTMLElement>("[data-pose-card]"),
    );

    // Embla's MIT-licensed Scale example, with a gentler range so the two
    // neighbours on each side stay visible. See docs/embla-scale-license.md.
    const updateScale = () => {
      const engine = carousel.internalEngine();
      const progress = carousel.scrollProgress();
      const snaps = carousel.scrollSnapList();

      snaps.forEach((snap, snapIndex) => {
        engine.slideRegistry[snapIndex].forEach((slideIndex) => {
          let distance = snap - progress;
          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((point) => {
              if (point.index !== slideIndex || point.target() === 0) return;
              distance = point.target() < 0 ? snap - (1 + progress) : snap + (1 - progress);
            });
          }
          const stepsFromCenter = Math.abs(distance * snaps.length);
          // Emphasize the center without enlarging the resting side portraits.
          const centerBoost = 0.38 * Math.max(0, 1 - stepsFromCenter) ** 2;
          const scale = Math.max(0.64, 1.12 - stepsFromCenter * 0.24) + centerBoost;
          // Fade toward white, not gray, and recover full contrast at the center.
          const opacity = 1 - 0.2 * Math.min(stepsFromCenter, 1)
            - 0.12 * Math.min(Math.max(stepsFromCenter - 1, 0), 1);
          cards[slideIndex]?.style.setProperty("--pose-scale", scale.toFixed(4));
          cards[slideIndex]?.style.setProperty("--pose-opacity", opacity.toFixed(4));
          cards[slideIndex]?.style.setProperty("--pose-layer", String(Math.round(100 - stepsFromCenter * 10)));
        });
      });
    };
    const updateSelection = () => setSelectedIndex(carousel.selectedScrollSnap());
    const reinitialize = () => {
      updateScale();
      updateSelection();
    };
    reinitialize();
    carousel.on("scroll", updateScale);
    carousel.on("reInit", reinitialize);
    carousel.on("select", updateSelection);
    carousel.on("slideFocus", updateScale);

    // Horizontal trackpad gestures navigate; vertical gestures still scroll
    // naturally down the page instead of being trapped by the gallery.
    const viewport = carousel.rootNode();
    let wheelTotal = 0;
    let lastWheel = 0;
    let lastNavigation = 0;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      const now = performance.now();
      const delta = event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1);
      if (now - lastWheel > 160 || Math.sign(delta) !== Math.sign(wheelTotal)) wheelTotal = 0;
      lastWheel = now;
      wheelTotal += delta;
      if (Math.abs(wheelTotal) < 45 || now - lastNavigation < 420) return;
      if (wheelTotal > 0) carousel.scrollNext(reducedMotion);
      else carousel.scrollPrev(reducedMotion);
      lastNavigation = now;
      wheelTotal = 0;
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      carousel.off("scroll", updateScale);
      carousel.off("reInit", reinitialize);
      carousel.off("select", updateSelection);
      carousel.off("slideFocus", updateScale);
      viewport.removeEventListener("wheel", onWheel);
    };
  }, [carousel, reducedMotion]);

  return (
    <section
      id="pose-gallery"
      className={styles.gallery}
      aria-labelledby="pose-gallery-heading"
      aria-roledescription="轮播图"
    >
      <header className={styles.header}>
        <h2 id="pose-gallery-heading">POSE STUDIES</h2>
        <span>01—09</span>
      </header>

      <div className={styles.viewport} ref={viewportRef}>
        <div className={styles.track}>
          {poses.map((pose, index) => (
            <div className={styles.slide} key={pose.src}>
              <button
                type="button"
                data-pose-card
                data-initial-distance={Math.min(index, poses.length - index)}
                className={styles.card}
                aria-label={`查看第 ${index + 1} 张人物动作`}
                aria-current={selectedIndex === index ? "true" : undefined}
                onClick={() => carousel?.scrollTo(index, reducedMotion)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    event.preventDefault();
                    if (event.key === "ArrowLeft") carousel?.scrollPrev(reducedMotion);
                    else carousel?.scrollNext(reducedMotion);
                  }
                }}
              >
                <Image
                  className={styles.image}
                  src={pose.src}
                  alt={pose.alt}
                  width={pose.width}
                  height={pose.height}
                  unoptimized
                  loading="lazy"
                  draggable={false}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        <p className={styles.counter} aria-live="polite" aria-atomic="true">
          <span>{formatNumber(selectedIndex + 1)}</span>
          <span className={styles.divider}>/</span>
          <span>{formatNumber(poses.length)}</span>
        </p>
        <div className={styles.controls}>
          <button type="button" aria-label="上一张人物动作" onClick={() => carousel?.scrollPrev(reducedMotion)}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg>
          </button>
          <button type="button" aria-label="下一张人物动作" onClick={() => carousel?.scrollNext(reducedMotion)}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </button>
        </div>
      </footer>
    </section>
  );
}
