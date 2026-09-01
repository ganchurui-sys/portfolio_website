"use client";

import { useEffect, useRef, useState } from "react";

type CoverState = "visible" | "leaving" | "hidden";

type Ripple = {
  x: number;
  y: number;
  age: number;
  duration: number;
  intensity: number;
};

function WaterRippleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrame = 0;
    let lastFrame = performance.now();
    let lastAmbient = lastFrame;
    let lastPointerTime = 0;
    let lastPointerX = -100;
    let lastPointerY = -100;
    const ripples: Ripple[] = [];

    const addRipple = (
      x: number,
      y: number,
      intensity: number,
      delay = 0,
    ) => {
      ripples.push({
        x,
        y,
        age: -delay,
        duration: 1350 + intensity * 450,
        intensity,
      });

      if (ripples.length > 14) ripples.shift();
    };

    const resizeCanvas = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const drawWave = (ripple: Ripple, progress: number, waveScale: number) => {
      const eased = 1 - Math.pow(1 - progress, 2);
      const radius = (12 + eased * (72 + ripple.intensity * 68)) * waveScale;
      const band = 14 + ripple.intensity * 13;
      const outerRadius = radius + band;
      const visibility = Math.sin(progress * Math.PI);
      const alpha = visibility * (0.12 + ripple.intensity * 0.08);
      const bandStart = Math.max(0, (radius - band) / outerRadius);
      const shadowPeak = Math.max(bandStart + 0.01, (radius - band * 0.28) / outerRadius);
      const lightPeak = Math.max(shadowPeak + 0.01, (radius + band * 0.22) / outerRadius);
      const softEdge = Math.max(lightPeak + 0.01, (radius + band * 0.68) / outerRadius);

      context.save();
      context.translate(ripple.x, ripple.y);
      context.scale(1, 0.78);

      const gradient = context.createRadialGradient(0, 0, 0, 0, 0, outerRadius);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(bandStart, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(shadowPeak, `rgba(32, 32, 32, ${alpha * 0.34})`);
      gradient.addColorStop(lightPeak, `rgba(255, 255, 255, ${alpha * 0.9})`);
      gradient.addColorStop(softEdge, `rgba(50, 50, 50, ${alpha * 0.16})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      context.filter = `blur(${1.8 + ripple.intensity * 1.8}px)`;
      context.fillStyle = gradient;
      context.fillRect(-outerRadius, -outerRadius, outerRadius * 2, outerRadius * 2);
      context.restore();
    };

    const animate = (time: number) => {
      const delta = Math.min(time - lastFrame, 40);
      lastFrame = time;
      context.clearRect(0, 0, width, height);

      if (time - lastAmbient > 3600) {
        addRipple(
          width * (0.12 + Math.random() * 0.76),
          height * (0.18 + Math.random() * 0.64),
          0.2,
        );
        lastAmbient = time;
      }

      for (let index = ripples.length - 1; index >= 0; index -= 1) {
        const ripple = ripples[index];
        ripple.age += delta;
        if (ripple.age < 0) continue;

        const progress = ripple.age / ripple.duration;
        if (progress >= 1) {
          ripples.splice(index, 1);
          continue;
        }

        drawWave(ripple, progress, 1);
        drawWave(ripple, Math.min(1, progress + 0.1), 0.7);
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const now = performance.now();
      const distance = Math.hypot(event.clientX - lastPointerX, event.clientY - lastPointerY);

      if (now - lastPointerTime > 110 && distance > 36) {
        addRipple(event.clientX, event.clientY, 0.34);
        lastPointerTime = now;
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      addRipple(event.clientX, event.clientY, 0.85);
      addRipple(event.clientX, event.clientY, 0.48, 170);
    };

    resizeCanvas();

    if (!reducedMotion) {
      addRipple(width * 0.24, height * 0.42, 0.24);
      addRipple(width * 0.72, height * 0.3, 0.2, 650);
      window.addEventListener("resize", resizeCanvas);
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerdown", handlePointerDown, { passive: true });
      animationFrame = window.requestAnimationFrame(animate);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return <canvas className="water-ripple-canvas" ref={canvasRef} aria-hidden="true" />;
}

const projects = [
  { number: "01", title: "Form / Function", type: "Identity", year: "2026" },
  { number: "02", title: "Common Ground", type: "Editorial", year: "2025" },
  { number: "03", title: "After Image", type: "Digital", year: "2025" },
  { number: "04", title: "New Rituals", type: "Research", year: "2024" },
];

export default function Home() {
  const [coverState, setCoverState] = useState<CoverState>("visible");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = coverState === "hidden" ? previousOverflow : "hidden";

    if (coverState === "visible") {
      window.scrollTo({ top: 0, left: 0 });
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [coverState]);

  const enterPortfolio = () => {
    if (coverState === "visible") setCoverState("leaving");
  };

  return (
    <>
      {coverState !== "hidden" && (
        <section
          className={`entry-cover ${coverState === "leaving" ? "entry-cover--leaving" : ""}`}
          aria-label="作品集封面"
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && coverState === "leaving") {
              setCoverState("hidden");
            }
          }}
        >
          <WaterRippleBackground />
          <div className="cover-stage">
            <div className="cover-title-frame">
              <img
                className="cover-title-image"
                src="/portfolio-title-transparent.png"
                alt="Portfolio"
              />
            </div>
          </div>
          <button
            className="enter-button"
            type="button"
            onClick={enterPortfolio}
            aria-label="进入作品集"
          />
        </section>
      )}

      <main
        className="portfolio-home"
        aria-hidden={coverState !== "hidden"}
        inert={coverState !== "hidden"}
      >
        <header className="home-nav">
          <a className="home-mark" href="#top" aria-label="返回首页顶部">
            PF<span>°</span>26
          </a>
          <nav aria-label="主导航">
            <a href="#projects">作品</a>
            <a href="#about">关于</a>
            <a href="mailto:hello@example.com">联系</a>
          </nav>
        </header>

        <section className="home-hero" id="top">
          <div className="hero-note">
            <span>(01 — 26)</span>
            <p>INDEPENDENT DESIGNER<br />&amp; CREATIVE THINKER</p>
          </div>

          <h2>
            DESIGNING
            <span>IDEAS</span>
            INTO FORM.
          </h2>

          <div className="hero-bottom">
            <p>Brand identities, editorial systems<br />and digital experiences.</p>
            <a href="#projects">VIEW SELECTED WORK <span>↓</span></a>
          </div>
        </section>

        <section className="project-index" id="projects">
          <div className="section-label">
            <span>SELECTED WORK</span>
            <span>2024 — 2026</span>
          </div>

          <div className="project-list">
            {projects.map((project) => (
              <a className="project-row" href="#about" key={project.number}>
                <span className="project-number">{project.number}</span>
                <h3>{project.title}</h3>
                <span>{project.type}</span>
                <span>{project.year}</span>
                <span className="project-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>

        <section className="home-about" id="about">
          <p>ABOUT / 02</p>
          <h2>Curious by nature.<br />Precise by design.</h2>
          <div>
            <p>
              I build visual identities and digital experiences where clear thinking
              meets expressive form.
            </p>
            <a href="mailto:hello@example.com">LET&apos;S TALK <span>↗</span></a>
          </div>
        </section>

        <footer className="home-footer">
          <span>PORTFOLIO © 2026</span>
          <a href="#top">BACK TO TOP ↑</a>
        </footer>
      </main>
    </>
  );
}
