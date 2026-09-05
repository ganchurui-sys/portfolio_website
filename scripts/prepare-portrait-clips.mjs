import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  PORTRAIT_STOPS, PORTRAIT_FRAME_RATE, PORTRAIT_EDGE_SOFTNESS, PORTRAIT_JOIN_SOFTNESS,
  JOIN_CENTER, JOIN_RADIUS, joinIntegral,
} from "../app/about/portrait-motion.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = path.join(root, "public/about-portrait-expressions-5406-gentle.mp4");
const directory = path.join(root, "public/about-motion-v2");
mkdirSync(directory, { recursive: true });
const asset = name => path.join(directory, name);
const encode = ["-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-g", "15", "-threads", "2", "-movflags", "+faststart"];
const ffmpeg = args => execFileSync("ffmpeg", ["-v", "error", "-n", "-filter_threads", "2", ...args], { stdio: "inherit" });
// Equivalent to the old SVG component-transfer table, baked once into RGB.
const lift = "if(lte(val,224.4),val,if(lt(val,234.6),224.4+3*(val-224.4),255))";
const white = `lutrgb=r='${lift}':g='${lift}':b='${lift}'`;

if (!existsSync(asset("base-forward.mp4"))) ffmpeg(["-i", source, "-vf", white, ...encode, asset("base-forward.mp4")]);
if (!existsSync(asset("base-reverse.mp4"))) ffmpeg(["-i", asset("base-forward.mp4"), "-vf", "reverse", ...encode, asset("base-reverse.mp4")]);
if (!existsSync(asset("poster.jpg"))) ffmpeg(["-i", asset("base-forward.mp4"), "-frames:v", "1", "-q:v", "2", "-update", "1", asset("poster.jpg")]);

for (let from = 0; from < 4; from++) {
  for (let to = from + 1; to < 4; to++) {
    if (process.argv[2] && process.argv[2] !== `${from + 1}-${to + 1}`) continue;
    const forward = asset(`${from + 1}-${to + 1}.mp4`);
    const reverse = asset(`${to + 1}-${from + 1}.mp4`);
    if (!existsSync(forward)) {
      const start = PORTRAIT_STOPS[from], target = PORTRAIT_STOPS[to], distance = target - start;
      const x = `min(${JOIN_RADIUS},max(${-JOIN_RADIUS},N/${PORTRAIT_FRAME_RATE}+${start - JOIN_CENTER}))`;
      const integral = `((${x}+${JOIN_RADIUS})/2+${JOIN_RADIUS}*sin(PI*${x}/${JOIN_RADIUS})/(2*PI))`;
      const area = `N/${PORTRAIT_FRAME_RATE}+${PORTRAIT_EDGE_SOFTNESS * distance}*sin(2*PI*N/${PORTRAIT_FRAME_RATE * distance})/(2*PI)+${PORTRAIT_JOIN_SOFTNESS}*(${integral}-${joinIntegral(start)})`;
      const denominator = distance + PORTRAIT_JOIN_SOFTNESS * (joinIntegral(target) - joinIntegral(start));
      const filters = [
        `trim=start_frame=${Math.round(start * 24)}:end_frame=${Math.round(target * 24) + 1}`,
        `setpts='(${area})/${denominator}*(59/60)/TB'`,
        "tpad=stop_mode=clone:stop_duration=0.2",
        "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1:scd=none",
        "trim=end_frame=60", "setpts=N/(60*TB)", white,
      ].join(",");
      console.log(`Rendering ${from + 1} → ${to + 1}: 1 second, 60 fps`);
      ffmpeg(["-i", source, "-vf", filters, ...encode, forward]);
    }
    if (!existsSync(reverse)) ffmpeg(["-i", forward, "-vf", "reverse", ...encode, reverse]);
    for (const filename of [forward, reverse]) {
      const stream = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=nb_frames,avg_frame_rate,duration", "-of", "json", filename], { encoding: "utf8" })).streams[0];
      if (stream.nb_frames !== "60" || stream.avg_frame_rate !== "60/1" || Math.abs(Number(stream.duration) - 1) > 0.001) {
        throw new Error(`Invalid clip: ${filename}: ${JSON.stringify(stream)}`);
      }
    }
  }
}
console.log("Portrait clips ready.");
