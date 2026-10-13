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

The homepage streams versioned H.264 files from `public/home-media-v1/` using
native video requests. It opens after the first second at the intro position has
buffered, rather than downloading the entire playback and scrolling videos into
JavaScript Blobs. The scrolling video starts loading as the cover leaves. Slow
or failed media falls back to the existing poster after at most six seconds of
waiting, with navigation still available.

Desktop media totals 27.45 MB; mobile media totals 11.35 MB, down from 197.74 MB.
Screens up to 760 px, data-saving mode, and reported 2G/3G connections use the
smaller pair. The 3D badge code and assets load when its section is opened.

The generated videos are committed assets. To recreate missing variants locally
from the preserved 4K master, run `node scripts/prepare-home-media.mjs` with ffmpeg
installed. Deployments do not need ffmpeg. Run
`node --test scripts/home-media.test.mjs` for startup and fallback regression tests.
See `docs/home-loading-optimization.md` for encoding and verification details.

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
