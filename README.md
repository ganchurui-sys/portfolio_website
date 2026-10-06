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

## Project 02 media

The full 4K AirPods Max film is stored in the `project-02-media-v1` GitHub release.
`npm run build` downloads it automatically when missing and verifies its size and
SHA-256 against `media/project-02.json`. The deployed MP4 is byte-for-byte identical
to the approved local version, including its original audio. A mismatched local
file stops the build instead of being overwritten.

On a fresh checkout, run `npm run media:prepare` before previewing the full film
with `npm run dev`. Other Project 02 assets are tracked directly in Git.

## Portfolio PDF

The UCL final-design reader uses `public/urban/ucl-final/ucl-final-design-web.pdf`.
This web copy optimizes embedded JPEG compression without resizing images or
rasterizing the PDF's text and vectors. Its 131 pages and page dimensions are
preserved. The larger original PDF is kept locally and excluded from Git.

`scripts/compress-ucl-pdf.py` documents the preparation process; it is not needed
to build or deploy the website.
