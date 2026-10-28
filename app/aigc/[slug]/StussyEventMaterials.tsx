"use client";

import { useEffect, useRef, useState } from "react";
import Image from "../../components/ProjectImage";
import styles from "./stussy-event-materials.module.css";

const mediaRoot = "/project-media-v1/aigc/stussy-city-waves/event-materials-v1";
const videoSrc = mediaRoot + "/wristbands-white-v3.mp4";

export default function StussyEventMaterials() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackIntent = useRef<boolean | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const syncPlayback = () => {
      if (visible && !document.hidden && (playbackIntent.current ?? !preference.matches)) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.1 });
    observer.observe(video);
    preference.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    playbackIntent.current = video.paused;
    if (video.paused) void video.play().catch(() => {});
    else video.pause();
  };

  return (
    <section
      id="stussy-event-materials"
      className={styles.section}
      aria-label="Stüssy 城市浪潮，第 8 页：活动门票与动态手环"
    >
      <div className={styles.sheet}>
        <Image
          className={styles.tickets}
          src={mediaRoot + "/tickets.webp"}
          alt="CITY WAVES 上海活动门票，紫色、黑色、白色与蓝色四种配色"
          width={1280}
          height={1440}
          sizes="(max-width: 700px) 50vw, 45vw"
          draggable={false}
        />
        <video
          key={videoSrc}
          ref={videoRef}
          id="stussy-wristband-video"
          className={styles.wristbands}
          width={760}
          height={930}
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          poster={mediaRoot + "/wristbands-white-v3-poster.webp"}
          aria-label="白、紫、蓝、黑四色 Stüssy CITY WAVES 手环旋转展示，白色背景"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <button
          type="button"
          className={styles.playback}
          onClick={togglePlayback}
          aria-label={playing ? "暂停手环视频" : "播放手环视频"}
          aria-controls="stussy-wristband-video"
          title={playing ? "暂停" : "播放"}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            {playing ? <path d="M8 5h3v14H8zm5 0h3v14h-3z" /> : <path d="m8 5 11 7-11 7z" />}
          </svg>
        </button>
      </div>
    </section>
  );
}
