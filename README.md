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

## Portfolio PDF

The UCL final-design reader uses `public/urban/ucl-final/ucl-final-design-web.pdf`.
This web copy optimizes embedded JPEG compression without resizing images or
rasterizing the PDF's text and vectors. Its 131 pages and page dimensions are
preserved. The larger original PDF is kept locally and excluded from Git.

`scripts/compress-ucl-pdf.py` documents the preparation process; it is not needed
to build or deploy the website.
