import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDirectory = process.argv[2];
const outputDirectory = process.argv[3] || "public/aigc/project-01/turnarounds-v1";
if (!sourceDirectory) throw new Error("Pass the folder containing the seven original turnaround PNGs.");

const sourceIds = ["2779", "5369", "7386", "1975", "9658", "8492", "8924"];
await mkdir(outputDirectory, { recursive: true });

for (const [index, id] of sourceIds.entries()) {
  const source = path.join(sourceDirectory, `jimeng-2026-09-20-${id}-个人ip.png`);
  const destination = path.join(outputDirectory, `turnaround-${String(index + 1).padStart(2, "0")}.webp`);
  const metadata = await sharp(source).metadata();
  if (metadata.width !== 3840 || metadata.height !== 2160) {
    throw new Error(`Unexpected dimensions for ${source}`);
  }
  // Web export only: retain the complete original composition and 4K dimensions.
  await sharp(source).webp({ quality: 92, effort: 5 }).toFile(destination);
  await sharp(source).resize(480, 270).webp({ quality: 85, effort: 4 })
    .toFile(destination.replace(".webp", "-thumb.webp"));
  console.log(`${path.basename(destination)}: 3840 × 2160, ${Math.round((await stat(destination)).size / 1024)} KB`);
}
