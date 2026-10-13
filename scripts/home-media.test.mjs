import assert from "node:assert/strict";
import test from "node:test";
import { prepareVideoStart, selectHomeVideoAssets } from "../app/home-media.ts";

class Video extends EventTarget {
  readyState = 0;
  currentTime = 0;
  seeking = false;
  error = null;
  ranges = [];
  get buffered() {
    return {
      length: this.ranges.length,
      start: index => this.ranges[index][0],
      end: index => this.ranges[index][1],
    };
  }
  emit(event) { this.dispatchEvent(new Event(event)); }
}

test("small screens and constrained connections select only the smaller media pair", () => {
  const desktop = selectHomeVideoAssets({ viewportWidth: 1440 });
  const mobile = selectHomeVideoAssets({ viewportWidth: 390 });
  assert.notDeepEqual(desktop, mobile);
  assert.deepEqual(selectHomeVideoAssets({ viewportWidth: 1440, saveData: true }), mobile);
  assert.deepEqual(selectHomeVideoAssets({ viewportWidth: 1440, effectiveType: "3g" }), mobile);
  assert.deepEqual(selectHomeVideoAssets({ viewportWidth: 1440, effectiveType: "4g" }), desktop);
});

test("entry finishes with only the opening second buffered, without waiting for the 15-second film", () => {
  const video = new Video();
  let calls = 0;
  const progress = [];
  const dispose = prepareVideoStart(video, {
    startTime: 1.5,
    onProgress: value => progress.push(value),
    onReady: () => calls++,
  });
  video.readyState = 1;
  video.emit("loadedmetadata");
  assert.equal(video.currentTime, 1.5);
  video.readyState = 3;
  video.ranges = [[0, 2.1]];
  video.emit("progress");
  assert.equal(calls, 0);
  assert.ok(progress.at(-1) > 0);
  video.ranges = [[0, 2.6]];
  video.seeking = true;
  video.emit("canplay");
  assert.equal(calls, 0, "wait for the requested opening frame to decode");
  video.seeking = false;
  video.emit("seeked");
  video.emit("canplay");
  assert.equal(calls, 1);
  dispose();
});

test("a buffered later segment cannot satisfy the opening frame", () => {
  const video = new Video();
  video.readyState = 3;
  video.ranges = [[8, 15]];
  let ready = false;
  const dispose = prepareVideoStart(video, {
    startTime: 1.5, onProgress: () => {}, onReady: () => { ready = true; },
  });
  assert.equal(ready, false);
  video.ranges = [[1.5, 2.6], [8, 15]];
  video.emit("progress");
  assert.equal(ready, true);
  dispose();
});

test("slow or failed media reveals the page instead of trapping visitors in the loader", async () => {
  for (const failure of ["timeout", "error", "existing-error"]) {
    const video = new Video();
    if (failure === "existing-error") video.error = { code: 2 };
    let calls = 0;
    const dispose = prepareVideoStart(video, {
      startTime: 1.5, timeoutMs: 15, onProgress: () => {}, onReady: () => calls++,
    });
    if (failure === "error") video.emit("error");
    await new Promise(resolve => setTimeout(resolve, 25));
    assert.equal(calls, 1, failure);
    dispose();
  }
});

test("unmount cancels callbacks and listeners", async () => {
  const video = new Video();
  let calls = 0;
  const dispose = prepareVideoStart(video, {
    startTime: 1.5, timeoutMs: 15, onProgress: () => {}, onReady: () => calls++,
  });
  dispose();
  video.emit("error");
  await new Promise(resolve => setTimeout(resolve, 25));
  assert.equal(calls, 0);
});
