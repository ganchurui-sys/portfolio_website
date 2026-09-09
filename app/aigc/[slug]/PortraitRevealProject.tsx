"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./portrait-reveal.module.css";

// Adapted from the MIT-licensed WebGL transition by m1ckc3s/ripple.
const portraits = [
  { src: "/aigc/project-01/portrait-01.png", alt: "Zhong 的蓝色格纹衬衫人物形象", scale: 1.04, offsetX: 0, offsetY: 0.006 },
  { src: "/aigc/project-01/portrait-02.png", alt: "Zhong 的紫色赛车外套人物形象", scale: 1.12, offsetX: -0.005, offsetY: -0.013 },
  { src: "/aigc/project-01/portrait-03.png", alt: "Zhong 的牛仔外套领带人物形象", scale: 0.94, offsetX: 0, offsetY: 0.002 },
  { src: "/aigc/project-01/portrait-04.png", alt: "Zhong 的黑色连帽外套人物形象", scale: 0.97, offsetX: -0.002, offsetY: -0.006 },
  { src: "/aigc/project-01/portrait-05.png", alt: "Zhong 的帽子耳机人物形象", scale: 1.06, offsetX: 0, offsetY: 0.006 },
] as const;

const VERTEX_SHADER = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D u_texA;
uniform sampler2D u_texB;
uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_progress;
uniform float u_sigma;
uniform float u_waveFreq;
uniform float u_pushAmt;
uniform float u_caStrength;
uniform float u_glow;
uniform float u_noiseWarp;
uniform float u_pinch;

varying vec2 v_uv;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * vnoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = v_uv;
  vec2 point = uv - u_center;
  float aspect = u_resolution.x / u_resolution.y;
  point.x *= aspect;

  float distanceToCenter = length(point);
  float maxDistance = length(vec2(0.5 * aspect, 0.5));
  float normalDistance = clamp(distanceToCenter / maxDistance, 0.0, 1.0);

  float noiseLarge = fbm(point * 4.0 + vec2(u_progress, u_progress * 0.5), 4);
  float noiseSmall = fbm(point * 12.0 + vec2(u_progress * 2.0, -u_progress * 1.5), 3);
  float waveFront = u_progress * 1.6;
  float warpScale = smoothstep(0.0, 0.05, u_progress);
  float warpedDistance = normalDistance
    + (noiseLarge - 0.5) * u_noiseWarp * warpScale
    + (noiseSmall - 0.5) * u_noiseWarp * 0.9 * warpScale;

  float delta = warpedDistance - waveFront;
  float envelope = exp(-delta * delta / (2.0 * u_sigma * u_sigma));
  envelope *= max(0.0, cos(delta * u_waveFreq));
  envelope *= smoothstep(0.0, 0.05, u_progress)
    * (1.0 - smoothstep(0.85, 1.0, u_progress));

  vec2 direction = distanceToCenter > 0.001 ? normalize(point) : vec2(0.0);
  float pinchSigma = 0.10;
  float pinchGaussian = exp(-distanceToCenter * distanceToCenter / (2.0 * pinchSigma * pinchSigma));
  float pinch = (distanceToCenter / (pinchSigma * pinchSigma)) * pinchGaussian * 0.01 * u_pinch;
  vec2 edge = min(uv, 1.0 - uv);
  pinch *= smoothstep(0.0, 0.14, min(edge.x, edge.y));

  vec2 offset = direction * (envelope * u_pushAmt - pinch);
  offset.x /= aspect;
  vec2 colorOffset = direction * (envelope * u_caStrength);
  colorOffset.x /= aspect;

  vec2 uvR = uv - offset - colorOffset;
  vec2 uvG = uv - offset;
  vec2 uvB = uv - offset + colorOffset;
  vec4 source = vec4(texture2D(u_texA, uvR).r, texture2D(u_texA, uvG).g, texture2D(u_texA, uvB).b, 1.0);
  vec4 target = vec4(texture2D(u_texB, uvR).r, texture2D(u_texB, uvG).g, texture2D(u_texB, uvB).b, 1.0);

  float feather = 0.04 + 0.05 * noiseLarge;
  float reveal = smoothstep(waveFront + feather, waveFront - feather, warpedDistance);
  reveal *= smoothstep(0.0, 0.05, u_progress);
  vec4 color = mix(source, target, reveal);

  float glow = envelope * u_glow;
  color.rgb = clamp(color.rgb / max(1.0 - glow, 0.01), 0.0, 1.0);
  color.rgb *= 1.0 - 0.16 * pinchGaussian * u_pinch;
  gl_FragColor = vec4(clamp(color.rgb, 0.0, 1.0), 1.0);
}
`;

type Point = { x: number; y: number };
type Portrait = (typeof portraits)[number];
type Uniforms = Record<string, WebGLUniformLocation | null>;
type Renderer = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  textures: [WebGLTexture, WebGLTexture];
  uniforms: Uniforms;
  images: HTMLImageElement[];
};

const transitionDuration = 1280;
const nextPortrait = (index: number) => (index + 1) % portraits.length;

function compileShader(gl: WebGLRenderingContext, source: string, type: number) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create WebGL shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Shader compilation failed.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${source}`));
    image.src = source;
  });
}

function drawPortraitCanvas(image: HTMLImageElement, portrait: Portrait, width: number, height: number) {
  const source = document.createElement("canvas");
  source.width = width;
  source.height = height;
  const context = source.getContext("2d");
  if (!context) return source;

  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight) * portrait.scale;
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(
    image,
    (width - drawWidth) / 2 + width * portrait.offsetX,
    (height - drawHeight) / 2 + height * portrait.offsetY,
    drawWidth,
    drawHeight,
  );
  return source;
}

function easeInOutQuad(value: number) {
  return value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2;
}

export default function PortraitRevealProject() {
  const [baseIndex, setBaseIndex] = useState(0);
  const stageRef = useRef<HTMLButtonElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const baseIndexRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  const activeTransitionRef = useRef<{ origin: Point; targetIndex: number; start: number } | null>(null);
  const drawAnimationFrameRef = useRef<(timestamp: number) => void>(() => {});

  const uploadPortraitPair = useCallback((base: number, target: number) => {
    const renderer = rendererRef.current;
    const canvas = canvasRef.current;
    if (!renderer || !canvas) return;
    const { gl, textures, images } = renderer;

    [base, target].forEach((portraitIndex, textureIndex) => {
      const normalized = drawPortraitCanvas(
        images[portraitIndex],
        portraits[portraitIndex],
        canvas.width,
        canvas.height,
      );
      gl.activeTexture(gl.TEXTURE0 + textureIndex);
      gl.bindTexture(gl.TEXTURE_2D, textures[textureIndex]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, normalized);
    });
  }, []);

  const render = useCallback((progress: number, origin: Point, pinch: number) => {
    const renderer = rendererRef.current;
    const canvas = canvasRef.current;
    if (!renderer || !canvas) return;
    const { gl, uniforms } = renderer;
    const width = canvas.width;
    const height = canvas.height;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uniforms.u_resolution, width, height);
    gl.uniform2f(uniforms.u_center, origin.x / width, origin.y / height);
    gl.uniform1f(uniforms.u_progress, progress);
    gl.uniform1f(uniforms.u_sigma, 0.115);
    gl.uniform1f(uniforms.u_waveFreq, 3.6);
    gl.uniform1f(uniforms.u_pushAmt, 0.065);
    gl.uniform1f(uniforms.u_caStrength, 0.006);
    gl.uniform1f(uniforms.u_glow, 0.18);
    gl.uniform1f(uniforms.u_noiseWarp, 0.42);
    gl.uniform1f(uniforms.u_pinch, pinch);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, []);

  const drawAnimationFrame = useCallback((timestamp: number) => {
    const transition = activeTransitionRef.current;
    if (!transition) return;
    const rawProgress = Math.min(1, (timestamp - transition.start) / transitionDuration);
    const progress = easeInOutQuad(rawProgress);
    const pinch = rawProgress < 0.1
      ? easeInOutQuad(rawProgress / 0.1) * 0.12
      : rawProgress < 0.5
        ? (1 - (rawProgress - 0.1) / 0.4) * 0.12
        : 0;
    render(progress, transition.origin, pinch);

    if (rawProgress < 1) {
      animationFrameRef.current = requestAnimationFrame((nextTimestamp) => {
        drawAnimationFrameRef.current(nextTimestamp);
      });
      return;
    }

    baseIndexRef.current = transition.targetIndex;
    setBaseIndex(transition.targetIndex);
    uploadPortraitPair(transition.targetIndex, nextPortrait(transition.targetIndex));
    render(0, transition.origin, 0);
    activeTransitionRef.current = null;
    isAnimatingRef.current = false;
  }, [render, uploadPortraitPair]);

  useEffect(() => {
    drawAnimationFrameRef.current = drawAnimationFrame;
  }, [drawAnimationFrame]);

  const trigger = useCallback((origin: Point) => {
    if (!rendererRef.current || isAnimatingRef.current) return;
    const targetIndex = nextPortrait(baseIndexRef.current);
    uploadPortraitPair(baseIndexRef.current, targetIndex);
    activeTransitionRef.current = { origin, targetIndex, start: performance.now() };
    isAnimatingRef.current = true;
    animationFrameRef.current = requestAnimationFrame((timestamp) => {
      drawAnimationFrameRef.current(timestamp);
    });
  }, [uploadPortraitPair]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    let disposed = false;
    let observer: ResizeObserver | null = null;

    const setup = async () => {
      try {
        const images = await Promise.all(portraits.map((portrait) => loadImage(portrait.src)));
        if (disposed) return;
        const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
        if (!gl) return;

        const vertex = compileShader(gl, VERTEX_SHADER, gl.VERTEX_SHADER);
        const fragment = compileShader(gl, FRAGMENT_SHADER, gl.FRAGMENT_SHADER);
        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "WebGL linking failed.");
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        const textureA = gl.createTexture();
        const textureB = gl.createTexture();
        if (!buffer || !textureA || !textureB) return;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, "a_pos");
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

        [textureA, textureB].forEach((texture, index) => {
          gl.activeTexture(gl.TEXTURE0 + index);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        });
        gl.uniform1i(gl.getUniformLocation(program, "u_texA"), 0);
        gl.uniform1i(gl.getUniformLocation(program, "u_texB"), 1);

        rendererRef.current = {
          gl,
          program,
          buffer,
          textures: [textureA, textureB],
          images,
          uniforms: Object.fromEntries(
            ["u_resolution", "u_center", "u_progress", "u_sigma", "u_waveFreq", "u_pushAmt", "u_caStrength", "u_glow", "u_noiseWarp", "u_pinch"]
              .map((name) => [name, gl.getUniformLocation(program, name)]),
          ),
        };

        const resize = () => {
          const rect = stage.getBoundingClientRect();
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = Math.round(rect.width * dpr);
          canvas.height = Math.round(rect.height * dpr);
          uploadPortraitPair(baseIndexRef.current, nextPortrait(baseIndexRef.current));
          render(0, { x: canvas.width / 2, y: canvas.height / 2 }, 0);
        };
        resize();
        observer = new ResizeObserver(resize);
        observer.observe(stage);
      } catch {
        // The DOM image layer remains as a readable fallback if WebGL is unavailable.
      }
    };

    void setup();
    return () => {
      disposed = true;
      observer?.disconnect();
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      const renderer = rendererRef.current;
      if (!renderer) return;
      const { gl, program, buffer, textures } = renderer;
      gl.deleteTexture(textures[0]);
      gl.deleteTexture(textures[1]);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      rendererRef.current = null;
    };
  }, [render, uploadPortraitPair]);

  const pointFromEvent = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    const canvas = canvasRef.current;
    if (!rect || !canvas) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  return (
    <button
      type="button"
      ref={stageRef}
      className={styles.experience}
      aria-label="AIGC Project 01 人物形象交互，点击以波纹切换下一形象"
      onPointerDown={(event) => {
        const point = pointFromEvent(event.clientX, event.clientY);
        if (point) trigger(point);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const canvas = canvasRef.current;
          if (canvas) trigger({ x: canvas.width / 2, y: canvas.height / 2 });
        }
      }}
    >
      <div className={styles.imageStack} aria-live="polite">
        {portraits.map((portrait, index) => (
          <div
            key={portrait.src}
            className={styles.portraitFrame}
            data-active={index === baseIndex}
            style={{
              "--portrait-scale": portrait.scale,
              "--portrait-x": `${portrait.offsetX * 100}%`,
              "--portrait-y": `${portrait.offsetY * 100}%`,
            } as React.CSSProperties}
          >
            <Image
              className={styles.portrait}
              src={portrait.src}
              alt={index === baseIndex ? portrait.alt : ""}
              fill
              sizes="100vw"
              loading="eager"
              draggable={false}
            />
          </div>
        ))}
      </div>

      <canvas ref={canvasRef} className={styles.revealCanvas} aria-hidden="true" />

      <div className={styles.projectLabel} aria-hidden="true">
        <span>AIGC / PROJECT 01</span>
        <span>INTERACTIVE IDENTITY</span>
      </div>
      <p className={styles.instruction}>CLICK TO SHIFT</p>
      <p className={styles.counter} aria-label={`当前形象 ${baseIndex + 1}，共 ${portraits.length} 个形象`}>
        {String(baseIndex + 1).padStart(2, "0")}
        <span>/</span>
        {String(portraits.length).padStart(2, "0")}
      </p>
    </button>
  );
}
