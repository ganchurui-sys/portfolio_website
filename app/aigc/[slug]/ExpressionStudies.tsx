"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./expression-studies.module.css";

const expressions = [
  { title: "FOCUSED", translation: "低头直视" },
  { title: "LOOK UP", translation: "抬头" },
  { title: "WINK", translation: "眨眼" },
  { title: "SIDE GLANCE", translation: "侧看" },
];

const PHASE_SECONDS = 2.5;
const TRANSITION_SECONDS = 1;

export default function ExpressionStudies() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackPreference = useRef<boolean | null>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;

    const syncPlayback = () => {
      const requested = playbackPreference.current ?? !reducedMotion.matches;
      if (visible && !document.hidden && requested) {
        void video.play().catch(() => {
          // The play button remains available when a browser blocks autoplay.
        });
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
      syncPlayback();
    }, { threshold: 0.15 });

    observer.observe(section);
    document.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", syncPlayback);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      reducedMotion.removeEventListener("change", syncPlayback);
      video.pause();
    };
  }, []);

  function selectExpression(index: number) {
    const video = videoRef.current;
    if (!video || video.readyState < 1) return;
    video.currentTime = index * PHASE_SECONDS;
    setActive(index);
  }

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    playbackPreference.current = video.paused;
    if (video.paused) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  return (
    <section ref={sectionRef} id="expression-studies" className={styles.section} aria-labelledby="expression-title">
      <div className={styles.layout}>
        <div className={styles.copy}>
          <header className={styles.header}>
            <h2 id="expression-title">EXPRESSION STUDIES<span lang="zh-CN">表情演绎</span></h2>
          </header>

          <div className={styles.description}>
            <p lang="en">
              This study tests whether the character remains recognisable as facial expressions change.
              Subtle shifts in gaze, mouth shape and facial tension are introduced within a controlled
              loop, while facial structure, hairstyle and proportions remain consistent.
            </p>
            <p lang="zh-CN">
              本研究检验角色在表情变化时是否仍然保持辨识度。在可控的循环动画中，引入视线、嘴部形态与面部肌肉张力的细微变化，同时保持面部结构、发型和比例的一致。
            </p>
          </div>
        </div>

        <figure className={styles.visual}>
          <div className={styles.media}>
            <video
              ref={videoRef}
              className={styles.video}
              src="/aigc/project-01/expressions-v1/expressions-loop.mp4"
              poster="/about-motion-v2/poster.jpg"
              width={1112}
              height={834}
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="角色的低头直视、抬头、眨眼和侧看四种表情循环，无声视频"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(event) => {
                // Highlight the next expression as its About transition begins.
                setActive(Math.floor((event.currentTarget.currentTime + TRANSITION_SECONDS) / PHASE_SECONDS) % expressions.length);
              }}
            />
            <button className={styles.playback} type="button" onClick={togglePlayback} aria-label={playing ? "暂停表情循环" : "播放表情循环"}>
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                {playing ? <path d="M4 3h2.5v10H4zm5.5 0H12v10H9.5z" /> : <path d="m4 2 10 6-10 6z" />}
              </svg>
              {playing ? "PAUSE LOOP" : "PLAY LOOP"}
            </button>
          </div>
          <figcaption className={styles.caption}>
            <ol className={styles.expressions} aria-label="选择角色表情">
              {expressions.map((expression, index) => (
                <li key={expression.title}>
                  <button
                    type="button"
                    className={styles.expression}
                    aria-pressed={active === index}
                    onClick={() => selectExpression(index)}
                  >
                    <span className={styles.number}>{String(index + 1).padStart(2, "0")} /</span>
                    <span className={styles.label}>
                      <span className={styles.title}>{expression.title}</span>
                      <span className={styles.translation} lang="zh-CN">{expression.translation}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>

          </figcaption>
        </figure>
      </div>
    </section>
  );
}
