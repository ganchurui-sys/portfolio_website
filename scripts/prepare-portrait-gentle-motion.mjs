import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const asset = name => path.join(root, "public", name);
const source = asset("about-portrait-expressions-5406.mp4");
const forward = asset("about-portrait-expressions-5406-gentle.mp4");
const backward = asset("about-portrait-expressions-5406-gentle-reverse.mp4");
const poster = asset("about-portrait-expressions-5406-gentle-poster.jpg");
const encode = ["-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-g", "12", "-movflags", "+faststart"];
const ffmpeg = args => execFileSync("ffmpeg", ["-v", "error", "-n", ...args], { stdio: "inherit" });

// Keep frames 0–83 and 138–239. Remove the pronounced frown at 3.5–5.75s.
// Blend only the cut's four frames (1/6 second); retain all other native motion.
ffmpeg([
  "-i", source,
  "-filter_complex",
  "[0:v]split[a][b];" +
  "[a]trim=end_frame=84,setpts=PTS-STARTPTS,settb=1/24[a];" +
  "[b]trim=start_frame=138,setpts=PTS-STARTPTS,settb=1/24[b];" +
  "[a][b]xfade=transition=fade:duration=0.166666667:offset=3.333333333,format=yuv420p[out]",
  "-map", "[out]", ...encode, forward,
]);
const stream = JSON.parse(execFileSync("ffprobe", [
  "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=nb_frames,avg_frame_rate",
  "-of", "json", forward,
], { encoding: "utf8" })).streams[0];
if (Number(stream.nb_frames) !== 182 || stream.avg_frame_rate !== "24/1") {
  throw new Error(`Unexpected trimmed timeline: ${JSON.stringify(stream)}`);
}
ffmpeg(["-i", forward, "-vf", "reverse", ...encode, backward]);
ffmpeg(["-ss", String(170 / 24), "-i", forward, "-frames:v", "1", "-q:v", "2", "-update", "1", poster]);
console.log("Prepared continuous portrait motion without the pronounced-frown segment.");
