// Use the ten-second 5406 source with only its pronounced frown removed.
// The existing edit cuts original frames 84–137 and blends four join frames;
// see scripts/prepare-portrait-gentle-motion.mjs. All other motion stays native.
export const PORTRAIT_FRAME_RATE = 24;
export const PORTRAIT_FRAME_COUNT = 182;
export const PORTRAIT_LAST_FRAME = (PORTRAIT_FRAME_COUNT - 1) / PORTRAIT_FRAME_RATE;
export const PORTRAIT_TRANSITION_SECONDS = 1;
export const PORTRAIT_CLIP_FRAME_RATE = 60;
export const PORTRAIT_CLIP_LAST_TIME = 59 / 60;
const MIN_PLAYBACK_RATE = 1 / 16;
// Distinct held poses: lowered-head stare, relaxed raised-head gaze, wink, side glance.
// The first two poses use the uninterrupted opening head-raise, before the wink.
// Original stops 0, 72, 156, 228 → edited stops 0, 72, 98, 170.
export const PORTRAIT_STOPS = [0, 72 / 24, 98 / 24, 170 / 24] as const;
export const PORTRAIT_FORWARD_SRC = "/about-motion-v2/base-forward.mp4";
export const PORTRAIT_BACKWARD_SRC = "/about-motion-v2/base-reverse.mp4";
export const PORTRAIT_POSTER_SRC = "/about-motion-v2/poster.jpg";
export const portraitClipSource = (from: number, to: number) => {
  // This pair spans the removed frown. Rebuild it from clean source frames with
  // an aligned motion bridge, not the old double-exposed dissolve. Version the
  // URL so a prefetched v2 clip cannot mask the correction. Other routes stay put.
  const version = (from === 1 && to === 2) || (from === 2 && to === 1) ? "v3" : "v2";
  return `/about-motion-${version}/${from + 1}-${to + 1}.mp4`;
};

export function planPortraitTransition(start: number, section: number) {
  const target = PORTRAIT_STOPS[section];
  // Never jump to the destination's approach: play continuously from the visible
  // pose, even across multiple modules. Only the asset removes the deep frown;
  // the player never jumps over remaining motion to reach the next pose.
  return {
    start,
    target,
    backward: target < start,
  };
}

export const JOIN_CENTER = 82 / PORTRAIT_FRAME_RATE;
export const JOIN_RADIUS = 4 / PORTRAIT_FRAME_RATE;
export const PORTRAIT_EDGE_SOFTNESS = 0.28;
export const PORTRAIT_JOIN_SOFTNESS = 0.4;

// Smoothly allocate a little more playback time around the existing edit. The
// integral lets us compensate elsewhere without changing the one-second total.
export const joinIntegral = (time: number) => {
  const x = Math.min(JOIN_RADIUS, Math.max(-JOIN_RADIUS, time - JOIN_CENTER));
  return (x + JOIN_RADIUS) / 2 + JOIN_RADIUS * Math.sin(Math.PI * x / JOIN_RADIUS) / (2 * Math.PI);
};

export function portraitPlaybackRate(start: number, target: number, current: number) {
  const distance = Math.abs(target - start);
  if (distance < 1 / PORTRAIT_FRAME_RATE) return 1;

  const base = distance / PORTRAIT_TRANSITION_SECONDS;
  // Near an interrupted destination, reduce easing rather than requesting an
  // unsupported slow playback rate. Normal module changes use full softness.
  const headroom = Math.max(0, base / MIN_PLAYBACK_RATE - 1);
  const edgeSoftness = Math.min(PORTRAIT_EDGE_SOFTNESS, headroom);
  const joinSoftness = Math.min(PORTRAIT_JOIN_SOFTNESS, Math.max(0, headroom - edgeSoftness));
  const progress = Math.min(1, Math.max(0, Math.abs(current - start) / distance));
  const joinPosition = (current - JOIN_CENTER) / JOIN_RADIUS;
  const joinWeight = Math.abs(joinPosition) < 1 ? (1 + Math.cos(Math.PI * joinPosition)) / 2 : 0;
  const joinArea = Math.abs(joinIntegral(target) - joinIntegral(start));
  const averageWeight = 1 + joinSoftness * joinArea / distance;
  const weight = 1 + edgeSoftness * Math.cos(2 * Math.PI * progress) + joinSoftness * joinWeight;

  // Integral of dt = source distance / rate is exactly one second. This shapes
  // decoded video playback, never seeks through frames or blends held images.
  return Math.max(MIN_PLAYBACK_RATE, base * averageWeight / weight);
}

// The same easing baked into the short clips. Only evaluated on an interrupted
// click to recover its visible source pose, never in the browser's render loop.
export function portraitPlaybackProgress(start: number, target: number, current: number) {
  const distance = Math.abs(target - start);
  if (!distance) return 1;
  const p = Math.min(1, Math.max(0, (current - start) / (target - start)));
  const area = distance * p + PORTRAIT_EDGE_SOFTNESS * distance * Math.sin(2 * Math.PI * p) / (2 * Math.PI)
    + PORTRAIT_JOIN_SOFTNESS * Math.abs(joinIntegral(current) - joinIntegral(start));
  return area / (distance + PORTRAIT_JOIN_SOFTNESS * Math.abs(joinIntegral(target) - joinIntegral(start)));
}

export function portraitSourceTimeForProgress(start: number, target: number, progress: number) {
  if (progress <= 0) return start;
  if (progress >= 1) return target;
  let low = 0, high = 1;
  for (let i = 0; i < 24; i++) {
    const middle = (low + high) / 2;
    const source = start + (target - start) * middle;
    if (portraitPlaybackProgress(start, target, source) < progress) low = middle;
    else high = middle;
  }
  return start + (target - start) * (low + high) / 2;
}

type MotionOptions = {
  forward: HTMLVideoElement;
  backward: HTMLVideoElement;
  reducedMotion: () => boolean;
  onSelect: (section: number) => void;
  onError: () => void;
};

export function createPortraitMotion({
  forward,
  backward,
  reducedMotion,
  onSelect,
  onError,
}: MotionOptions) {
  let visible: HTMLVideoElement | null = null;
  type Media = { backward: boolean; clip?: { from: number; to: number } };
  const media = new Map<HTMLVideoElement, Media>([[forward, { backward: false }], [backward, { backward: true }]]);
  let revision = 0;
  let frame = 0;
  let disposed = false;
  let clearPreparation = () => {};
  let clearPlayback = () => {};

  const sourceTime = () => {
    if (!visible) return PORTRAIT_STOPS[0];
    const descriptor = media.get(visible)!;
    if (descriptor.clip) {
      const { from, to } = descriptor.clip;
      return portraitSourceTimeForProgress(PORTRAIT_STOPS[from], PORTRAIT_STOPS[to], visible.currentTime / PORTRAIT_CLIP_LAST_TIME);
    }
    return descriptor.backward ? PORTRAIT_LAST_FRAME - visible.currentTime : visible.currentTime;
  };

  const cancel = () => {
    revision += 1;
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    clearPreparation();
    clearPreparation = () => {};
    clearPlayback();
    clearPlayback = () => {};
    forward.pause();
    backward.pause();
    // Keep the latest frame visible while preparing playback in the other buffer.
    for (const video of [forward, backward]) {
      video.style.transition = "none";
      video.style.opacity = video === visible ? "1" : "0";
      video.style.zIndex = video === visible ? "2" : "1";
    }
  };

  // Keep the previous frame visible until the other video has decoded its seek.
  const prepareFrame = (
    video: HTMLVideoElement,
    time: number,
    token: number,
    ready: () => void,
  ) => {
    clearPreparation();
    let sought = false;
    let completed = false;

    const cleanup = () => {
      video.removeEventListener("loadedmetadata", prepare);
      video.removeEventListener("loadeddata", prepare);
      video.removeEventListener("seeked", prepare);
      video.removeEventListener("error", fail);
    };
    const fail = () => {
      cleanup();
      if (!disposed && token === revision) onError();
    };
    const prepare = () => {
      if (disposed || token !== revision || completed) return;
      if (video.error) {
        fail();
        return;
      }
      if (video.readyState < 1) return;

      if (!sought) {
        sought = true;
        if (Math.abs(video.currentTime - time) > 0.001) {
          video.currentTime = time;
          return;
        }
      }
      if (video.seeking || video.readyState < 2) return;

      completed = true;
      cleanup();
      ready();
    };

    clearPreparation = cleanup;
    video.addEventListener("loadedmetadata", prepare);
    video.addEventListener("loadeddata", prepare);
    video.addEventListener("seeked", prepare);
    video.addEventListener("error", fail);
    prepare();
  };

  const reveal = (video: HTMLVideoElement) => {
    for (const buffer of [forward, backward]) {
      buffer.style.zIndex = buffer === video ? "2" : "1";
      buffer.style.transition = "none";
      buffer.style.opacity = buffer === video ? "1" : "0";
    }
    visible = video;
  };

  const select = (section: number, animate = true) => {
    if (disposed || !Number.isInteger(section) || !Number.isFinite(PORTRAIT_STOPS[section])) return;

    const start = Math.min(Math.max(sourceTime(), 0), PORTRAIT_LAST_FRAME);
    const plan = planPortraitTransition(start, section);
    const distance = Math.abs(plan.target - plan.start);
    const from = PORTRAIT_STOPS.findIndex(time => Math.abs(time - start) < 0.001);
    const useClip = animate && !reducedMotion() && from >= 0 && from !== section;
    cancel();
    onSelect(section);
    const token = revision;

    // Prepare the identical current pose in the hidden buffer before changing direction.
    // Either buffer can load either direction, including consecutive reverse moves.
    const video = visible === forward ? backward : forward;
    const src = useClip ? portraitClipSource(from, section)
      : plan.backward ? PORTRAIT_BACKWARD_SRC : PORTRAIT_FORWARD_SRC;
    if (video.getAttribute("src") !== src) {
      video.src = src;
      video.load();
    }
    media.set(video, { backward: plan.backward, clip: useClip ? { from, to: section } : undefined });
    const mediaTime = (time: number) => plan.backward ? PORTRAIT_LAST_FRAME - time : time;
    const end = useClip ? PORTRAIT_CLIP_LAST_TIME : mediaTime(plan.target);
    const settle = () => {
      video.pause();
      video.playbackRate = 1;
      prepareFrame(video, end, token, () => reveal(video));
    };

    // Treat a nearly reached pose as settled rather than asking the browser for
    // an unsupported sub-minimum rate after a very late repeated click.
    const minimumDistance = Math.max(1 / PORTRAIT_FRAME_RATE, MIN_PLAYBACK_RATE * PORTRAIT_TRANSITION_SECONDS);
    if (!animate || reducedMotion() || distance < minimumDistance) {
      settle();
      return;
    }

    prepareFrame(video, useClip ? 0 : mediaTime(plan.start), token, () => {
      reveal(video);
      // Regular routes are pre-rendered 60fps, one-second clips. Native 1x
      // playback avoids repeated ratechange events and high-speed decoding.
      // Only an interrupted route uses the source video, at one constant rate.
      video.playbackRate = useClip ? 1 : distance / PORTRAIT_TRANSITION_SECONDS;

      if (useClip) {
        const ended = () => {
          if (disposed || token !== revision) return;
          clearPlayback();
          clearPlayback = () => {};
          video.pause();
          // The clip's last frame already is the exact held expression. Do not
          // seek backwards after ending: that would flash a frame at each stop.
        };
        const failed = () => {
          if (disposed || token !== revision) return;
          ended();
          onError();
        };
        video.addEventListener("ended", ended);
        video.addEventListener("error", failed);
        clearPlayback = () => {
          video.removeEventListener("ended", ended);
          video.removeEventListener("error", failed);
        };
      }

      const tick = () => {
        if (disposed || token !== revision) return;
        if (video.error) {
          video.pause();
          onError();
          return;
        }
        if (video.ended || video.currentTime >= end - 0.001) {
          frame = 0;
          settle();
          return;
        }
        // Follow decoded playback, so buffering never skips the transition.
        frame = window.requestAnimationFrame(tick);
      };

      if (!useClip) frame = window.requestAnimationFrame(tick);
      void video.play().catch(() => {
        if (disposed || token !== revision) return;
        clearPlayback();
        clearPlayback = () => {};
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        settle();
      });
    });
  };

  return {
    select,
    dispose() {
      disposed = true;
      cancel();
    },
  };
}
