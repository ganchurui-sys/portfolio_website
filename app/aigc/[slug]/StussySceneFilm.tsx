"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./stussy-scene-film.module.css";

const mediaRoot = "/project-media-v1/aigc/stussy-city-waves/scene-v1";

export default function StussySceneFilm() {
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
      id="stussy-scene-film"
      className={styles.section}
      aria-label="Stüssy 城市浪潮，第 9 页：活动场景视频"
    >
      <div className={styles.sheet}>
        <div className={styles.frame}>
          <video
            ref={videoRef}
            id="stussy-scene-video"
            className={styles.video}
            width={1920}
            height={1080}
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            poster={mediaRoot + "/scene-poster.webp"}
            aria-label="Stüssy CITY WAVES 滑板活动场景，灯光与屏幕动态展示"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            <source src={mediaRoot + "/scene.mp4"} type="video/mp4" />
          </video>
        </div>
        <button
          type="button"
          className={styles.playback}
          onClick={togglePlayback}
          aria-label={playing ? "暂停场景视频" : "播放场景视频"}
          aria-controls="stussy-scene-video"
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
