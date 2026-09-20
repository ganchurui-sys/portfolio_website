import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public/aigc/project-01/expressions-v1/expressions-loop.mp4");
const clips = [
  "about-motion-v2/1-2.mp4",
  "about-motion-v3/2-3.mp4",
  "about-motion-v2/3-4.mp4",
  "about-motion-v2/4-1.mp4",
].map((clip) => path.join(root, "public", clip));

// Keep the corrected About transitions intact, with a 1.5 s hold at each pose.
const filter = clips.map((_, index) =>
  `[${index}:v]setpts=PTS-STARTPTS,tpad=start_mode=clone:start_duration=1.5[v${index}]`,
).join(";") + ";[v0][v1][v2][v3]concat=n=4:v=1:a=0[out]";

mkdirSync(path.dirname(output), { recursive: true });
execFileSync("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y",
  ...clips.flatMap((clip) => ["-i", clip]),
  "-filter_complex", filter, "-map", "[out]", "-an",
  "-c:v", "libx264", "-preset", "slow", "-crf", "18",
  "-pix_fmt", "yuv420p", "-r", "60", "-movflags", "+faststart", output,
], { stdio: "inherit" });

const probe = JSON.parse(execFileSync("ffprobe", [
  "-v", "error", "-select_streams", "v:0", "-show_entries",
  "stream=width,height,r_frame_rate,nb_frames,duration", "-of", "json", output,
], { encoding: "utf8" })).streams[0];

if (probe.width !== 1112 || probe.height !== 834 || probe.r_frame_rate !== "60/1"
  || Number(probe.nb_frames) !== 600 || Math.abs(Number(probe.duration) - 10) > 0.01) {
  throw new Error(`Unexpected expression loop timing: ${JSON.stringify(probe)}`);
}

console.log(`${path.relative(root, output)}: four poses, 10 seconds, 600 frames, 1112 × 834`);
