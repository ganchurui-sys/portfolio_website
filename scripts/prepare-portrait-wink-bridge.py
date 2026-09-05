"""Rebuild the 2↔3 video splice from clean frames of the original 10s video.

Requires ffmpeg, ffprobe, NumPy and OpenCV. This is offline video processing:
no supplied portrait stills, browser frame seeking or live optical-flow work.
"""

import argparse
import subprocess
from pathlib import Path

import cv2
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
WIDTH, HEIGHT, FPS, FRAME_COUNT = 1112, 834, 60, 60
# Preserve the endpoint poses. Never decode the severe frown (frames 84–137).
SOURCE_RANGES = ((72, 83), (138, 156))
# Give the clean bridge 1/3s, leaving enough time for the native wink to settle.
BRIDGE_START, BRIDGE_END = 12, 32


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "public/about-motion-v3")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    forward, reverse = args.output / "2-3.mp4", args.output / "3-2.mp4"
    if forward.exists() or reverse.exists():
        raise SystemExit("Use a new output directory; existing videos are never overwritten.")

    cv2.setNumThreads(2)
    source = ROOT / "public/about-portrait-expressions-5406.mp4"
    selection = "+".join(f"between(n,{start},{end})" for start, end in SOURCE_RANGES)
    raw = subprocess.check_output([
        "ffmpeg", "-v", "error", "-i", str(source), "-vf", f"select='{selection}'",
        "-fps_mode", "vfr", "-pix_fmt", "rgb24", "-f", "rawvideo", "pipe:1",
    ])
    images = np.frombuffer(raw, dtype=np.uint8).reshape(-1, HEIGHT, WIDTH, 3)
    frames = {frame: images[i] for i, frame in enumerate(
        frame for start, end in SOURCE_RANGES for frame in range(start, end + 1)
    )}
    assert len(images) == 31

    grid = np.stack(np.meshgrid(np.arange(WIDTH), np.arange(HEIGHT)), axis=-1).astype(np.float32)
    flow_cache = {}

    def flow(a, b):
        key = (a, b)
        if key not in flow_cache:
            estimator = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
            estimator.setGradientDescentIterations(40)
            estimator.setVariationalRefinementIterations(10)
            flow_cache[key] = estimator.calc(
                cv2.cvtColor(frames[a], cv2.COLOR_RGB2GRAY),
                cv2.cvtColor(frames[b], cv2.COLOR_RGB2GRAY), None,
            )
        return flow_cache[key]

    def warp(frame, displacement, amount):
        # Solve the inverse intermediate-frame map, rather than blending two
        # unaligned faces (the old splice doubled the glasses and facial edges).
        coordinates = grid - amount * displacement
        for _ in range(4):
            sampled = cv2.remap(displacement, coordinates, None, cv2.INTER_LINEAR,
                                borderMode=cv2.BORDER_REPLICATE)
            coordinates = grid - amount * sampled
        return cv2.remap(frame, coordinates, None, cv2.INTER_CUBIC,
                         borderMode=cv2.BORDER_REPLICATE)

    def interpolate(a, b, weight):
        if weight < 0.000001 or a == b:
            return frames[a]
        if weight > 0.999999:
            return frames[b]
        left = warp(frames[a], flow(a, b), weight)
        right = warp(frames[b], flow(b, a), 1 - weight)
        return cv2.addWeighted(left, 1 - weight, right, weight, 0)

    def native(position):
        lower, upper = int(np.floor(position)), int(np.ceil(position))
        return interpolate(lower, upper, position - lower)

    def ease_native(progress):
        return float(progress - 0.25 * np.sin(2 * np.pi * progress) / (2 * np.pi))

    lift = "if(lte(val,224.4),val,if(lt(val,234.6),224.4+3*(val-224.4),255))"
    white = f"lutrgb=r='{lift}':g='{lift}':b='{lift}'"
    encode = ["-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
              "-pix_fmt", "yuv420p", "-g", "15", "-threads", "2", "-movflags", "+faststart"]
    process = subprocess.Popen([
        "ffmpeg", "-v", "error", "-n", "-filter_threads", "2",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{WIDTH}x{HEIGHT}",
        "-r", str(FPS), "-i", "pipe:0", "-vf", white, *encode, str(forward),
    ], stdin=subprocess.PIPE)
    try:
        for index in range(FRAME_COUNT):
            if index <= BRIDGE_START:
                image = native(72 + 11 * ease_native(index / BRIDGE_START))
            elif index < BRIDGE_END:
                progress = (index - BRIDGE_START) / (BRIDGE_END - BRIDGE_START)
                # Softly ease without reaching zero velocity at either splice;
                # a full stop there would look like another short freeze.
                weight = 0.2 * progress + 0.8 * progress * progress * (3 - 2 * progress)
                image = interpolate(83, 138, weight)
            else:
                image = native(138 + 18 * ease_native((index - BRIDGE_END) / (59 - BRIDGE_END)))
            process.stdin.write(image.tobytes())
        process.stdin.close()
        if process.wait() != 0:
            raise RuntimeError("Failed to encode portrait transition")
    finally:
        if process.poll() is None:
            process.kill()
            process.wait()

    subprocess.run(["ffmpeg", "-v", "error", "-n", "-i", str(forward),
                    "-vf", "reverse", *encode, str(reverse)], check=True)
    print(f"Rendered 2↔3: {FRAME_COUNT} frames at {FPS}fps, white background, original endpoints.")


if __name__ == "__main__":
    main()
