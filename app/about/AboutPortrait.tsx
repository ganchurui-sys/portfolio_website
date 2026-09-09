"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import styles from "./about.module.css";

const fragments = [
  {
    clipPath: "polygon(40% 19.5%, 59% 19.5%, 64% 24%, 60% 29%, 40% 29%, 36% 24%)",
    depth: 0.55,
    rotation: -7,
    x: -42,
    y: -32,
  },
  {
    clipPath: "polygon(35% 27%, 46% 24.5%, 49% 57%, 38% 59%, 31% 52%, 29% 36%)",
    depth: 1,
    rotation: -12,
    x: -92,
    y: 18,
  },
  {
    clipPath: "polygon(54% 24.5%, 65% 27%, 71% 36%, 69% 52%, 62% 59%, 51% 57%)",
    depth: 0.92,
    rotation: 11,
    x: 88,
    y: 10,
  },
  {
    clipPath: "polygon(39% 27%, 50.5% 26%, 50.5% 58%, 37% 57%, 36% 34%)",
    depth: 0.72,
    rotation: -5,
    x: -48,
    y: 62,
  },
  {
    clipPath: "polygon(49.5% 26%, 61% 27%, 64% 34%, 63% 57%, 49.5% 58%)",
    depth: 0.64,
    rotation: 5,
    x: 46,
    y: 66,
  },
  {
    clipPath: "polygon(36.5% 52%, 63.5% 52%, 62% 59.5%, 38% 59.5%)",
    depth: 1.1,
    rotation: 3,
    x: 18,
    y: 96,
  },
] as const;

type FragmentMotion = {
  opacity: number;
  opacityVelocity: number;
  rotation: number;
  rotationVelocity: number;
  x: number;
  xVelocity: number;
  y: number;
  yVelocity: number;
};

type PointerState = {
  active: boolean;
  x: number;
  y: number;
};

export default function AboutPortrait() {
  const portraitRef = useRef<HTMLDivElement>(null);
  const fragmentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pointer = useRef<PointerState>({ active: false, x: 0, y: 0 });
  const lockedRef = useRef(false);
  const assembly = useRef(0.12);
  const assemblyVelocity = useRef(0);
  const motions = useRef<FragmentMotion[]>(
    fragments.map((fragment) => ({
      opacity: 0.76,
      opacityVelocity: 0,
      rotation: fragment.rotation,
      rotationVelocity: 0,
      x: fragment.x,
      xVelocity: 0,
      y: fragment.y,
      yVelocity: 0,
    })),
  );
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  useEffect(() => {
    const overlay = new Image();
    overlay.src = "/about-portrait-purple.webp";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;

    const animate = () => {
      const currentPointer = pointer.current;
      const targetAssembly = reducedMotion || lockedRef.current
        ? 1
        : currentPointer.active
          ? 0.96
          : 0.12;

      assemblyVelocity.current += (targetAssembly - assembly.current) * 0.055;
      assemblyVelocity.current *= 0.78;
      assembly.current += assemblyVelocity.current;

      const amount = Math.max(0, Math.min(1, assembly.current));

      motions.current.forEach((motion, index) => {
        const fragment = fragments[index];
        const parallaxX = currentPointer.active ? currentPointer.x * fragment.depth * 12 : 0;
        const parallaxY = currentPointer.active ? currentPointer.y * fragment.depth * 8 : 0;
        const targetX = reducedMotion ? 0 : fragment.x * (1 - amount) + parallaxX * amount;
        const targetY = reducedMotion ? 0 : fragment.y * (1 - amount) + parallaxY * amount;
        const targetRotation = reducedMotion
          ? 0
          : fragment.rotation * (1 - amount) + currentPointer.x * fragment.depth * 1.8 * amount;
        const targetOpacity = 0.72 + amount * 0.28;
        const spring = 0.075 + index * 0.004;

        motion.xVelocity += (targetX - motion.x) * spring;
        motion.xVelocity *= 0.76;
        motion.x += motion.xVelocity;
        motion.yVelocity += (targetY - motion.y) * spring;
        motion.yVelocity *= 0.76;
        motion.y += motion.yVelocity;
        motion.rotationVelocity += (targetRotation - motion.rotation) * spring;
        motion.rotationVelocity *= 0.75;
        motion.rotation += motion.rotationVelocity;
        motion.opacityVelocity += (targetOpacity - motion.opacity) * 0.09;
        motion.opacityVelocity *= 0.74;
        motion.opacity += motion.opacityVelocity;

        const element = fragmentRefs.current[index];
        if (!element) return;

        element.style.transform = `translate3d(${motion.x.toFixed(2)}px, ${motion.y.toFixed(2)}px, ${(
          fragment.depth * 18 * amount
        ).toFixed(2)}px) rotate(${motion.rotation.toFixed(2)}deg)`;
        element.style.opacity = motion.opacity.toFixed(3);
        element.style.filter = amount < 0.82
          ? "drop-shadow(0 16px 12px rgba(18, 18, 16, .17))"
          : "drop-shadow(0 4px 4px rgba(18, 18, 16, .06))";
      });

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      overlay.src = "";
    };
  }, []);

  const updatePointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = portraitRef.current?.getBoundingClientRect();
    if (!bounds) return;

    pointer.current.active = true;
    pointer.current.x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
    pointer.current.y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
  };

  const toggleLock = () => {
    setLocked((current) => !current);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleLock();
  };

  return (
    <figure className={styles.portraitFigure}>
      <div
        ref={portraitRef}
        className={styles.portrait}
        role="button"
        tabIndex={0}
        aria-pressed={locked}
        aria-label={`服装组件当前${locked ? "已锁定" : "未锁定"}。移动指针聚合服装，点击锁定。`}
        onClick={toggleLock}
        onKeyDown={handleKeyDown}
        onPointerEnter={updatePointer}
        onPointerMove={updatePointer}
        onPointerLeave={() => {
          pointer.current.active = false;
          pointer.current.x = 0;
          pointer.current.y = 0;
        }}
      >
        <div
          className={styles.portraitBase}
          style={{ backgroundImage: 'url("/about-portrait-brown.webp")' }}
          aria-hidden="true"
        />

        <div className={styles.fragmentLayer} aria-hidden="true">
          {fragments.map((fragment, index) => (
            <div
              key={fragment.clipPath}
              ref={(element) => {
                fragmentRefs.current[index] = element;
              }}
              className={styles.outfitFragment}
              style={{
                backgroundImage: 'url("/about-portrait-purple.webp")',
                clipPath: fragment.clipPath,
              }}
            />
          ))}
        </div>

        <span className={styles.portraitCursorLabel}>{locked ? "LOCKED" : "MOVE"}</span>
      </div>

      <figcaption className={styles.portraitCaption} aria-live="polite">
        <span>OUTFIT SHELL / 01</span>
        <span>{locked ? "CLICK TO RELEASE" : "TAP TO LOCK"}</span>
      </figcaption>
    </figure>
  );
}
