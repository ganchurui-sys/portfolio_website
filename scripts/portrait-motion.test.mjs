import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  createPortraitMotion,
  planPortraitTransition,
  portraitPlaybackRate,
  portraitClipSource,
  portraitSourceTimeForProgress,
  PORTRAIT_CLIP_LAST_TIME,
  PORTRAIT_BACKWARD_SRC,
  PORTRAIT_FORWARD_SRC,
  PORTRAIT_FRAME_COUNT,
  PORTRAIT_LAST_FRAME,
  PORTRAIT_STOPS,
  PORTRAIT_TRANSITION_SECONDS,
} from "../app/about/portrait-motion.ts";

const flush = () => new Promise(resolve => setImmediate(resolve));
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.0001);

class Video extends EventTarget {
  readyState = 2;
  seeking = false;
  error = null;
  ended = false;
  style = {};
  rate = 1;
  rateWrites = 0;
  get playbackRate() { return this.rate; }
  set playbackRate(value) { this.rate = value; this.rateWrites++; }
  plays = 0;
  paused = true;
  time = 0;
  seeks = [];

  constructor(src) { super(); this.src = src; }
  getAttribute(name) { return name === "src" ? this.src : null; }
  get currentTime() { return this.time; }
  set currentTime(time) {
    this.ended = false;
    this.seeks.push({ time, opacity: this.style.opacity });
    this.time = time;
    this.seeking = true;
    queueMicrotask(() => {
      this.seeking = false;
      this.dispatchEvent(new Event("seeked"));
    });
  }
  load() {
    this.ended = false;
    this.readyState = 0;
    this.time = 0;
    queueMicrotask(() => {
      this.readyState = 2;
      this.dispatchEvent(new Event("loadedmetadata"));
      this.dispatchEvent(new Event("loadeddata"));
    });
  }
  pause() { this.paused = true; }
  play() { this.plays++; this.paused = false; return Promise.resolve(); }
}

test("every route plays continuously from the current pose without jumping", () => {
  assert.equal(PORTRAIT_TRANSITION_SECONDS, 1);
  // Native 5406 poses: lowered head, raised head, wink and side glance.
  assert.deepEqual(PORTRAIT_STOPS.map(time => Math.round(time * 24)), [0, 72, 98, 170]);
  for (const start of [...PORTRAIT_STOPS, 0.125, 0.65, 1.5]) {
    PORTRAIT_STOPS.forEach((target, index) => {
      const plan = planPortraitTransition(start, index);
      assert.equal(plan.start, start);
      assert.equal(plan.target, target);
      assert.equal(plan.backward, target < start);
    });
  }
  for (const start of [PORTRAIT_STOPS[0], PORTRAIT_STOPS[1]]) {
    const plan = planPortraitTransition(start, 2);
    assert.equal(plan.backward, PORTRAIT_STOPS[2] < start);
    assert.equal(plan.target, PORTRAIT_STOPS[2]);
    assert.equal(plan.start, start, "third module must not jump to its last 1.25 seconds");
  }
});

test("both directions use the ten-second source with the deep frown cut out", () => {
  assert.equal(PORTRAIT_FORWARD_SRC, "/about-motion-v2/base-forward.mp4");
  assert.equal(PORTRAIT_BACKWARD_SRC, "/about-motion-v2/base-reverse.mp4");
  assert.equal(PORTRAIT_FRAME_COUNT, 240 - (138 - 84) - 4);
  const asset = src => fileURLToPath(new URL(`../public${src}`, import.meta.url));
  for (const src of [PORTRAIT_FORWARD_SRC, PORTRAIT_BACKWARD_SRC]) {
    const { streams: [video] } = JSON.parse(execFileSync("ffprobe", [
      "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,nb_frames,avg_frame_rate",
      "-of", "json", asset(src),
    ], { encoding: "utf8" }));
    assert.equal(Number(video.nb_frames), PORTRAIT_FRAME_COUNT);
    assert.equal(video.avg_frame_rate, "24/1");
    assert.equal(video.width, 1112);
    assert.equal(video.height, 834);
  }
  assert.ok(PORTRAIT_STOPS.every(time => time >= 0 && time <= PORTRAIT_LAST_FRAME));
});

test("all four held expressions still match the original ten-second video", () => {
  const lift = "if(lte(val,224.4),val,if(lt(val,234.6),224.4+3*(val-224.4),255))";
  const frames = (src, stops, whiten = false) => execFileSync("ffmpeg", [
    "-v", "error", "-i", fileURLToPath(new URL(`../public${src}`, import.meta.url)),
    "-vf", `select='${stops.map(frame => `eq(n,${frame})`).join("+")}',${whiten ? `lutrgb=r='${lift}':g='${lift}':b='${lift}',` : ""}scale=160:120,format=gray`,
    "-fps_mode", "vfr", "-frames:v", "4", "-f", "rawvideo", "pipe:1",
  ]);
  const original = frames("/about-portrait-expressions-5406.mp4", [0, 72, 156, 228], true);
  const edited = frames(PORTRAIT_FORWARD_SRC, PORTRAIT_STOPS.map(time => Math.round(time * 24)));
  const pixelsPerFrame = 160 * 120;
  assert.equal(original.length, 4 * pixelsPerFrame);
  assert.equal(edited.length, original.length);
  for (let frame = 0; frame < 4; frame++) {
    let difference = 0;
    for (let pixel = frame * pixelsPerFrame; pixel < (frame + 1) * pixelsPerFrame; pixel++) {
      difference += Math.abs(original[pixel] - edited[pixel]);
    }
    assert.ok(difference / pixelsPerFrame < 2, `module ${frame + 1} must retain the same expression`);
  }
});

test("the viewer does not load or switch to the supplied original portraits", () => {
  const component = readFileSync(new URL("../app/about/AboutExperience.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(component, /PORTRAIT_STILLS|portraitStill|4k\.webp|stillSection/);
  assert.match(component, /PORTRAIT_POSTER_SRC/);
  assert.doesNotMatch(component, /feComponentTransfer|whiteBackgroundCurve/);
  const css = readFileSync(new URL("../app/about/about.module.css", import.meta.url), "utf8");
  assert.doesNotMatch(css, /about-portrait-white-background/);
});

test("softened forward/reverse transitions still take exactly one second", () => {
  const starts = [...PORTRAIT_STOPS, 0.75, 3.4, PORTRAIT_STOPS[1] - 0.08];
  for (const start of starts) {
    for (const target of PORTRAIT_STOPS) {
      const distance = Math.abs(target - start);
      if (distance < 1 / 16) continue;
      let duration = 0;
      let previousRate = portraitPlaybackRate(start, target, start);
      const samples = 12000;
      for (let sample = 0; sample < samples; sample++) {
        const time = start + (target - start) * (sample + 0.5) / samples;
        const rate = portraitPlaybackRate(start, target, time);
        assert.ok(rate >= 1 / 16 && rate < 16);
        near(rate, portraitPlaybackRate(target, start, time));
        assert.ok(Math.abs(rate - previousRate) < 0.03, "rate changes must remain smooth through the splice");
        duration += distance / samples / rate;
        previousRate = rate;
      }
      near(duration, 1);
      assert.ok(portraitPlaybackRate(start, target, start) < distance);
      assert.ok(portraitPlaybackRate(start, target, target) < distance);
    }
  }
  // The edited frames get a gentler cadence than a straight constant-speed pass.
  const joinRate = portraitPlaybackRate(PORTRAIT_STOPS[1], PORTRAIT_STOPS[2], 82 / 24);
  assert.ok(joinRate < PORTRAIT_STOPS[2] - PORTRAIT_STOPS[1]);
});

test("all twelve clips are one-second 60fps videos with unchanged endpoint poses", () => {
  const decode = (src, selected) => execFileSync("ffmpeg", [
    "-v", "error", "-i", fileURLToPath(new URL("../public" + src, import.meta.url)),
    "-vf", "select='" + selected.map(frame => "eq(n," + frame + ")").join("+") + "',scale=160:120,format=gray",
    "-fps_mode", "vfr", "-f", "rawvideo", "pipe:1",
  ]);
  const pixels = 160 * 120;
  const holds = decode(PORTRAIT_FORWARD_SRC, PORTRAIT_STOPS.map(time => Math.round(time * 24)));
  for (let from = 0; from < 4; from++) {
    for (let to = 0; to < 4; to++) {
      if (from === to) continue;
      const src = portraitClipSource(from, to);
      const result = JSON.parse(execFileSync("ffprobe", [
        "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=nb_frames,avg_frame_rate,width,height,duration",
        "-of", "json", fileURLToPath(new URL("../public" + src, import.meta.url)),
      ], { encoding: "utf8" })).streams[0];
      assert.equal(result.nb_frames, "60");
      assert.equal(result.avg_frame_rate, "60/1");
      near(Number(result.duration), 1);
      assert.equal(result.width, 1112);
      assert.equal(result.height, 834);
      const endpoints = decode(src, [0, 59]);
      assert.equal(endpoints.length, 2 * pixels);
      for (const [offset, pose] of [[0, from], [pixels, to]]) {
        let difference = 0;
        for (let i = 0; i < pixels; i++) difference += Math.abs(endpoints[offset + i] - holds[pose * pixels + i]);
        assert.ok(difference / pixels < 2, src + " must retain the exact endpoint pose");
        assert.ok(endpoints[offset] >= 250, "baked background stays white");
      }
    }
  }
});

test("only the wink pair uses the rebuilt, non-ghosted motion bridge", () => {
  for (let from = 0; from < 4; from++) {
    for (let to = 0; to < 4; to++) {
      if (from === to) continue;
      const isWinkPair = (from === 1 && to === 2) || (from === 2 && to === 1);
      assert.equal(portraitClipSource(from, to),
        `/about-motion-${isWinkPair ? "v3" : "v2"}/${from + 1}-${to + 1}.mp4`);
    }
  }

  const src = fileURLToPath(new URL("../public" + portraitClipSource(1, 2), import.meta.url));
  const { frames: timings } = JSON.parse(execFileSync("ffprobe", [
    "-v", "error", "-select_streams", "v:0", "-show_frames",
    "-show_entries", "frame=best_effort_timestamp_time", "-of", "json", src,
  ], { encoding: "utf8" }));
  assert.equal(timings.length, 60);
  timings.forEach((frame, i) => near(Number(frame.best_effort_timestamp_time), i / 60));

  // Check the actual encoded eye/glasses region, not just the file's fps label.
  // The previous unaligned dissolve lost almost half its edge definition here.
  const width = 300, height = 160, pixels = width * height;
  const frames = execFileSync("ffmpeg", [
    "-v", "error", "-i", src, "-vf", `crop=${width}:${height}:400:200,format=gray`,
    "-f", "rawvideo", "pipe:1",
  ], { maxBuffer: 8 * 1024 * 1024 });
  assert.equal(frames.length, 60 * pixels);
  const sharpness = [];
  for (let frame = 0; frame < 60; frame++) {
    const offset = frame * pixels;
    let squared = 0, sum = 0, samples = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = offset + y * width + x;
        const laplacian = frames[i - 1] + frames[i + 1] + frames[i - width]
          + frames[i + width] - 4 * frames[i];
        squared += laplacian * laplacian;
        sum += laplacian;
        samples++;
      }
    }
    sharpness.push(squared / samples - (sum / samples) ** 2);
    if (frame) {
      let difference = 0;
      for (let i = 0; i < pixels; i++) difference += Math.abs(frames[offset + i] - frames[offset - pixels + i]);
      assert.ok(difference / pixels > 0.02, `frame ${frame} must not be a duplicated freeze frame`);
      assert.ok(difference / pixels < 6, `frame ${frame} must not introduce a sudden visual jump`);
    }
  }
  assert.ok(Math.min(...sharpness.slice(13, 32)) > 0.7 * Math.min(sharpness[12], sharpness[32]),
    "the bridge must keep aligned facial detail instead of dissolving two displaced faces");
});

test("native clips, stable playback rate, interruptions, reverse routes and cleanup", async () => {
  const originalWindow = globalThis.window;
  const frames = new Map();
  let frameId = 0;
  globalThis.window = {
    requestAnimationFrame: callback => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
  };
  const forward = new Video(PORTRAIT_FORWARD_SRC);
  const backward = new Video(PORTRAIT_BACKWARD_SRC);
  const videos = [forward, backward];
  let selected = -1, reduced = false, errors = 0;
  const motion = createPortraitMotion({
    forward, backward,
    reducedMotion: () => reduced,
    onSelect: index => { selected = index; },
    onError: () => { errors++; },
  });
  const visible = () => videos.find(video => video.style.opacity === "1" && video.style.zIndex === "2");
  const route = video => video.src.match(/\/(\d)-(\d)\.mp4$/);
  const sourceTime = video => {
    const clip = route(video);
    if (clip) return portraitSourceTimeForProgress(PORTRAIT_STOPS[Number(clip[1]) - 1], PORTRAIT_STOPS[Number(clip[2]) - 1], video.currentTime / PORTRAIT_CLIP_LAST_TIME);
    return video.src === PORTRAIT_BACKWARD_SRC ? PORTRAIT_LAST_FRAME - video.currentTime : video.currentTime;
  };
  const finish = async index => {
    const video = visible();
    if (route(video)) {
      const seekCount = video.seeks.length;
      video.time = 1;
      video.ended = true;
      video.dispatchEvent(new Event("ended"));
      assert.equal(video.seeks.length, seekCount, "native ending must not seek or flash the final frame");
    } else {
      video.time = video.src === PORTRAIT_BACKWARD_SRC ? PORTRAIT_LAST_FRAME - PORTRAIT_STOPS[index] : PORTRAIT_STOPS[index];
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach(callback => callback());
    }
    await flush();
    near(sourceTime(visible()), PORTRAIT_STOPS[index]);
    assert.equal(visible().paused, true);
    assert.equal(frames.size, 0);
  };
  try {
    motion.select(0, false);
    await flush();
    assert.equal(forward.plays + backward.plays, 0);
    for (let from = 0; from < 4; from++) {
      for (let to = 0; to < 4; to++) {
        motion.select(from, false);
        await flush();
        motion.select(to);
        await flush();
        assert.equal(selected, to);
        const playing = visible();
        near(sourceTime(playing), PORTRAIT_STOPS[from]);
        assert.equal(playing.style.transition, "none");
        if (from !== to) {
          assert.equal(playing.src, portraitClipSource(from, to));
          assert.equal(playing.playbackRate, 1);
          assert.equal(frames.size, 0, "normal playback must not run a JavaScript animation loop");
          const writes = playing.rateWrites;
          const seeks = playing.seeks.length;
          playing.time = 0.5;
          await flush();
          assert.equal(playing.paused, false);
          assert.equal(playing.rateWrites, writes, "no per-frame rate changes");
          assert.equal(playing.seeks.length, seeks);
        }
        await finish(to);
      }
    }

    // A click during a clip continues from its actual visible source pose using
    // a constant-rate fallback, instead of snapping back to a held expression.
    motion.select(0, false);
    await flush();
    motion.select(3);
    await flush();
    const oldClip = visible();
    oldClip.time = 0.4;
    const interruptedAt = sourceTime(oldClip);
    motion.select(1);
    await flush();
    const fallback = visible();
    assert.equal(route(fallback), null);
    near(sourceTime(fallback), interruptedAt);
    const rate = Math.abs(PORTRAIT_STOPS[1] - interruptedAt);
    near(fallback.playbackRate, rate);
    const writes = fallback.rateWrites;
    fallback.time += rate * 0.5;
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach(callback => callback());
    await flush();
    assert.equal(fallback.rateWrites, writes);
    oldClip.dispatchEvent(new Event("ended"));
    assert.equal(fallback.paused, false, "cancelled clip cannot pause the new route");
    await finish(1);

    reduced = true;
    const plays = forward.plays + backward.plays;
    motion.select(0);
    await flush();
    near(sourceTime(visible()), PORTRAIT_STOPS[0]);
    assert.equal(forward.plays + backward.plays, plays);
    reduced = false;

    motion.select(2);
    motion.select(1);
    await flush();
    assert.equal(selected, 1);
    await finish(1);
    assert.equal(errors, 0);
    motion.select(2);
    await flush();
    visible().dispatchEvent(new Event("error"));
    assert.equal(errors, 1, "native clip errors still reach the existing error UI");
    assert.equal(visible().paused, true);
    motion.dispose();
    videos.forEach(video => video.dispatchEvent(new Event("ended")));
    await flush();
    assert.equal(frames.size, 0);
    assert.ok(videos.every(video => video.paused));
  } finally {
    motion.dispose();
    globalThis.window = originalWindow;
  }
});
