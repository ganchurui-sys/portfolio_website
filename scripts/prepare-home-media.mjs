import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Offline preparation only. The generated files are checked in, so deployments
// do not need ffmpeg. Keep the original 4K master unchanged.
const root = fileURLToPath(new URL("../public/", import.meta.url));
const source = `${root}home-background-retro-desk-original-4k.mp4`;
const output = `${root}home-media-v2`;
mkdirSync(output, { recursive: true });

const variants = [
  { name: "desktop", width: 1920, fps: 30, crf: 25, gop: 10, maxrate: "3200k", bufsize: "6400k", bframes: 0 },
  { name: "mobile", width: 1280, fps: 30, crf: 26, gop: 10, maxrate: "1600k", bufsize: "3200k", bframes: 0 },
];

for (const variant of variants) {
  const path = `${output}/${variant.name}.mp4`;
  if (!existsSync(path)) {
    console.log(`Preparing ${variant.name}…`);
    execFileSync("ffmpeg", [
      "-hide_banner", "-loglevel", "warning", "-n", "-i", source,
      "-map", "0:v:0", "-an",
      "-vf", `fps=${variant.fps},scale=${variant.width}:-2:flags=lanczos`,
      "-c:v", "libx264", "-preset", "slow", "-crf", String(variant.crf),
      "-pix_fmt", "yuv420p", "-profile:v", "high",
      "-g", String(variant.gop), "-keyint_min", String(variant.gop),
      "-sc_threshold", "0", "-bf", String(variant.bframes),
      "-maxrate", variant.maxrate, "-bufsize", variant.bufsize,
      "-threads", "6", "-filter_threads", "2",
      "-movflags", "+faststart", "-map_metadata", "0", path,
    ], { stdio: "inherit" });
  }
  console.log(`${variant.name}: ${(statSync(path).size / 1_000_000).toFixed(2)} MB`);
}
