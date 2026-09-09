"use client";

import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import PortfolioLanyard from "./components/PortfolioLanyard";
import UrbanProjectLinks, { ProjectLinks } from "./components/UrbanProjectLinks";
import { aigcProjects } from "./aigc/projects";

type CoverState = "visible" | "loading" | "leaving" | "hidden";

type VideoAssetUrls = {
  master: string;
  scrub: string;
};

const VIDEO_START_TIME = 1.5;
const VIDEO_END_TIME = 14.5;
const SCENE_START_TIMES = [VIDEO_START_TIME, 2.75, 4, 7.5, 12] as const;
const SCENE_COUNT = SCENE_START_TIMES.length;
const NAVIGATION_TIME_OFFSET = 0.04;
const SCENE_TRANSITION_DURATION = 900;
const MAX_SCENE_TRANSITION_DURATION = 2300;
const MAX_TRANSITION_PLAYBACK_RATE = 4.5;
const MASTER_VIDEO_PATH = "/home-background-retro-desk-original-4k.mp4";
const SCRUB_VIDEO_PATH = "/home-background-retro-desk-scrub-v4-1440p.mp4";
const VIDEO_POSTER_PATH = "/home-background-retro-desk-original-4k-poster.jpg";
const VIDEO_END_FRAME_PATH = "/home-background-retro-desk-original-4k-end.jpg";

const getSceneIndexForTime = (time: number) => {
  for (let scene = SCENE_COUNT - 1; scene >= 0; scene -= 1) {
    if (time >= SCENE_START_TIMES[scene]) return scene;
  }
  return 0;
};

function LiquidRefractionBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const titleImage = new Image();
    let disposed = false;
    let surface: import("threejs-components/build/backgrounds/liquid1.min.js").LiquidSurface | null = null;

    const startSurface = async () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const mobile = width <= 760;
      const frameWidth = Math.min(
        width * (mobile ? 0.96 : 0.94),
        height * 1.5,
        1600,
      );
      const frameHeight = frameWidth / 2;
      const stageTop = height * (mobile ? 0.18 : 0.14);
      const stageHeight = height * (mobile ? 0.3 : 0.34);
      const frameTop = stageTop + (stageHeight - frameHeight) / 2;
      const source = document.createElement("canvas");
      const context = source.getContext("2d");

      if (!context) return;

      source.width = Math.round(width * ratio);
      source.height = Math.round(height * ratio);
      context.scale(ratio, ratio);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.save();
      context.globalAlpha = 0.6;
      context.shadowColor = "rgba(0, 0, 0, 0.32)";
      context.shadowBlur = Math.max(12, frameWidth * 0.014);
      context.shadowOffsetX = Math.max(5, frameWidth * 0.006);
      context.shadowOffsetY = Math.max(9, frameWidth * 0.011);
      context.drawImage(
        titleImage,
        (width - frameWidth) / 2,
        frameTop,
        frameWidth,
        frameHeight,
      );
      context.restore();
      context.drawImage(
        titleImage,
        (width - frameWidth) / 2,
        frameTop,
        frameWidth,
        frameHeight,
      );

      // ISC-licensed refraction engine used by liquid-refraction-lab.
      const { default: createLiquidSurface } = await import(
        "threejs-components/build/backgrounds/liquid1.min.js"
      );
      if (disposed) return;

      surface = createLiquidSurface(canvas);
      surface.liquidPlane.material.metalness = 0.5;
      surface.liquidPlane.material.roughness = 0.34;
      surface.liquidPlane.uniforms.displacementScale.value = reducedMotion ? 0 : 1.8;
      surface.liquidPlane.attenuation = 0.986;
      surface.setRain(false);
      await surface.loadImage(source.toDataURL("image/png"));

      if (!disposed) canvas.dataset.ready = "true";
    };

    titleImage.addEventListener("load", startSurface, { once: true });
    titleImage.src = "/portfolio-title-brush.png";

    return () => {
      disposed = true;
      titleImage.removeEventListener("load", startSurface);
      surface?.dispose();
    };
  }, []);

  return (
    <canvas
      className="water-ripple-canvas"
      ref={canvasRef}
      role="img"
      aria-label="Portfolio"
    />
  );
}

/* Legacy CSS/DOM lanyard retained temporarily for easy visual rollback.
type InteractiveWorkBadgeProps = {
  active: boolean;
};

function InteractiveWorkBadge({ active }: InteractiveWorkBadgeProps) {
  const rigRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const animationFrameRef = useRef(0);
  const draggedRef = useRef(false);
  const kickRef = useRef<() => void>(() => undefined);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const rig = rigRef.current;
    const card = cardRef.current;
    const assembly = rig?.querySelector<HTMLElement>(".about-work-badge__assembly");
    const lanyardPaths = rig?.querySelectorAll<SVGPathElement>("[data-lanyard-path]");
    if (!rig || !card || !assembly || !lanyardPaths) return;

    const assemblyStyle = getComputedStyle(assembly);
    const ropeBase = Math.max(Number.parseFloat(assemblyStyle.top), 1);
    const gravity = 980;
    const tetherStiffness = 290;
    const tetherDamping = 7.2;
    const ropeRestLength = Math.max(ropeBase - gravity / tetherStiffness, 48);
    let pointX = 0;
    let pointY = ropeBase;
    let velocityX = 0;
    let velocityY = 0;
    let cardAngle = 0;
    let cardAngularVelocity = 0;
    let cardFlipAngle = 0;
    let cardFlipVelocity = 0;
    let cardFlipTarget = 0;
    let cardTilt = 0;
    let clickDirection = 1;
    let dragging = false;
    let pointerId = -1;
    let startPointerX = 0;
    let startPointerY = 0;
    let startPointX = 0;
    let startPointY = 0;
    let previousPointX = 0;
    let previousPointY = 0;
    let previousCardAngle = 0;
    let previousTime = performance.now();

    const clampValue = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);

    const paint = () => {
      const anchorX = 300;
      const ropeY = pointY;
      const endX = anchorX + pointX;
      const ropeLength = Math.max(Math.hypot(pointX, ropeY), 1);
      const perpendicularX = -ropeY / ropeLength;
      const perpendicularY = pointX / ropeLength;
      const curve = clampValue(12 + Math.abs(pointX) * 0.025, 10, 22);
      const path = [
        `M ${anchorX} 0`,
        `C ${(anchorX + pointX * 0.31 + perpendicularX * curve).toFixed(2)} ${(ropeY * 0.31 + perpendicularY * curve).toFixed(2)}`,
        `${(anchorX + pointX * 0.72 - perpendicularX * curve * 0.55).toFixed(2)} ${(ropeY * 0.72 - perpendicularY * curve * 0.55).toFixed(2)}`,
        `${endX.toFixed(2)} ${ropeY.toFixed(2)}`,
      ].join(" ");
      lanyardPaths.forEach((lanyardPath) => lanyardPath.setAttribute("d", path));

      rig.style.setProperty("--badge-x", `${pointX.toFixed(2)}px`);
      rig.style.setProperty("--badge-y", `${(pointY - ropeBase).toFixed(2)}px`);
      rig.style.setProperty("--badge-turn", `${cardAngle.toFixed(2)}deg`);
      rig.style.setProperty("--badge-spin-y", `${cardFlipAngle.toFixed(2)}deg`);
      rig.style.setProperty("--badge-tilt-x", `${cardTilt.toFixed(2)}deg`);
    };

    const stopMotion = () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
    };

    const startMotion = () => {
      stopMotion();
      let lastTime = performance.now();

      const tick = (now: number) => {
        const delta = Math.min((now - lastTime) / 1000, 0.034);
        lastTime = now;
        const steps = Math.max(1, Math.ceil(delta / (1 / 180)));
        const step = delta / steps;

        for (let index = 0; index < steps; index += 1) {
          let accelerationX = 0;
          let accelerationY = gravity;
          const distance = Math.max(Math.hypot(pointX, pointY), 0.001);
          const stretch = distance - ropeRestLength;

          if (stretch > 0) {
            const normalX = pointX / distance;
            const normalY = pointY / distance;
            const radialVelocity = velocityX * normalX + velocityY * normalY;
            const tension = Math.max(
              0,
              stretch * tetherStiffness + radialVelocity * tetherDamping,
            );
            accelerationX -= normalX * tension;
            accelerationY -= normalY * tension;
          }

          velocityX += accelerationX * step;
          velocityY += accelerationY * step;
          const airResistance = Math.exp(-0.62 * step);
          velocityX *= airResistance;
          velocityY *= airResistance;
          pointX += velocityX * step;
          pointY += velocityY * step;

          const ropeAngle = Math.atan2(pointX, pointY) * (180 / Math.PI);
          const targetCardAngle = clampValue(
            ropeAngle * 0.54 + velocityX * 0.012,
            -48,
            48,
          );
          cardAngularVelocity += (targetCardAngle - cardAngle) * 18 * step;
          cardAngularVelocity *= Math.exp(-3.6 * step);
          cardAngle += cardAngularVelocity * step;

          cardFlipVelocity += (cardFlipTarget - cardFlipAngle) * 16 * step;
          cardFlipVelocity *= Math.exp(-4.6 * step);
          cardFlipAngle += cardFlipVelocity * step;
          cardTilt *= Math.exp(-8.4 * step);
        }

        paint();

        if (
          Math.abs(pointX) < 0.18 &&
          Math.abs(pointY - ropeBase) < 0.18 &&
          Math.abs(velocityX) < 1.1 &&
          Math.abs(velocityY) < 1.1 &&
          Math.abs(cardAngularVelocity) < 0.4 &&
          Math.abs(cardFlipTarget - cardFlipAngle) < 0.25 &&
          Math.abs(cardFlipVelocity) < 0.45
        ) {
          pointX = 0;
          pointY = ropeBase;
          velocityX = 0;
          velocityY = 0;
          cardAngle = 0;
          cardAngularVelocity = 0;
          cardFlipAngle = cardFlipTarget;
          cardFlipVelocity = 0;
          cardTilt = 0;
          paint();
          animationFrameRef.current = 0;
          return;
        }

        animationFrameRef.current = window.requestAnimationFrame(tick);
      };

      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!active || event.button !== 0) return;
      event.stopPropagation();
      stopMotion();
      dragging = true;
      draggedRef.current = false;
      pointerId = event.pointerId;
      startPointerX = event.clientX;
      startPointerY = event.clientY;
      startPointX = pointX;
      startPointY = pointY;
      previousPointX = pointX;
      previousPointY = pointY;
      previousCardAngle = cardAngle;
      previousTime = performance.now();
      card.setPointerCapture(pointerId);
      rig.classList.add("is-dragging");
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;
      event.preventDefault();
      const now = performance.now();
      let nextPointX = startPointX + event.clientX - startPointerX;
      let nextPointY = startPointY + event.clientY - startPointerY;
      const maximumReach = ropeBase * 1.78;
      const nextDistance = Math.hypot(nextPointX, nextPointY);

      if (nextDistance > maximumReach) {
        const scale = maximumReach / nextDistance;
        nextPointX *= scale;
        nextPointY *= scale;
      }

      nextPointY = Math.max(nextPointY, 24);
      const delta = Math.max((now - previousTime) / 1000, 0.008);

      velocityX = clampValue((nextPointX - previousPointX) / delta, -1900, 1900);
      velocityY = clampValue((nextPointY - previousPointY) / delta, -1900, 1900);
      pointX = nextPointX;
      pointY = nextPointY;

      const movementX = pointX - previousPointX;
      const movementY = pointY - previousPointY;
      if (Math.hypot(movementX, movementY) > 0.4) {
        const directionAngle = Math.atan2(movementY, movementX) * (180 / Math.PI) - 90;
        const wrappedAngle = ((directionAngle + 180) % 360 + 360) % 360 - 180;
        const targetAngle = clampValue(wrappedAngle * 0.72, -108, 108);
        cardAngle += (targetAngle - cardAngle) * 0.46;
        cardAngularVelocity = clampValue(
          (cardAngle - previousCardAngle) / delta,
          -1050,
          1050,
        );
        cardFlipAngle += movementX * 0.72;
        cardFlipTarget = cardFlipAngle;
        cardFlipVelocity = clampValue(velocityX * 0.28, -680, 680);
        cardTilt = clampValue(-velocityY * 0.018, -18, 18);
      }

      previousPointX = pointX;
      previousPointY = pointY;
      previousCardAngle = cardAngle;
      previousTime = now;
      draggedRef.current ||= Math.hypot(
        pointX - startPointX,
        pointY - startPointY,
      ) > 5;
      paint();
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;
      event.stopPropagation();
      dragging = false;
      rig.classList.remove("is-dragging");
      if (card.hasPointerCapture(pointerId)) card.releasePointerCapture(pointerId);
      pointerId = -1;
      cardFlipTarget = Math.round(cardFlipAngle / 180) * 180;
      setFlipped(Math.abs(Math.round(cardFlipTarget / 180)) % 2 === 1);
      startMotion();
    };

    card.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    kickRef.current = () => {
      velocityX += 150 * clickDirection;
      velocityY -= 55;
      cardAngularVelocity += 130 * clickDirection;
      cardFlipTarget += 180 * clickDirection;
      cardFlipVelocity += 115 * clickDirection;
      clickDirection *= -1;
      startMotion();
    };

    if (active && !reducedMotion) {
      pointX = 20;
      pointY = Math.min(42, ropeBase * 0.25);
      velocityX = 72;
      velocityY = 62;
      cardAngle = 14;
      cardAngularVelocity = -36;
      cardFlipAngle = -10;
      cardFlipVelocity = 28;
      cardFlipTarget = 0;
      paint();
      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = 0;
        startMotion();
      });
    } else {
      pointX = 0;
      pointY = ropeBase;
      velocityX = 0;
      velocityY = 0;
      cardAngle = 0;
      cardAngularVelocity = 0;
      cardFlipAngle = 0;
      cardFlipVelocity = 0;
      cardFlipTarget = 0;
      cardTilt = 0;
      paint();
    }

    return () => {
      kickRef.current = () => undefined;
      stopMotion();
      card.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [active]);

  return (
    <div
      className={`about-work-badge${active ? " is-active" : ""}`}
      aria-hidden={!active}
    >
      <div className="about-work-badge__drop" ref={rigRef}>
        <svg
          className="about-work-badge__lanyard"
          viewBox="0 0 600 540"
          aria-hidden="true"
        >
          <defs>
            <pattern id="lanyard-weave" width="16" height="16" patternUnits="userSpaceOnUse">
              <image
                href="/badge-lanyard-weave-v2.png"
                width="16"
                height="16"
                preserveAspectRatio="xMidYMid slice"
              />
            </pattern>
            <filter id="lanyard-shadow" x="-40%" y="-10%" width="180%" height="130%">
              <feDropShadow dx="4" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.46" />
            </filter>
          </defs>
          <path data-lanyard-path className="about-work-badge__strap-shadow" />
          <path
            id="about-badge-lanyard-path"
            data-lanyard-path
            className="about-work-badge__strap"
          />
          <path data-lanyard-path className="about-work-badge__strap-highlight" />
          <text className="about-work-badge__strap-text">
            <textPath href="#about-badge-lanyard-path" startOffset="8%">
              Zhong- portfolio
            </textPath>
          </text>
        </svg>
        <div className="about-work-badge__assembly">
          <div
            className="about-work-badge__clip about-work-badge__clip--behind"
            aria-hidden="true"
          >
            <NextImage
              className="about-work-badge__clip-image"
              src="/badge-lanyard-hardware-v2.png"
              alt=""
              width={607}
              height={1025}
              priority
            />
          </div>
          <button
            ref={cardRef}
            className={`about-work-badge__card${flipped ? " is-flipped" : ""}`}
            type="button"
            tabIndex={active ? 0 : -1}
            aria-label="Zhong 的工作牌，可拖拽或点击翻面"
            aria-pressed={flipped}
            onClick={() => {
              if (draggedRef.current) {
                draggedRef.current = false;
                return;
              }
              kickRef.current();
              setFlipped((value) => !value);
            }}
          >
            <span className="about-work-badge__card-inner">
              <span className="about-work-badge__edge about-work-badge__edge--left" aria-hidden="true" />
              <span className="about-work-badge__edge about-work-badge__edge--right" aria-hidden="true" />
              <span className="about-work-badge__edge about-work-badge__edge--top" aria-hidden="true" />
              <span className="about-work-badge__edge about-work-badge__edge--bottom" aria-hidden="true" />
              <span className="about-work-badge__face about-work-badge__face--front">
                <span className="about-work-badge__card-hole" aria-hidden="true" />
                <span className="about-work-badge__front-mark">ZHONG</span>
              </span>
              <span className="about-work-badge__face about-work-badge__face--back">
                <span className="about-work-badge__card-hole" aria-hidden="true" />
                <span className="about-work-badge__back-mark">ZHONGISM</span>
                <small>PORTFOLIO / 2026</small>
              </span>
            </span>
          </button>
          <div
            className="about-work-badge__clip about-work-badge__clip--front"
            aria-hidden="true"
          >
            <NextImage
              className="about-work-badge__clip-image"
              src="/badge-lanyard-hardware-v2.png"
              alt=""
              width={607}
              height={1025}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
*/

export default function Home() {
  const [coverState, setCoverState] = useState<CoverState>("visible");
  const [activeScene, setActiveScene] = useState(0);
  const [aboutBadgeTrigger, setAboutBadgeTrigger] = useState<number | null>(null);
  const aboutBadgePendingRef = useRef(false);
  const aboutBadgeShownRef = useRef(false);
  const [videoAssetUrls, setVideoAssetUrls] = useState<VideoAssetUrls | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingError, setLoadingError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const bulletSectionRef = useRef<HTMLElement>(null);
  const bulletVideoRef = useRef<HTMLVideoElement>(null);
  const bulletScrubVideoRef = useRef<HTMLVideoElement>(null);
  const videoAssetUrlsRef = useRef<VideoAssetUrls | null>(null);
  const requestedSceneRef = useRef<number | null>(null);

  useEffect(() => {
    const sceneParam = new URLSearchParams(window.location.search).get("scene");
    if (sceneParam === null) return;

    const requestedScene = Number(sceneParam);
    if (
      !Number.isInteger(requestedScene) ||
      requestedScene < 0 ||
      requestedScene >= SCENE_COUNT
    ) {
      return;
    }

    requestedSceneRef.current = requestedScene;
    const directAssetUrls = {
      master: MASTER_VIDEO_PATH,
      scrub: SCRUB_VIDEO_PATH,
    };
    videoAssetUrlsRef.current = directAssetUrls;
    setVideoAssetUrls(directAssetUrls);
    setCoverState("hidden");
  }, []);

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

  useEffect(() => {
    if (coverState !== "loading" || videoAssetUrlsRef.current) return;

    const controller = new AbortController();
    let lastProgress = -1;
    const stats = {
      master: { loaded: 0, total: 0 },
      scrub: { loaded: 0, total: 0 },
    };

    const updateProgress = () => {
      const total = stats.master.total + stats.scrub.total;
      if (!total) return;

      const loaded = stats.master.loaded + stats.scrub.loaded;
      const nextProgress = Math.min(96, Math.round((loaded / total) * 96));
      if (nextProgress !== lastProgress) {
        lastProgress = nextProgress;
        setLoadingProgress(nextProgress);
      }
    };

    const fetchVideo = async (path: string) => {
      const response = await fetch(path, {
        cache: "force-cache",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Unable to load ${path}`);
      return response;
    };

    const streamVideo = async (
      response: Response,
      key: "master" | "scrub",
    ) => {
      const contentType = response.headers.get("content-type") || "video/mp4";
      const reader = response.body?.getReader();

      if (!reader) {
        const buffer = await response.arrayBuffer();
        stats[key].loaded = buffer.byteLength;
        stats[key].total = buffer.byteLength;
        updateProgress();
        return new Blob([buffer], { type: contentType });
      }

      const chunks: ArrayBuffer[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = value.buffer.slice(
          value.byteOffset,
          value.byteOffset + value.byteLength,
        ) as ArrayBuffer;
        chunks.push(chunk);
        stats[key].loaded += value.byteLength;
        updateProgress();
      }

      if (!stats[key].total) stats[key].total = stats[key].loaded;
      updateProgress();
      return new Blob(chunks, { type: contentType });
    };

    const preloadImage = (path: string) =>
      new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => reject(new Error(`Unable to load ${path}`)), {
          once: true,
        });
        image.src = path;
      });

    const loadAssets = async () => {
      try {
        setLoadingError(false);
        setLoadingProgress(0);
        const [masterResponse, scrubResponse] = await Promise.all([
          fetchVideo(MASTER_VIDEO_PATH),
          fetchVideo(SCRUB_VIDEO_PATH),
        ]);
        stats.master.total = Number(masterResponse.headers.get("content-length")) || 0;
        stats.scrub.total = Number(scrubResponse.headers.get("content-length")) || 0;
        updateProgress();
        const [masterBlob, scrubBlob] = await Promise.all([
          streamVideo(masterResponse, "master"),
          streamVideo(scrubResponse, "scrub"),
        ]);
        setLoadingProgress(97);
        await Promise.all([
          preloadImage(VIDEO_POSTER_PATH),
          preloadImage(VIDEO_END_FRAME_PATH),
        ]);

        if (controller.signal.aborted) return;
        const urls = {
          master: URL.createObjectURL(masterBlob),
          scrub: URL.createObjectURL(scrubBlob),
        };
        videoAssetUrlsRef.current = urls;
        setVideoAssetUrls(urls);
        setLoadingProgress(100);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setLoadingError(true);
      }
    };

    void loadAssets();
    return () => controller.abort();
  }, [coverState, loadAttempt]);

  useEffect(() => {
    if (coverState !== "loading" || !videoAssetUrls) return;
    const timer = window.setTimeout(() => setCoverState("leaving"), 420);
    return () => window.clearTimeout(timer);
  }, [coverState, videoAssetUrls]);

  useEffect(() => () => {
    const urls = videoAssetUrlsRef.current;
    if (!urls) return;
    if (urls.master.startsWith("blob:")) URL.revokeObjectURL(urls.master);
    if (urls.scrub.startsWith("blob:")) URL.revokeObjectURL(urls.scrub);
  }, []);

  const enterPortfolio = () => {
    if (coverState === "visible") setCoverState("loading");
  };

  const scrollToScene = useCallback((scene: number) => {
    const boundedScene = Math.min(Math.max(scene, 0), SCENE_COUNT - 1);
    if (boundedScene !== 1) {
      aboutBadgePendingRef.current = false;
      aboutBadgeShownRef.current = false;
      setAboutBadgeTrigger(null);
    }
    window.dispatchEvent(new CustomEvent<number>("portfolio-stage-navigation", {
      detail: boundedScene,
    }));
  }, []);

  useEffect(() => {
    if (coverState !== "hidden") return;

    const section = bulletSectionRef.current;
    const video = bulletVideoRef.current;
    const scrubVideo = bulletScrubVideoRef.current;
    if (!section || !video || !scrubVideo) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const documentRoot = document.documentElement;
    const previousScrollBehavior = documentRoot.style.scrollBehavior;
    const range = VIDEO_END_TIME - VIDEO_START_TIME;
    let autoplayMode = !reducedMotion;
    let autoplayFrame = 0;
    let seekFrame = 0;
    let targetTime = VIDEO_START_TIME;
    let currentScene = -1;
    let settleTimer = 0;
    let masterSwapPending = false;
    let manualControl = false;
    let manualShowingMaster = false;
    let stagePlaybackActive = false;
    let stageNavigationFrame = 0;
    let wheelReleaseTimer = 0;
    let wheelIntentTimer = 0;
    let wheelDeltaAccumulator = 0;
    let wheelGestureLocked = false;
    let touchStartY: number | null = null;

    const clamp = (value: number, min = 0, max = 1) =>
      Math.min(Math.max(value, min), max);

    const phase = (
      time: number,
      start: number,
      fadeInEnd: number,
      fadeOutStart: number,
      end: number,
    ) => {
      if (time <= start || time >= end) return 0;
      if (time < fadeInEnd) return (time - start) / (fadeInEnd - start);
      if (time > fadeOutStart) return 1 - (time - fadeOutStart) / (end - fadeOutStart);
      return 1;
    };

    const updateVisuals = (progress: number) => {
      const safeProgress = clamp(progress);
      const time = VIDEO_START_TIME + safeProgress * range;
      const nextScene = getSceneIndexForTime(time);
      const introOpacity = reducedMotion
        ? Number(nextScene === 0)
        : time <= 2.15
          ? 1
          : clamp((2.75 - time) / 0.6);
      const aboutOpacity = reducedMotion
        ? Number(nextScene === 1)
        : phase(time, 2.15, 2.75, 3.4, 4);
      const uclOpacity = reducedMotion
        ? Number(nextScene === 2)
        : phase(time, 3.4, 4, 6.9, 7.5);
      const aigcOpacity = reducedMotion
        ? Number(nextScene === 3)
        : phase(time, 6.9, 7.5, 11.4, 12);
      const contactOpacity = reducedMotion
        ? Number(nextScene === 4)
        : time <= 11.4
          ? 0
          : clamp((time - 11.4) / 0.6);
      const sceneOpacity = [introOpacity, aboutOpacity, uclOpacity, aigcOpacity, contactOpacity];
      const sceneShift = (scene: number) => {
        if (reducedMotion) return 0;
        const direction = time < SCENE_START_TIMES[scene] ? 1 : -1;
        return (1 - sceneOpacity[scene]) * 34 * direction;
      };
      const videoOpacity = safeProgress < 0.985
        ? 1
        : clamp((1 - safeProgress) / 0.015);
      const stageProgress = nextScene === SCENE_COUNT - 1
        ? 1
        : ((nextScene + 1) + (
            time - SCENE_START_TIMES[nextScene] <= NAVIGATION_TIME_OFFSET + 0.01
              ? 0
              : clamp(
                  (time - SCENE_START_TIMES[nextScene]) /
                    (SCENE_START_TIMES[nextScene + 1] - SCENE_START_TIMES[nextScene]),
                )
          )) / SCENE_COUNT;

      section.style.setProperty("--scene-progress", safeProgress.toFixed(4));
      section.style.setProperty("--stage-progress", stageProgress.toFixed(4));
      const masterOpacity = manualControl && !manualShowingMaster ? 0 : videoOpacity;
      const scrubOpacity = manualControl && !manualShowingMaster ? videoOpacity : 0;

      section.style.setProperty("--video-opacity", masterOpacity.toFixed(4));
      section.style.setProperty("--scrub-video-opacity", scrubOpacity.toFixed(4));
      video.style.opacity = masterOpacity.toFixed(4);
      scrubVideo.style.opacity = scrubOpacity.toFixed(4);
      section.style.setProperty("--intro-opacity", introOpacity.toFixed(4));
      section.style.setProperty("--about-opacity", aboutOpacity.toFixed(4));
      section.style.setProperty("--ucl-opacity", uclOpacity.toFixed(4));
      section.style.setProperty("--aigc-opacity", aigcOpacity.toFixed(4));
      section.style.setProperty("--contact-opacity", contactOpacity.toFixed(4));
      section.style.setProperty("--intro-shift", `${sceneShift(0).toFixed(2)}px`);
      section.style.setProperty("--about-shift", `${sceneShift(1).toFixed(2)}px`);
      section.style.setProperty("--ucl-shift", `${sceneShift(2).toFixed(2)}px`);
      section.style.setProperty("--aigc-shift", `${sceneShift(3).toFixed(2)}px`);
      section.style.setProperty("--contact-shift", `${sceneShift(4).toFixed(2)}px`);

      if (nextScene !== currentScene) {
        currentScene = nextScene;
        if (nextScene === 1 && aboutBadgePendingRef.current) {
          aboutBadgeShownRef.current = true;
        } else if (nextScene !== 1 && aboutBadgeShownRef.current) {
          aboutBadgePendingRef.current = false;
          aboutBadgeShownRef.current = false;
          setAboutBadgeTrigger(null);
        }
        setActiveScene(nextScene);
      }
    };

    const getScrollProgress = () => {
      const rect = section.getBoundingClientRect();
      const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
      return clamp(-rect.top / scrollDistance);
    };

    const renderSeek = () => {
      if (autoplayMode || reducedMotion || stagePlaybackActive) {
        seekFrame = 0;
        return;
      }

      const difference = targetTime - scrubVideo.currentTime;
      if (Math.abs(difference) >= 0.012) {
        scrubVideo.currentTime = targetTime;
      }
      seekFrame = 0;
    };

    const requestScrubFrame = () => {
      if (!seekFrame) {
        seekFrame = window.requestAnimationFrame(renderSeek);
      }
    };

    const handleScrubSeeked = () => {
      if (
        !autoplayMode &&
        !reducedMotion &&
        !stagePlaybackActive &&
        Math.abs(targetTime - scrubVideo.currentTime) >= 0.012
      ) {
        requestScrubFrame();
      } else {
        seekFrame = 0;
      }
    };

    const handleMasterSeeked = () => {
      if (!masterSwapPending) return;
      masterSwapPending = false;
      manualShowingMaster = true;
      updateVisuals(getScrollProgress());
    };

    const scheduleMasterSwap = (delay = 850) => {
      if (settleTimer) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        settleTimer = 0;
        if (!manualControl || autoplayMode) return;

        if (Math.abs(video.currentTime - targetTime) < 0.025) {
          manualShowingMaster = true;
          updateVisuals(getScrollProgress());
          return;
        }

        masterSwapPending = true;
        video.currentTime = targetTime;
      }, delay);
    };

    const updateScene = () => {
      const progress = getScrollProgress();

      if (!autoplayMode && manualControl) {
        manualShowingMaster = false;
        masterSwapPending = false;
      }

      updateVisuals(progress);

      if (
        !autoplayMode &&
        !stagePlaybackActive &&
        Number.isFinite(scrubVideo.duration) &&
        scrubVideo.duration > 0
      ) {
        targetTime = VIDEO_START_TIME + progress * range;
        if (reducedMotion) {
          scrubVideo.currentTime = targetTime;
        } else {
          requestScrubFrame();
        }
        scheduleMasterSwap();
      }
    };

    const syncAutoplay = () => {
      if (!autoplayMode) {
        autoplayFrame = 0;
        return;
      }

      const time = clamp(video.currentTime, VIDEO_START_TIME, VIDEO_END_TIME);
      const progress = (time - VIDEO_START_TIME) / range;
      const sectionTop = window.scrollY + section.getBoundingClientRect().top;
      const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);

      documentRoot.scrollTop = sectionTop + scrollDistance * progress;
      updateVisuals(progress);

      if (video.currentTime >= VIDEO_END_TIME - 0.025) {
        video.pause();
        video.currentTime = VIDEO_END_TIME;
        documentRoot.scrollTop = sectionTop + scrollDistance;
        updateVisuals(1);
        autoplayMode = false;
        documentRoot.style.scrollBehavior = previousScrollBehavior;
        autoplayFrame = 0;
        return;
      }

      autoplayFrame = window.requestAnimationFrame(syncAutoplay);
    };

    const switchToManualControl = () => {
      manualControl = true;
      manualShowingMaster = false;
      stagePlaybackActive = false;
      scrubVideo.pause();
      scrubVideo.playbackRate = 1;

      if (autoplayMode) {
        autoplayMode = false;
        if (autoplayFrame) window.cancelAnimationFrame(autoplayFrame);
        autoplayFrame = 0;
        video.pause();
      }

      if (scrubVideo.readyState >= 1) {
        scrubVideo.currentTime = video.currentTime;
      }
      documentRoot.style.scrollBehavior = previousScrollBehavior;
      updateScene();
    };

    const cancelStageNavigation = () => {
      if (stageNavigationFrame) {
        window.cancelAnimationFrame(stageNavigationFrame);
        stageNavigationFrame = 0;
      }
      stagePlaybackActive = false;
      scrubVideo.pause();
      scrubVideo.playbackRate = 1;
      if (settleTimer) {
        window.clearTimeout(settleTimer);
        settleTimer = 0;
      }
      masterSwapPending = false;
      documentRoot.style.scrollBehavior = previousScrollBehavior;
    };

    const navigateToStage = (scene: number) => {
      const boundedScene = Math.min(Math.max(scene, 0), SCENE_COUNT - 1);
      const sceneTime = Math.min(
        SCENE_START_TIMES[boundedScene] + (boundedScene === 0 ? 0 : NAVIGATION_TIME_OFFSET),
        VIDEO_END_TIME,
      );
      const targetProgress = (sceneTime - VIDEO_START_TIME) / range;
      const startProgress = getScrollProgress();
      const startTime = VIDEO_START_TIME + startProgress * range;
      const sectionTop = window.scrollY + section.getBoundingClientRect().top;
      const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
      const startScrollTop = documentRoot.scrollTop;
      const targetScrollTop = sectionTop + scrollDistance * targetProgress;

      switchToManualControl();
      cancelStageNavigation();

      if (Math.abs(targetScrollTop - startScrollTop) < 1 || reducedMotion) {
        documentRoot.scrollTop = targetScrollTop;
        targetTime = sceneTime;
        scrubVideo.currentTime = sceneTime;
        updateVisuals(targetProgress);
        scheduleMasterSwap(40);
        return;
      }

      const startedAt = performance.now();
      const timeDistance = Math.abs(sceneTime - startTime);
      const transitionDuration = Math.min(
        MAX_SCENE_TRANSITION_DURATION,
        Math.max(
          SCENE_TRANSITION_DURATION,
          (timeDistance / MAX_TRANSITION_PLAYBACK_RATE) * 1000,
        ),
      );
      const movingForward = sceneTime > startTime + 0.02;
      documentRoot.style.scrollBehavior = "auto";
      manualShowingMaster = false;
      targetTime = startTime;
      updateVisuals(startProgress);

      // HAVE_METADATA is enough here: play() will wait for the seeked frame.
      // Requiring HAVE_CURRENT_DATA made a fresh seek fall back to stepped images.
      if (movingForward && scrubVideo.readyState >= 1) {
        stagePlaybackActive = true;
        scrubVideo.currentTime = startTime;
        scrubVideo.playbackRate = clamp(
          timeDistance / (transitionDuration / 1000),
          0.25,
          MAX_TRANSITION_PLAYBACK_RATE,
        );
        void scrubVideo.play().catch(() => {
          stagePlaybackActive = false;
          scrubVideo.pause();
        });
      }

      const animateStage = (now: number) => {
        const elapsed = clamp((now - startedAt) / transitionDuration);
        const frameProgress = startProgress + (targetProgress - startProgress) * elapsed;
        const frameTime = VIDEO_START_TIME + frameProgress * range;

        documentRoot.scrollTop = startScrollTop + (targetScrollTop - startScrollTop) * elapsed;
        targetTime = frameTime;
        if (!stagePlaybackActive && Math.abs(scrubVideo.currentTime - frameTime) >= 0.012) {
          scrubVideo.currentTime = frameTime;
        }
        updateVisuals(frameProgress);

        if (elapsed < 1) {
          stageNavigationFrame = window.requestAnimationFrame(animateStage);
          return;
        }

        stageNavigationFrame = 0;
        stagePlaybackActive = false;
        scrubVideo.pause();
        scrubVideo.playbackRate = 1;
        scrubVideo.currentTime = sceneTime;
        targetTime = sceneTime;
        documentRoot.scrollTop = targetScrollTop;
        updateVisuals(targetProgress);
        scheduleMasterSwap(40);
        wheelGestureLocked = true;
        releaseWheelAfterQuiet();
        window.requestAnimationFrame(() => {
          documentRoot.style.scrollBehavior = previousScrollBehavior;
        });
      };

      stageNavigationFrame = window.requestAnimationFrame(animateStage);
    };

    const handleStageNavigation = (event: Event) => {
      const scene = (event as CustomEvent<number>).detail;
      if (Number.isFinite(scene)) navigateToStage(scene);
    };

    const releaseWheelAfterQuiet = () => {
      if (wheelReleaseTimer) window.clearTimeout(wheelReleaseTimer);
      wheelReleaseTimer = window.setTimeout(() => {
        wheelGestureLocked = false;
        wheelReleaseTimer = 0;
      }, 180);
    };

    const resetWheelIntentAfterQuiet = () => {
      if (wheelIntentTimer) window.clearTimeout(wheelIntentTimer);
      wheelIntentTimer = window.setTimeout(() => {
        wheelDeltaAccumulator = 0;
        wheelIntentTimer = 0;
      }, 320);
    };

    const handleStageWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault();

      if (wheelGestureLocked || stageNavigationFrame) {
        wheelDeltaAccumulator = 0;
        return;
      }

      const deltaMultiplier = event.deltaMode === 1
        ? 16
        : event.deltaMode === 2
          ? window.innerHeight
          : 1;
      const normalizedDelta = event.deltaY * deltaMultiplier;
      if (Math.abs(normalizedDelta) < 0.01) return;

      if (
        wheelDeltaAccumulator !== 0 &&
        Math.sign(wheelDeltaAccumulator) !== Math.sign(normalizedDelta)
      ) {
        wheelDeltaAccumulator = 0;
      }
      wheelDeltaAccumulator += normalizedDelta;
      resetWheelIntentAfterQuiet();
      if (Math.abs(wheelDeltaAccumulator) < 8) return;

      const direction = wheelDeltaAccumulator > 0 ? 1 : -1;
      wheelDeltaAccumulator = 0;
      if (wheelIntentTimer) {
        window.clearTimeout(wheelIntentTimer);
        wheelIntentTimer = 0;
      }
      wheelGestureLocked = true;
      releaseWheelAfterQuiet();
      aboutBadgePendingRef.current = false;
      aboutBadgeShownRef.current = false;
      setAboutBadgeTrigger(null);
      const progress = getScrollProgress();
      const fallbackScene = getSceneIndexForTime(VIDEO_START_TIME + progress * range);
      const fromScene = currentScene >= 0 ? currentScene : fallbackScene;
      navigateToStage(fromScene + direction);
    };

    const handleManualKey = (event: KeyboardEvent) => {
      const forwardKeys = ["ArrowDown", "PageDown", " "];
      const backwardKeys = ["ArrowUp", "PageUp"];
      if (![...forwardKeys, ...backwardKeys, "Home", "End"].includes(event.key)) return;

      event.preventDefault();
      if (stageNavigationFrame) return;
      aboutBadgePendingRef.current = false;
      aboutBadgeShownRef.current = false;
      setAboutBadgeTrigger(null);
      if (event.key === "Home") navigateToStage(0);
      else if (event.key === "End") navigateToStage(SCENE_COUNT - 1);
      else navigateToStage(currentScene + (forwardKeys.includes(event.key) ? 1 : -1));
    };

    const handleStageTouchStart = (event: TouchEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest(".about-work-badge__card")
      ) {
        touchStartY = null;
        return;
      }
      touchStartY = event.touches[0]?.clientY ?? null;
      switchToManualControl();
    };

    const handleStageTouchMove = (event: TouchEvent) => {
      if (touchStartY !== null) event.preventDefault();
    };

    const handleStageTouchEnd = (event: TouchEvent) => {
      if (touchStartY === null || stageNavigationFrame) {
        touchStartY = null;
        return;
      }

      const endY = event.changedTouches[0]?.clientY ?? touchStartY;
      const distance = touchStartY - endY;
      touchStartY = null;
      if (Math.abs(distance) >= 36) {
        aboutBadgePendingRef.current = false;
        aboutBadgeShownRef.current = false;
        setAboutBadgeTrigger(null);
        navigateToStage(currentScene + (distance > 0 ? 1 : -1));
      }
    };

    const handleScroll = () => {
      if (autoplayMode || stageNavigationFrame) return;
      updateScene();
    };

    const handleMetadata = () => {
      video.pause();
      video.currentTime = VIDEO_START_TIME;
      video.playbackRate = 1;
      updateScene();

      if (!reducedMotion) {
        void video.play().then(() => {
          if (!autoplayFrame && autoplayMode) {
            autoplayFrame = window.requestAnimationFrame(syncAutoplay);
          }
        }).catch(() => {
          autoplayMode = false;
          updateScene();
        });
      }
    };

    const handleScrubMetadata = () => {
      scrubVideo.pause();
      scrubVideo.currentTime = VIDEO_START_TIME;
    };

    video.addEventListener("loadedmetadata", handleMetadata);
    video.addEventListener("seeked", handleMasterSeeked);
    scrubVideo.addEventListener("loadedmetadata", handleScrubMetadata);
    scrubVideo.addEventListener("seeked", handleScrubSeeked);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateScene);
    window.addEventListener("wheel", handleStageWheel, { passive: false });
    window.addEventListener("touchstart", handleStageTouchStart, { passive: true });
    window.addEventListener("touchmove", handleStageTouchMove, { passive: false });
    window.addEventListener("touchend", handleStageTouchEnd, { passive: true });
    window.addEventListener("pointerdown", switchToManualControl, { passive: true });
    window.addEventListener("keydown", handleManualKey);
    window.addEventListener("portfolio-stage-navigation", handleStageNavigation);
    if (autoplayMode) documentRoot.style.scrollBehavior = "auto";
    if (video.readyState >= 1) handleMetadata();
    else updateScene();

    return () => {
      video.removeEventListener("loadedmetadata", handleMetadata);
      video.removeEventListener("seeked", handleMasterSeeked);
      scrubVideo.removeEventListener("loadedmetadata", handleScrubMetadata);
      scrubVideo.removeEventListener("seeked", handleScrubSeeked);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScene);
      window.removeEventListener("wheel", handleStageWheel);
      window.removeEventListener("touchstart", handleStageTouchStart);
      window.removeEventListener("touchmove", handleStageTouchMove);
      window.removeEventListener("touchend", handleStageTouchEnd);
      window.removeEventListener("pointerdown", switchToManualControl);
      window.removeEventListener("keydown", handleManualKey);
      window.removeEventListener("portfolio-stage-navigation", handleStageNavigation);
      if (autoplayFrame) window.cancelAnimationFrame(autoplayFrame);
      if (seekFrame) window.cancelAnimationFrame(seekFrame);
      if (stageNavigationFrame) window.cancelAnimationFrame(stageNavigationFrame);
      if (settleTimer) window.clearTimeout(settleTimer);
      if (wheelReleaseTimer) window.clearTimeout(wheelReleaseTimer);
      if (wheelIntentTimer) window.clearTimeout(wheelIntentTimer);
      documentRoot.style.scrollBehavior = previousScrollBehavior;
      video.pause();
      scrubVideo.pause();
    };
  }, [coverState]);

  useEffect(() => {
    if (coverState !== "hidden") return;

    const requestedScene = requestedSceneRef.current;
    if (requestedScene === null) return;
    const scrubVideo = bulletScrubVideoRef.current;
    if (!scrubVideo) return;

    let frame = 0;
    const navigateToRequestedScene = () => {
      frame = window.requestAnimationFrame(() => {
        requestedSceneRef.current = null;

        if (requestedScene === 1) {
          aboutBadgePendingRef.current = true;
          aboutBadgeShownRef.current = false;
          setAboutBadgeTrigger((trigger) => (trigger ?? 0) + 1);
        }

        scrollToScene(requestedScene);

        const url = new URL(window.location.href);
        url.searchParams.delete("scene");
        window.history.replaceState(
          window.history.state,
          "",
          `${url.pathname}${url.search}${url.hash}`,
        );
      });
    };

    if (scrubVideo.readyState >= 1) navigateToRequestedScene();
    else scrubVideo.addEventListener("loadedmetadata", navigateToRequestedScene, { once: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      scrubVideo.removeEventListener("loadedmetadata", navigateToRequestedScene);
    };
  }, [coverState, scrollToScene]);

  return (
    <>
      {coverState !== "hidden" && (
        <section
          className={`entry-cover ${coverState !== "visible" ? "entry-cover--loading" : ""} ${coverState === "leaving" ? "entry-cover--leaving" : ""}`}
          aria-label="作品集封面"
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && coverState === "leaving") {
              setCoverState("hidden");
            }
          }}
        >
          {coverState === "visible" ? (
            <>
              <LiquidRefractionBackground />
              <button
                className="enter-button"
                type="button"
                onClick={enterPortfolio}
                aria-label="进入作品集"
              />
            </>
          ) : (
            <div className="portfolio-loader" role="status" aria-live="polite">
              <div className="portfolio-loader__meta">
                <span>PREPARING PORTFOLIO</span>
                <span>{loadingError ? "LOAD ERROR" : `${loadingProgress}%`}</span>
              </div>
              <div className="portfolio-loader__track" aria-hidden="true">
                <i style={{ transform: `scaleX(${loadingProgress / 100})` }} />
              </div>
              {loadingError ? (
                <button
                  className="portfolio-loader__retry"
                  type="button"
                  onClick={() => {
                    setLoadingError(false);
                    setLoadAttempt((attempt) => attempt + 1);
                  }}
                >
                  RETRY
                </button>
              ) : (
                <p>LOADING 4K FILM · SCROLL PROXY · FINAL FRAME</p>
              )}
            </div>
          )}
        </section>
      )}

      <main
        className="portfolio-home"
        aria-hidden={coverState !== "hidden"}
        inert={coverState !== "hidden"}
      >
        <section
          className="bullet-scroll"
          id="top"
          ref={bulletSectionRef}
          aria-label="滚动探索作品集"
        >
          <div className="bullet-stage">
            <NextImage
              className="bullet-last-frame"
              src={VIDEO_END_FRAME_PATH}
              alt=""
              fill
              priority
              sizes="100vw"
              aria-hidden="true"
            />
            <video
              ref={bulletVideoRef}
              className="bullet-video"
              src={videoAssetUrls?.master}
              poster={VIDEO_POSTER_PATH}
              muted
              playsInline
              preload="auto"
              tabIndex={-1}
              aria-hidden="true"
            />
            <video
              ref={bulletScrubVideoRef}
              className="bullet-scrub-video"
              src={videoAssetUrls?.scrub}
              muted
              playsInline
              preload="auto"
              tabIndex={-1}
              aria-hidden="true"
            />
            <div className="bullet-shade" aria-hidden="true" />
            {activeScene === 1 && aboutBadgeTrigger !== null && (
              <PortfolioLanyard key={aboutBadgeTrigger} />
            )}
            {coverState === "hidden" && activeScene === 2 && <UrbanProjectLinks />}
            {coverState === "hidden" && activeScene === 3 && (
              <ProjectLinks projects={aigcProjects} section="aigc" label="AIGC 作品" />
            )}

            <header className="bullet-nav">
              <nav aria-label="首页章节">
                <button type="button" aria-current={activeScene === 0 ? "page" : undefined} onClick={() => scrollToScene(0)}>INTRO</button>
                <button
                  type="button"
                  aria-current={activeScene === 1 ? "page" : undefined}
                  onClick={() => {
                    aboutBadgePendingRef.current = true;
                    aboutBadgeShownRef.current = false;
                    setAboutBadgeTrigger((trigger) => (trigger ?? 0) + 1);
                    scrollToScene(1);
                  }}
                >
                  ABOUT
                </button>
                <button type="button" aria-current={activeScene === 2 ? "page" : undefined} onClick={() => scrollToScene(2)}>URBAN</button>
                <button type="button" aria-current={activeScene === 3 ? "page" : undefined} onClick={() => scrollToScene(3)}>AIGC</button>
                <button type="button" aria-current={activeScene === 4 ? "page" : undefined} onClick={() => scrollToScene(4)}>CONTACT</button>
              </nav>
            </header>

            <div className="scene-counter" aria-hidden="true">
              <span>{String(activeScene + 1).padStart(2, "0")}</span>
              <i />
              <span>05</span>
            </div>

            <div className="bullet-story">
              {activeScene === 0 && (
                <div className="scene-copy scene-copy--intro">
                  <h1>
                    <span>Hi, I am Zhong.</span>
                    <span>Welcome to my</span>
                    <span>portfolio.</span>
                  </h1>
                </div>
              )}

              <div className="scene-copy scene-copy--about">
                <h1>ABOUT<br />ME</h1>
              </div>

              <div className="scene-copy scene-copy--ucl">
                <h2>URBAN<br />DESIGN</h2>
              </div>

              <div className="scene-copy scene-copy--aigc">
                <h2>AIGC<br />PRACTICE</h2>
              </div>

              <div className="scene-copy scene-copy--contact">
                <h2>CONTACT<br />ME.</h2>
              </div>
            </div>

            <div className="scroll-meter" aria-hidden="true">
              <span />
            </div>
          </div>

          <div className="scene-timeline-track" aria-hidden="true">
            <span className="scene-chapter-marker" />
            <span className="scene-chapter-marker" />
            <span className="scene-chapter-marker" />
            <span className="scene-chapter-marker" />
            <span className="scene-chapter-marker" />
          </div>
        </section>
      </main>
    </>
  );
}
