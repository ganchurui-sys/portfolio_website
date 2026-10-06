import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readFile, rename, rm, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const assets = JSON.parse(await readFile(new URL("../media/project-02.json", import.meta.url), "utf8"));

async function verify(file, asset) {
  if ((await stat(file)).size !== asset.bytes) throw new Error(`Unexpected file size: ${asset.path}`);
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  if (hash.digest("hex") !== asset.sha256) throw new Error(`Checksum mismatch: ${asset.path}`);
}

for (const asset of assets) {
  const destination = resolve(root, asset.path);
  let exists = true;
  try {
    await stat(destination);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    exists = false;
  }
  if (exists) {
    await verify(destination, asset);
    console.log(`Verified local media: ${asset.path}`);
    continue;
  }

  await mkdir(dirname(destination), { recursive: true });
  const temporary = `${destination}.${process.pid}.download`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const signal = AbortSignal.timeout(300_000);
      const response = await fetch(asset.url, { signal });
      if (!response.ok || !response.body) throw new Error(`Media download failed: HTTP ${response.status}`);
      await pipeline(Readable.fromWeb(response.body), createWriteStream(temporary), { signal });
      await verify(temporary, asset);
      await rename(temporary, destination);
      console.log(`Prepared original media: ${asset.path}`);
      break;
    } catch (error) {
      await rm(temporary, { force: true });
      if (attempt === 3) throw error;
      console.warn(`Media download attempt ${attempt} failed; retrying.`);
    }
  }
}
