# Zhongism Portfolio

The portfolio site for [zhongism.design](https://zhongism.design), built with Next.js.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm start
```

The repository is intended to be connected to Vercel. Every push to the production branch triggers a new deployment.

## Homepage loading

The opening progress bar prepares one complete, shared video before enabling
entry. Desktop uses a 6.35 MB 1080p file; mobile and constrained connections use
a 3.19 MB 720p file. Both playback and scrubbing use the same session-cached Blob
URL, so jumping chapters does not wait for a later network segment. Both video
elements decode their opening frame before the entrance becomes available.

The loader also prepares the badge and project first-screen images. Project
routes are prefetched; the remaining images load near the viewport. 52 prepared
WebP images total 7.07 MB instead of 155.83 MB of source images. Original artwork
and full-resolution image links remain available. PDF readers show a prepared
first-page preview while the document and interactive reader initialize.

Generated assets are checked in. Offline preparation uses ffmpeg and sharp:
`node scripts/prepare-home-media.mjs`, `node scripts/prepare-project-images.mjs`,
and `node scripts/prepare-badge-model.mjs`. Deployments do not need these tools.
Run `node --test scripts/home-media.test.mjs` for readiness, caching, and retry
regressions. See `docs/home-loading-optimization.md` for details.

Geist and Geist Mono use the same Latin font files as the previous deployed site,
now stored in `app/fonts/` with their OFL license. Builds no longer need access to
Google Fonts. Next.js still serves the fonts locally with `font-display: swap`.

## Project 02 media

The web-optimized 4K AirPods Max film is stored in the `project-02-media-v2` GitHub release.
`npm run build` downloads it automatically when missing and verifies its size and
SHA-256 against `media/project-02.json`. Its 3844 × 2160 resolution, 30 fps and
original audio are preserved while reducing the download from 216.5 MB to 131.9 MB.
A mismatched local file stops the build instead of being overwritten. The previous
master remains in `project-02-media-v1`; see `docs/project-02-video-optimization.md`
for encoding settings and quality checks.

On a fresh checkout, run `npm run media:prepare` before previewing the full film
with `npm run dev`. Other Project 02 assets are tracked directly in Git.

## Portfolio PDF

The UCL final-design reader uses `public/urban/ucl-final/ucl-final-design-web.pdf`.
This web copy optimizes embedded JPEG compression without resizing images or
rasterizing the PDF's text and vectors. Its 131 pages and page dimensions are
preserved. The larger original PDF is kept locally and excluded from Git.

`scripts/compress-ucl-pdf.py` documents the preparation process; it is not needed
to build or deploy the website.
