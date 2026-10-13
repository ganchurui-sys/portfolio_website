import assert from "node:assert/strict";
import test from "node:test";
import { pdfLoadingProgress, estimatedLoadingProgress } from "../app/loading-progress.ts";

test("PDF download progress reserves completion for a ready reader", () => {
  assert.equal(pdfLoadingProgress(30_000_000, 60_000_000, 5), 50);
  assert.equal(pdfLoadingProgress(60_000_000, 60_000_000, 50), 95);
  assert.equal(pdfLoadingProgress(70_000_000, 60_000_000, 95), 95);
});

test("PDF progress survives unknown totals and overlapping range progress", () => {
  for (const total of [0, undefined, NaN, Infinity]) {
    assert.equal(pdfLoadingProgress(100, total, 50), 50);
  }
  assert.equal(pdfLoadingProgress(NaN, 100, 50), 50);
  assert.equal(pdfLoadingProgress(10, 100, 50), 50);
  assert.equal(pdfLoadingProgress(100, 100, 100), 100);
});

test("navigation estimates increase but cannot report completion while pending", () => {
  const samples = [0, 250, 1000, 5000, 10_000, 60_000, 600_000].map(estimatedLoadingProgress);
  assert.equal(samples[0], 0);
  assert.ok(samples[3] > 0);
  assert.deepEqual([...samples].sort((a, b) => a - b), samples);
  assert.ok(samples.every(value => value >= 0 && value < 100));
});
