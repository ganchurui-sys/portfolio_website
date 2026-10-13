// PageFlipOpen 0.4.3 bundles PDF.js but does not expose its download progress.
// Forward the callback without changing PDF.js streaming or range requests.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const dist = dirname(require.resolve("pageflipopen"));
const { version } = JSON.parse(await readFile(join(dist, "../package.json"), "utf8"));
if (version !== "0.4.3") throw new Error(`Review the PDF progress patch for PageFlipOpen ${version}`);

const changes = [
  ["async load(source) {", "async load(source, onProgress) {"],
  [
    "const loadingTask = __webpack_exports__getDocument({ url: source });",
    "const loadingTask = __webpack_exports__getDocument({ url: source }); loadingTask.onProgress = onProgress;",
  ],
  [
    "this._loader.load(this._options.source)",
    "this._loader.load(this._options.source, this._options.onProgress)",
  ],
];

// Validate both entry points before writing; repeated build/install runs are safe.
const outputs = [];
for (const name of ["pageflipopen.js", "pageflipopen.iife.js"]) {
  const path = join(dist, name);
  const original = await readFile(path, "utf8");
  let source = original;
  for (const [before, after] of changes) {
    if (source.includes(after)) continue;
    if (source.split(before).length !== 2) throw new Error(`PDF progress patch no longer matches ${name}`);
    source = source.replace(before, after);
  }
  if (source !== original) outputs.push({ path, source });
}
for (const { path, source } of outputs) await writeFile(path, source);
console.log("PDF reader download progress is ready.");
