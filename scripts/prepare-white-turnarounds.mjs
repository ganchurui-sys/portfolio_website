// Restore original 4K character pixels over the imagegen-cleaned white backdrop.
// Sources stay read-only; full-size sheets and thumbnails are exported together.
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import sharp from "sharp";

const [sourceDirectory, maskDirectory, guideDirectory, outputDirectory] = process.argv.slice(2);
assert.ok(sourceDirectory && maskDirectory && guideDirectory && outputDirectory,
  "Usage: node scripts/prepare-white-turnarounds.mjs SOURCE MASKS GUIDES OUTPUT");
const sourceIds = ["2779", "5369", "7386", "1975", "9658", "8492", "8924"];
// One solid clothing point in each of the four original views. Unlike dividing
// the canvas into quarters, this detects a missing narrow side-view character.
const viewCenters = [
  [0.24, 0.59, 0.752, 0.9], [0.235, 0.50, 0.676, 0.86],
  [0.22, 0.51, 0.69, 0.90], [0.25, 0.59, 0.751, 0.904],
  [0.23, 0.514, 0.701, 0.872], [0.25, 0.535, 0.712, 0.89],
  [0.20, 0.477, 0.67, 0.853],
];
await mkdir(outputDirectory, { recursive: true });
const report = [];

for (const [index, id] of sourceIds.entries()) {
  const number = String(index + 1).padStart(2, "0");
  const sourceName = `jimeng-2026-09-20-${id}-个人ip.png`;
  const { data: original, info } = await sharp(path.join(sourceDirectory, sourceName))
    .toColourspace("srgb").removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  assert.deepEqual([width, height, channels], [3840, 2160, 3]);
  const mask = await readFile(path.join(maskDirectory, sourceName.replace(/\.png$/, ".mask")));
  assert.equal(mask.length, width * height);
  // The full-sheet foreground detector misses the narrow side pose in these
  // two originals. Restore it from a separate, original-resolution crop mask.
  if (id === "2779" || id === "1975") {
    const side = await readFile(path.join(maskDirectory, "side", `${id}-side.mask`));
    assert.equal(side.length, 540 * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < 540; x++) {
        const pixel = y * width + 2600 + x;
        mask[pixel] = Math.max(mask[pixel], side[y * 540 + x]);
      }
    }
  }
  const guide = await sharp(path.join(guideDirectory, `turnaround-${number}-guide.png`))
    .resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
  const output = Buffer.alloc(original.length, 255);
  let foregroundPixels = 0;
  let whitePixels = 0;
  const foregroundByQuarter = [0, 0, 0, 0];

  for (let pixel = 0; pixel < mask.length; pixel++) {
    const offset = pixel * 3;
    const guideIsWhite = Math.min(guide[offset], guide[offset + 1], guide[offset + 2]) >= 238;
    // The generated edit guides removal of uncertain pale backdrop remnants.
    // All confident character pixels come directly from the original PNG.
    const alpha = guideIsWhite && mask[pixel] < 24 ? 0
      : Math.min(1, Math.max(0, (mask[pixel] - 18) / (230 - 18)));
    if (alpha === 0) { whitePixels++; continue; }
    if (alpha === 1) {
      foregroundPixels++;
      foregroundByQuarter[Math.min(3, Math.floor((pixel % width) / (width / 4)))]++;
    }
    for (let channel = 0; channel < 3; channel++) {
      output[offset + channel] = Math.round(original[offset + channel] * alpha + 255 * (1 - alpha));
    }
  }

  assert.ok(whitePixels > width * height * 0.2, `White background required: ${sourceName}`);
  for (const [view, fraction] of viewCenters[index].entries()) {
    const pixel = Math.round(height * 0.48) * width + Math.round(width * fraction);
    assert.ok(mask[pixel] >= 230, `Missing view ${view + 1}: ${sourceName}`);
    assert.deepEqual(output.subarray(pixel * 3, pixel * 3 + 3), original.subarray(pixel * 3, pixel * 3 + 3),
      `Original character pixels required, view ${view + 1}: ${sourceName}`);
  }
  const destination = path.join(outputDirectory, `turnaround-${number}.webp`);
  await sharp(output, { raw: { width, height, channels } })
    .webp({ lossless: true, effort: 6 }).toFile(destination);
  await sharp(output, { raw: { width, height, channels } })
    .resize(480, 270).webp({ quality: 90, effort: 5 })
    .toFile(destination.replace(".webp", "-thumb.webp"));
  // Confirm the full-size export preserves the restored original pixels exactly.
  const exported = await sharp(destination).removeAlpha().raw().toBuffer();
  assert.ok(exported.equals(output), `Lossless export required: ${sourceName}`);
  const record = { look: number, source: sourceName, width, height,
    foregroundPixels, whitePixels, foregroundByQuarter,
    bytes: (await stat(destination)).size };
  report.push(record);
  console.log(JSON.stringify(record));
}

await writeFile(path.join(guideDirectory, "validation.json"), JSON.stringify(report, null, 2) + "\n");
