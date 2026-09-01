"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const START_TIME = 0.45;
const END_MARGIN = 0.55;

const categories = [
  {
    index: "01",
    title: "Visual Systems",
    subtitle: "视觉系统 / 品牌语言",
    image: "/work-01.jpg",
  },
  {
    index: "02",
    title: "Editorial",
    subtitle: "编辑设计 / 叙事结构",
    image: "/work-02.jpg",
  },
  {
    index: "03",
    title: "Spatial",
    subtitle: "空间实验 / 展览体验",
    image: "/work-03.jpg",
  },
  {
    index: "04",
    title: "Experiments",
    subtitle: "动态影像 / AIGC",
    image: "/work-04.jpg",
  },
];

export default function Home() {
  const pageRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastFrameRef = useRef<HTMLImageElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const page = pageRef.current;
    const video = videoRef.current;
    const lastFrame = lastFrameRef.current;
    const progress = progressRef.current;

    if (!page || !video || !lastFrame || !progress) return;

    let scrollHasStarted = window.scrollY > 2;
    let endTime = 14.45;

    const setInitialFrame = () => {
      endTime = Math.max(START_TIME, video.duration - END_MARGIN);
      video.currentTime = START_TIME;

      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        void video.play().catch(() => undefined);
      }
    };

    if (video.readyState >= 1) setInitialFrame();
    video.addEventListener("loadedmetadata", setInitialFrame);

    const syncVideo = (value: number) => {
      const safeProgress = Math.min(Math.max(value, 0), 1);
      const targetTime = START_TIME + safeProgress * (endTime - START_TIME);

      if (scrollHasStarted && Number.isFinite(targetTime)) {
        video.pause();
        if (Math.abs(video.currentTime - targetTime) > 0.025) {
          video.currentTime = targetTime;
        }
      }

      progress.style.transform = `scaleX(${safeProgress})`;
      const atEnd = safeProgress >= 0.992;
      lastFrame.style.opacity = atEnd ? "1" : "0";
      video.style.opacity = atEnd ? "0" : "1";
    };

    const timelineTrigger = ScrollTrigger.create({
      trigger: page,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (self.progress > 0.002) scrollHasStarted = true;
        syncVideo(self.progress);
      },
    });

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const lenisTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(lenisTick);
    gsap.ticker.lagSmoothing(0);

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { opacity: 0, y: 46, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              end: "top 55%",
              scrub: 0.8,
            },
          },
        );
      });
    }, page);

    syncVideo(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
    ScrollTrigger.refresh();

    return () => {
      video.removeEventListener("loadedmetadata", setInitialFrame);
      timelineTrigger.kill();
      context.revert();
      gsap.ticker.remove(lenisTick);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="site-shell" ref={pageRef}>
      <video
        className="hero-video"
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        poster="/hero-end.jpg"
        aria-hidden="true"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      <img
        className="last-frame"
        ref={lastFrameRef}
        src="/hero-end.jpg"
        alt=""
        aria-hidden="true"
      />

      <div className="video-wash" aria-hidden="true" />

      <div className="scroll-progress" aria-hidden="true">
        <span ref={progressRef} />
      </div>

      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="返回主页">
          PORTFOLIO / 26
        </a>
        <nav aria-label="主导航">
          <a href="#work">作品</a>
          <a href="#about">关于</a>
          <a href="#contact">联系</a>
        </nav>
      </header>

      <section className="chapter hero" id="top">
        <div className="hero-kicker" data-reveal>
          VISUAL PRACTICE · LONDON
        </div>
        <h1 data-reveal>
          BETWEEN
          <span>LINE &amp; MOTION</span>
        </h1>
        <div className="hero-footer" data-reveal>
          <p>以图像、空间与动态叙事，构建清晰而有触感的视觉体验。</p>
          <a className="explore" href="#work">
            <span>探索作品</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section className="chapter about-section" id="about">
        <div className="section-number" data-reveal>
          01 / ABOUT
        </div>
        <div className="about-copy" data-reveal>
          <p className="eyebrow">A PRACTICE BETWEEN ORDER AND ACCIDENT</p>
          <h2>在精确的系统里，保留意外发生的空间。</h2>
          <p>
            这是主页的第一版内容骨架。后续可以把这里替换成你的真实个人介绍、专业方向与设计方法。
          </p>
        </div>
      </section>

      <section className="chapter work-section" id="work" aria-label="作品分类">
        <div className="work-heading" data-reveal>
          <div className="section-number">02 / SELECTED WORK</div>
          <h2>四个入口，构成一份持续生长的作品档案。</h2>
        </div>

        <div className="work-grid">
          {categories.map((category) => (
            <article className="work-card" key={category.index} data-reveal>
              <div
                className="work-image"
                style={{ backgroundImage: `url(${category.image})` }}
                role="img"
                aria-label={`${category.title} 分类封面`}
              />
              <div className="work-meta">
                <span>{category.index}</span>
                <div>
                  <h3>{category.title}</h3>
                  <p>{category.subtitle}</p>
                </div>
                <span aria-hidden="true">↗</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="chapter process-section">
        <div className="section-number" data-reveal>
          03 / APPROACH
        </div>
        <div className="process-list">
          <div data-reveal>
            <span>01</span>
            <p>观察与研究</p>
            <small>RESEARCH</small>
          </div>
          <div data-reveal>
            <span>02</span>
            <p>建立视觉语言</p>
            <small>SYSTEM</small>
          </div>
          <div data-reveal>
            <span>03</span>
            <p>形成可体验的叙事</p>
            <small>EXPERIENCE</small>
          </div>
        </div>
      </section>

      <footer className="chapter contact-section" id="contact">
        <div className="section-number" data-reveal>
          04 / CONTACT
        </div>
        <div className="contact-copy" data-reveal>
          <p>AVAILABLE FOR SELECTED COLLABORATIONS</p>
          <h2>LET&apos;S MAKE<br />SOMETHING MOVE.</h2>
          <a href="mailto:hello@example.com">hello@example.com</a>
        </div>
        <div className="contact-bottom" data-reveal>
          <span>PORTFOLIO / 2026</span>
          <span>SCROLL STORY / 01</span>
        </div>
      </footer>
    </main>
  );
}
