"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import styles from "./about.module.css";
import InternshipExperience from "./InternshipExperience";
import ProjectExperience from "./ProjectExperience";
import PortraitFrame from "./PortraitFrame";
import { createPortraitMotion, portraitClipSource, PORTRAIT_BACKWARD_SRC, PORTRAIT_FORWARD_SRC, PORTRAIT_POSTER_SRC } from "./portrait-motion";

const sections = [
  {
    title: "PROFILE",
    content: <div className={styles.profileCopy} lang="zh-CN">
      <h2 className={styles.profileTitle}>你好，我是干楚锐。</h2>
      <p>一名游走于视觉、建筑与城市之间的跨学科设计师，拥有美术、建筑设计与城市设计背景，同时持续探索 AIGC 与数字技术在设计中的应用。</p>
      <p>我的实践从平面视觉延伸到建筑空间与城市尺度，通过视觉设计、三维建模、计算设计与生成式工具，探索不同媒介之间的连接，并将复杂的空间与概念转化为清晰而具有辨识度的设计语言。</p>
    </div>,
  },
  {
    title: "EDUCATION",
    content: <div className={styles.educationCopy} lang="zh-CN">
      <section className={styles.educationEntry}>
        <h2 className={styles.educationSchool}>伦敦大学学院 UCL</h2>
        <p className={styles.educationDegree}><strong lang="en">Urban Design MArch</strong></p>
        <p className={styles.educationDates}>2025 — 2026</p>
      </section>
      <section className={styles.educationEntry}>
        <h2 className={styles.educationSchool}>西安美术学院</h2>
        <p className={styles.educationDegree}><strong>建筑环境艺术系 · 本科</strong></p>
        <p className={styles.educationDates}>2018 — 2022</p>
      </section>
    </div>,
  },
  {
    title: "INTERNSHIP EXPERIENCE",
    content: <InternshipExperience />,
  },
  {
    title: "PROJECT EXPERIENCE",
    content: <ProjectExperience />,
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
    <section className={styles.stage} data-section={activeSection} aria-label="自我介绍">
      <figure className={styles.portraitPanel} id="about-portrait" aria-label="随模块切换表情的 Zhong 卡通人物">
        <PortraitFrame>
          <Image
            className={styles.portraitImage}
            data-active="true"
            src={PORTRAIT_POSTER_SRC}
            alt=""
            aria-hidden="true"
            fill
            unoptimized
            sizes="(max-width: 700px) 90vw, 28vw"
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
        </PortraitFrame>
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
            className={`${styles.contentPanel} ${index >= 2 ? styles.experiencePanel : ""}`}
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
