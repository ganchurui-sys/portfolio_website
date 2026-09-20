# Project 01 — Expression studies

The fourth visual section follows Character Turnarounds. It reuses the About
page's four expression transitions, displayed as a frameless portrait video.

## Media

`public/aigc/project-01/expressions-v1/expressions-loop.mp4` is a silent, 10-second
loop at 1112 × 834 and 60 fps. Each expression holds for 1.5 seconds before the
existing one-second transition to the next expression:

1. Focused → Look up: `public/about-motion-v2/1-2.mp4`
2. Look up → Wink: `public/about-motion-v3/2-3.mp4`
3. Wink → Side glance: `public/about-motion-v2/3-4.mp4`
4. Side glance → Focused: `public/about-motion-v2/4-1.mp4`

The v3 wink bridge deliberately preserves the corrected About transition.
Regenerate with `node scripts/prepare-expression-loop.mjs` (FFmpeg and FFprobe
must be available on PATH). The script validates dimensions, frame rate, duration
and frame count. Original source clips are not changed.

## Playback

The muted video plays when the section is visible and pauses offscreen or while
the browser tab is hidden. Reduced-motion preferences disable initial autoplay;
the Play button can start playback explicitly. Pause remains in effect when
scrolling away and back. Expression buttons seek to each held pose without
changing the user's play/pause preference. The active name follows the start of
each transition, matching the About navigation behavior.

The portrait sits in the right column, aligned to the right edge of the Character
Turnarounds image area, with expression names directly below. The playback control
sits at the video's bottom-right corner; on mobile it sits just below the video,
above the expression names, to avoid covering the portrait.
The left column contains the section title and the user-provided study description
with Chinese translations.
Both sections share column widths, gutters and responsive outer margins. On smaller
screens the copy appears above the portrait in a single column. The About page
retains its original Instagram-style frame.
