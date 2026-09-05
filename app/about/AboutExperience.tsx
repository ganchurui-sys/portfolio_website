"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import styles from "./about.module.css";
import { createPortraitMotion, portraitClipSource, PORTRAIT_BACKWARD_SRC, PORTRAIT_FORWARD_SRC, PORTRAIT_POSTER_SRC } from "./portrait-motion";

const sections = [
  {
    title: "PROFILE",
    content: <>
      <p className={styles.lead}>HELLO, I&apos;M ZHONG.</p>
      <p>An urban designer working across spatial thinking, visual systems and AI-generated creative practice.</p>
    </>,
  },
  {
    title: "EDUCATION",
    content: <>
      <p className={styles.lead}>UCL</p>
      <dl className={styles.moduleList}>
        <div><dt>FIELD</dt><dd>URBAN DESIGN</dd></div>
        <div><dt>BASE</dt><dd>LONDON, UK</dd></div>
      </dl>
    </>,
  },
  {
    title: "PRACTICE",
    content: <ul className={styles.practiceList}>
      <li>SPATIAL THINKING</li>
      <li>GENERATIVE DESIGN</li>
      <li>VISUAL SYSTEMS</li>
      <li>CREATIVE TECHNOLOGY</li>
    </ul>,
  },
  {
    title: "DETAILS",
    content: <>
      <p>Exploring how emerging technology can make places, ideas and interactions more memorable and human.</p>
      <p className={styles.siteAddress}>ZHONGISM.DESIGN ↗</p>
    </>,
  },
];

export default function AboutExperience() {
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const forwardRef = useRef<HTMLVideoElement>(null);
  const backwardRef = useRef<HTMLVideoElement>(null);
  const motionRef = useRef<ReturnType<typeof createPortraitMotion> | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);

  useEffect(() => {
    const forward = forwardRef.current;
    const backward = backwardRef.current;
    if (!forward || !backward) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = createPortraitMotion({
      forward,
      backward,
      reducedMotion: () => reducedMotion.matches,
      onSelect: setActiveSection,
      onError: () => setMediaError("视频暂时无法加载"),
    });
    motionRef.current = motion;
    // Open on PROFILE's frame without replaying the entire clip on page entry.
    motion.select(0, false);

    return () => {
      motion.dispose();
      motionRef.current = null;
    };
  }, []);

  useEffect(() => {
    // Warm only the three possible next routes. No extra video decoders or DOM
    // elements are created; the browser can reuse the cached small files.
    const controller = new AbortController();
    for (let next = 0; next < sections.length; next++) {
      if (next === activeSection) continue;
      void fetch(portraitClipSource(activeSection, next), { cache: "force-cache", signal: controller.signal })
        .then(response => response.ok ? response.arrayBuffer() : undefined)
        .catch(() => {});
    }
    return () => controller.abort();
  }, [activeSection]);

  const selectSection = (index: number) => {
    setMediaError(null);
    if (motionRef.current) motionRef.current.select(index);
    else setActiveSection(index);
  };

  const navigateWithKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = Math.min(index + 1, sections.length - 1);
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = Math.max(index - 1, 0);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = sections.length - 1;
    else return;
    event.preventDefault();
    buttonsRef.current[next]?.focus();
    selectSection(next);
  };

  return (
    <section className={styles.stage} aria-label="自我介绍">
      <figure className={styles.portraitPanel} id="about-portrait" aria-label="随模块切换表情的 Zhong 卡通人物">
        <div className={styles.portraitMedia}>
          <Image
            className={styles.portraitImage}
            data-active="true"
            src={PORTRAIT_POSTER_SRC}
            alt=""
            aria-hidden="true"
            fill
            unoptimized
            sizes="(max-width: 700px) 100vw, 48vw"
            loading="eager"
            fetchPriority="high"
          />
          <video
            ref={forwardRef}
            className={styles.portraitVideo}
            src={PORTRAIT_FORWARD_SRC}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <video
            ref={backwardRef}
            className={styles.portraitVideo}
            src={PORTRAIT_BACKWARD_SRC}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
        </div>
        {mediaError && <figcaption role="status">{mediaError}</figcaption>}
      </figure>

      <div className={styles.moduleNav} role="tablist" aria-label="自我介绍模块" aria-orientation="vertical">
        {sections.map((section, index) => (
          <button
            key={section.title}
            ref={(button) => { buttonsRef.current[index] = button; }}
            id={`about-tab-${index}`}
            className={styles.moduleButton}
            type="button"
            role="tab"
            aria-selected={activeSection === index}
            aria-controls={`about-panel-${index}`}
            tabIndex={activeSection === index ? 0 : -1}
            onClick={() => selectSection(index)}
            onKeyDown={(event) => navigateWithKeys(event, index)}
          >
            <span className={styles.moduleNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")} /</span>
            <span className={styles.moduleTitle}>{section.title}</span>
          </button>
        ))}
      </div>

      <div className={styles.moduleContent}>
        {sections.map((section, index) => (
          <div
            key={section.title}
            id={`about-panel-${index}`}
            className={styles.contentPanel}
            role="tabpanel"
            aria-labelledby={`about-tab-${index}`}
            hidden={activeSection !== index}
            tabIndex={0}
          >
            <div className={styles.moduleBody}>{section.content}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
