"use client";

import { useEffect, useRef, useState } from "react";

type CoverState = "visible" | "leaving" | "hidden";

type Ripple = {
  x: number;
  y: number;
  age: number;
  duration: number;
  intensity: number;
  phase: number;
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
        duration: 1900 + intensity * 650,
        intensity,
        phase: Math.random() * Math.PI * 2,
      });

      if (ripples.length > 24) ripples.shift();
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

    const drawRing = (ripple: Ripple, progress: number, ringScale: number) => {
      const eased = 1 - Math.pow(1 - progress, 2);
      const radius = (12 + eased * (145 + ripple.intensity * 135)) * ringScale;
      const alpha = Math.sin(progress * Math.PI) * 0.2 * ripple.intensity;
      const wave = (1 - progress) * 2.6;
      const segments = 88;

      context.save();
      context.translate(ripple.x, ripple.y);
      context.scale(1, 0.62);
      context.beginPath();

      for (let index = 0; index <= segments; index += 1) {
        const angle = (index / segments) * Math.PI * 2;
        const displacement = Math.sin(angle * 6 + ripple.phase + progress * 8) * wave;
        const pointRadius = radius + displacement;
        const x = Math.cos(angle) * pointRadius;
        const y = Math.sin(angle) * pointRadius;

        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }

      context.closePath();
      context.lineWidth = 1.1 + ripple.intensity * 0.45;
      context.strokeStyle = `rgba(80, 126, 153, ${alpha})`;
      context.shadowColor = `rgba(76, 121, 150, ${alpha * 0.8})`;
      context.shadowBlur = 10 + ripple.intensity * 6;
      context.stroke();

      context.translate(0, -2.2);
      context.lineWidth = 0.8;
      context.strokeStyle = `rgba(255, 255, 255, ${alpha * 1.3})`;
      context.shadowBlur = 0;
      context.stroke();
      context.restore();
    };

    const animate = (time: number) => {
      const delta = Math.min(time - lastFrame, 40);
      lastFrame = time;
      context.clearRect(0, 0, width, height);

      if (time - lastAmbient > 2500) {
        addRipple(
          width * (0.12 + Math.random() * 0.76),
          height * (0.18 + Math.random() * 0.64),
          0.32,
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

        drawRing(ripple, progress, 1);
        drawRing(ripple, Math.min(1, progress + 0.08), 0.78);
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const now = performance.now();
      const distance = Math.hypot(event.clientX - lastPointerX, event.clientY - lastPointerY);

      if (now - lastPointerTime > 75 && distance > 24) {
        addRipple(event.clientX, event.clientY, 0.48);
        lastPointerTime = now;
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      addRipple(event.clientX, event.clientY, 1.15);
      addRipple(event.clientX, event.clientY, 0.9, 150);
      addRipple(event.clientX, event.clientY, 0.7, 300);
    };

    resizeCanvas();

    if (!reducedMotion) {
      addRipple(width * 0.24, height * 0.42, 0.38);
      addRipple(width * 0.72, height * 0.3, 0.3, 500);
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
              <img className="cover-title-image" src="/portfolio-title.png" alt="Portfolio" />
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
