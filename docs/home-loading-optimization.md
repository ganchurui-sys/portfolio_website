# Portfolio loading and navigation

## Complete preparation before entry

The opening progress bar starts on arrival. It waits for the full selected
H.264 video, decoded opening frames in both video elements, the badge, and
project first-screen images. A download or decode failure keeps the loader and
provides a retry; there is no six-second automatic bypass. The percentage is
based on received video bytes (85%), completed image requests (10%), and final
initialization (5%). Routes prefetch while preparation runs.

| Homepage video | Resolution / fps | Bytes |
| --- | --- | ---: |
| Desktop | 1920 × 1080 / 30 | 6,345,315 |
| Mobile / constrained network | 1280 × 720 / 30 | 3,194,551 |

One object URL is shared by playback and scrubbing and retained for the browser
session. Returning from a project reuses the downloaded video. H.264 uses a
10-frame GOP, no B frames, YUV420P, BT.709, and faststart. The complete 15.033-second
film retains the existing scene timestamps. Original videos remain unchanged.

## Responsive interactions

Header chapter jumps take 600 ms. Scroll gestures retain their existing cinematic
transition. Direct project returns position the requested scene without replaying
the intro. Pending seeks coalesce instead of restarting each frame, and a video
plays a transition only when its complete interval is buffered. Scroll positioning
explicitly overrides CSS smooth scrolling. Badge visibility is no longer cleared
by transient chapter positions during a seek.

Project links prefetch and show OPENING while a navigation is pending. The root
loading boundary provides an immediate response on uncached routes.

## Badge and images

The badge GLB shrank from 2,457,784 to 162,612 bytes by removing an unused embedded
PNG. Geometry, UV coordinates, nodes, and the metal material are byte-identical.
A clickable preview remains available if WebGL cannot initialize.

52 project WebP assets total 7.07 MB versus 155.83 MB in the source images. Images
are resized within 1920 × 2560 and encoded at WebP quality 84 with alpha preserved.
The image manifest maps display images while original full-resolution links are
unchanged. The avatar shader also uses the prepared WebPs. PDF readers display
first-page previews while loading; the PDFs and page-turn behavior are unchanged.
Versioned assets have immutable cache headers. The short TVC hero video is also
served as a lighter 1280-pixel H.264 copy; its original and full 4K film remain.

## Verification

- Production build and TypeScript validation pass.
- Six startup tests cover shared responsive media, complete-response gating,
  session reuse, retry after network failure, decoded-frame gating, cancellation,
  and noncontiguous buffered ranges. Four existing AIGC tests pass.
- Browser checks verify initial progress, both videos ready before entry,
  autoplay, chapter navigation, visible 3D badge, direct project returns, project
  first-screen images, and PDF preview while the reader initializes.
- Local fault/slow proxies verify that failed media retains retry and a slowly
  delivered video completes before the entrance is enabled.
- The pre-existing Urban tests still assume four empty placeholders. The data
  contains three populated projects; those unrelated expectations are unchanged.
- The pre-existing Urban video caption lint finding is unchanged.

## Fonts

Google Fonts was unreachable during the local build. The exact existing deployed
Latin WOFF2 files were preserved under `app/fonts/` and loaded with
`next/font/local`, retaining variable weights 100–900 and `display: swap`.

Font sources:

- `https://zhongism.design/_next/static/media/caa3a2e1cccd8315-s.p.09~u27dqhyhd6.woff2`
- `https://zhongism.design/_next/static/media/797e433ab948586e-s.p.08e28id.o-okb.woff2`
- License: `https://raw.githubusercontent.com/vercel/geist-font/main/OFL.txt`
