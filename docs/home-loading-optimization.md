# Homepage loading optimization

## Media

The previous entry path fetched two full files (197,744,532 bytes), assembled
them as Blobs, then revealed the homepage. The new files keep the source's
composition, color space and scene timestamps. The original files remain intact.

| Variant | Resolution / fps | Keyframe interval | Bytes |
| --- | --- | --- | ---: |
| Desktop playback | 2560 × 1440 / 60 | 1 second | 15,510,902 |
| Desktop scrolling | 1920 × 1080 / 30 | 0.2 seconds | 11,934,733 |
| Mobile playback | 1280 × 720 / 30 | 1 second | 5,375,232 |
| Mobile scrolling | 1280 × 720 / 30 | 0.1 seconds | 5,971,090 |

The desktop pair is 86.12% smaller; the mobile pair is 94.26% smaller. These are
the complete pair sizes, not bytes required before entry. Only the selected pair
is requested. All outputs use H.264/YUV420P/BT.709 and have MP4 metadata before the
media payload (`faststart`). The 15.033-second outputs cover all original scene
positions, including the 14.5-second ending. Compression and resizing are lossy.

`scripts/prepare-home-media.mjs` contains the encoding settings. It only creates
missing files and leaves both existing outputs and the original master alone.

## Playback behavior

- Native video URLs replace full-file JavaScript downloads, allowing range
  requests, browser caching and incremental buffering.
- Entry waits for a decoded opening frame and one second buffered ahead at 1.5 s.
  The second video starts loading when the cover begins leaving.
- Media errors or six seconds without a playable opening reveal the poster and
  navigation. Videos that arrive later use the current scene rather than reset
  the page to the intro.
- A scrolling video without a decoded frame stays hidden behind the playback
  video/poster. Returning with `?scene=` navigates without waiting for metadata.
- The 3D lanyard module loads on demand. Its model and textures are no longer
  preloaded by the initial homepage bundle.

## Verification

- Production build and TypeScript validation passed. ESLint passed for changed
  source files and scripts.
- Five startup regression tests cover small-screen/constrained-connection
  selection, partial buffering, seek completion, noncontiguous buffer ranges,
  errors/timeouts, and cancellation.
- In fresh Chrome contexts against a local production build with disabled cache,
  simulated 20 Mbps desktop entry took 2.47 s with 5.38 MB of video received;
  simulated 5 Mbps mobile entry took 2.85 s with 1.62 MB received. Times run from
  clicking the cover to the homepage becoming interactive, not from URL navigation.
  Real deployment latency and devices will differ.
- Desktop and mobile forward/reverse chapter navigation passed, and the 3D
  badge still loads when About is opened. No uncaught browser errors occurred.
- Browser checks also passed with both videos aborted, nine-second delayed media,
  direct scene returns before metadata, and reduced-motion preferences. With a
  nine-second response delay the normal entry became usable at 7.46 s, including
  the cover transition; late media stayed on the manually selected scene.
- Desktop and mobile screenshots were inspected. Matched frames from the source
  and desktop playback were visually compared at 4.04 s.
- Sampling every half second after matching frame rates and scaling the reference
  to each output size gave mean SSIM values of 0.989835 (desktop playback),
  0.976995 (desktop scrolling), 0.989071 (mobile playback), and 0.944936 (mobile
  scrolling). These measure encoding differences at output resolution, not the
  loss of detail from resizing the 4K source.
- The existing AIGC tests pass. Three existing Urban tests still assume four
  empty placeholder projects; the current, unchanged Urban data contains three
  populated projects. Those unrelated expectations were not changed here.

## Fonts

Google Fonts was unreachable during the local build. The exact existing deployed
Latin WOFF2 files were preserved under `app/fonts/` and loaded with
`next/font/local`, retaining variable weights 100–900 and `display: swap`.

Font sources:

- `https://zhongism.design/_next/static/media/caa3a2e1cccd8315-s.p.09~u27dqhyhd6.woff2`
- `https://zhongism.design/_next/static/media/797e433ab948586e-s.p.08e28id.o-okb.woff2`
- License: `https://raw.githubusercontent.com/vercel/geist-font/main/OFL.txt`
