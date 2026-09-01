"use client";

import { useEffect, useRef, useState } from "react";

type CoverState = "visible" | "leaving" | "hidden";

function LiquidRefractionBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let surface: import("threejs-components/build/backgrounds/liquid1.min.js").LiquidSurface | null = null;

    const startSurface = async () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const source = document.createElement("canvas");
      const context = source.getContext("2d");

      if (!context) return;

      source.width = Math.round(width * ratio);
      source.height = Math.round(height * ratio);
      context.scale(ratio, ratio);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);

      // ISC-licensed refraction engine used by liquid-refraction-lab.
      const { default: createLiquidSurface } = await import(
        "threejs-components/build/backgrounds/liquid1.min.js"
      );
      if (disposed) return;

      surface = createLiquidSurface(canvas);
      surface.liquidPlane.material.metalness = 0.32;
      surface.liquidPlane.material.roughness = 0.48;
      surface.liquidPlane.uniforms.displacementScale.value = reducedMotion ? 0 : 1.55;
      surface.liquidPlane.attenuation = 0.984;
      surface.setRain(false);
      await surface.loadImage(source.toDataURL("image/png"));

      if (!disposed) canvas.dataset.ready = "true";
    };

    void startSurface();

    return () => {
      disposed = true;
      surface?.dispose();
    };
  }, []);

  return (
    <canvas
      className="water-ripple-canvas"
      ref={canvasRef}
      aria-hidden="true"
    />
  );
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
          <LiquidRefractionBackground />
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
