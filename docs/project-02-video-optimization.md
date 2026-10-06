# Project 02 full-film compression

The full film uses `airpods-max-full-film-4k-web-v4.mp4` for a smaller download
without resizing the image or changing the film's timing and audio. Compression
is lossy; the previous clean master is retained locally and in the
`project-02-media-v1` release.

| Property | Previous clean master | Web version |
| --- | --- | --- |
| File size | 216,479,876 bytes | 131,934,285 bytes |
| Resolution | 3844 × 2160 | 3844 × 2160 |
| Frame rate / frame count | 30 fps / 2,121 | 30 fps / 2,121 |
| Duration | 70.703991 seconds | 70.703991 seconds |
| Average video bitrate | 24.299 Mbps | 14.731 Mbps |
| Format | H.264 High, YUV 4:2:0, BT.709 | H.264 High, YUV 4:2:0, BT.709 |
| Audio | AAC, stereo, 44.1 kHz | Original compressed audio copied |

The file is 39.05% smaller. The full-film player still uses `preload="none"`, so
the film is fetched when the visitor chooses to play it. MP4 metadata is placed
before the media payload (`faststart`) and keyframes are at most two seconds apart
to support playback startup and seeking.

## Encoding

```sh
ffmpeg -i airpods-max-full-film-4k-clean-v3.mp4 \
  -map 0:v:0 -map 0:a:0 \
  -c:v libx264 -preset slow -crf 20 -profile:v high -level:v 5.1 \
  -pix_fmt yuv420p -maxrate 16M -bufsize 32M -g 60 -keyint_min 30 \
  -threads 8 -c:a copy -movflags +faststart -map_metadata 0 \
  airpods-max-full-film-4k-web-v4.mp4
```

## Verification

- Matched frames inspected at 15.2 s (face, headphones and knit texture) and
  52.4 s (floating cars and architecture); flower sequence checked at 61.0 s.
- SSIM sampled every 15 frames across the whole film: 142 samples, mean 0.993371,
  minimum 0.986333, fifth percentile 0.989406. These measurements support the
  visual checks and do not imply a lossless image.
- No dropped or duplicated frames; resolution, frame count, duration and color
  metadata checked with ffprobe.
- AAC bitstream SHA-256 matches the master:
  `874de6a4e0a8b070dd4460f6a87431382ec508a4ee899206b9f057d30fe7a861`.
- Web file SHA-256:
  `f341562675d2ce61d167d7f0c133072e796e1c3339bf8168b0a3aa897e4d4283`.

The pinned `project-02-media-v2` release asset is verified against
`media/project-02.json` before production builds.
