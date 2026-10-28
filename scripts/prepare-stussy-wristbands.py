#!/usr/bin/python3
"""Export the supplied rotating wristbands on a clean white background.

Usage: /usr/bin/python3 scripts/prepare-stussy-wristbands.py INPUT.mp4 OUTPUT_DIR
Requires OpenCV, NumPy, and ffmpeg with libx264.
The camera and cylindrical outlines remain fixed in this particular film.
A shared silhouette sampled across its full rotation preserves dark material
and prevents frame-by-frame keying from erasing the black wristband.
"""

import argparse
from pathlib import Path
import subprocess

import cv2
import numpy as np


ELLIPSE_3 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))


def largest_hull(mask):
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        raise RuntimeError("A wristband silhouette could not be found")
    return cv2.convexHull(max(contours, key=cv2.contourArea))


def prepare_matte(capture):
    height = width = 1080
    yy, xx = np.indices((height, width))
    counts = np.zeros((4, height, width), np.uint16)
    brightest = np.zeros((height, width), np.uint8)
    reference = None
    for frame_number in range(0, 240, 10):
        capture.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        success, frame = capture.read()
        if not success:
            raise RuntimeError(f"Cannot decode source frame {frame_number}")
        if frame_number == 60:
            reference = frame
        hue, saturation, value = cv2.split(cv2.cvtColor(frame, cv2.COLOR_BGR2HSV))
        brightest = np.maximum(brightest, value)
        spread = frame.max(2).astype(np.float32) - frame.min(2)
        difference = np.linalg.norm(frame.astype(np.float32) - np.array([1, 2, 0]), axis=2)
        selections = [
            (saturation < 90) & (value > 75) & (yy < 420),
            (hue >= 125) & (hue <= 170) & (saturation > 50) & (value > 50) & (yy > 250) & (yy < 730),
            (hue >= 90) & (hue < 125) & (saturation > 65) & (value > 40) & (yy > 440) & (yy < 850),
            (spread < 27) & (difference > 2.8) & (yy > 700),
        ]
        for index, selection in enumerate(selections):
            candidate = cv2.morphologyEx(
                selection.astype(np.uint8) * 255, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)
            )
            silhouette = np.zeros((height, width), np.uint8)
            cv2.fillConvexPoly(silhouette, largest_hull(candidate), 255)
            counts[index] += silhouette > 0

    shapes = []
    for index in range(4):
        candidate = (counts[index] >= (16 if index == 0 else 4)).astype(np.uint8) * 255
        if index == 3:
            # The source's dark cylinder runs from x=285 to x=811. Ignore
            # bright lettering on the blue band above its stationary sides.
            candidate[:, :285] = 0
            candidate[:, 812:] = 0
        silhouette = np.zeros_like(candidate)
        cv2.fillConvexPoly(silhouette, largest_hull(candidate), 255)
        if index < 3:
            silhouette = cv2.erode(silhouette, ELLIPSE_3)
        else:
            # Use the visible inner back surface for the upper arc, avoiding
            # a convex bridge through the empty gap below the blue wristband.
            silhouette[:790] = 0
            spread = reference.max(2).astype(np.float32) - reference.min(2)
            gray = ((spread < 24) & (reference.max(2) > 28)
                    & (reference.max(2) < 165) & (yy > 680)).astype(np.uint8) * 255
            back = np.zeros_like(silhouette)
            cv2.fillConvexPoly(back, largest_hull(gray), 255)
            silhouette = np.maximum(silhouette, cv2.erode(back, ELLIPSE_3))
        shapes.append(silhouette)

    mask = np.max(shapes, axis=0)
    # Pixels that stay dark throughout the rotation between the bright bands
    # are background, including small compression marks around their overlaps.
    mask[(yy < 700) & (brightest < 30)] = 0
    difference = np.linalg.norm(reference.astype(np.float32) - np.array([1, 2, 0]), axis=2)
    opening = ((difference < 2.9) & (yy > 800) & (yy < 880)
               & (xx > 330) & (xx < 760)).astype(np.uint8) * 255
    cv2.fillConvexPoly(mask, largest_hull(opening), 0)
    mask = cv2.GaussianBlur(mask, (5, 5), 0.65)
    core = cv2.erode(
        (mask > 127).astype(np.uint8) * 255,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)),
    )
    _, nearest = cv2.distanceTransformWithLabels(
        255 - core, cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL
    )
    capture.set(cv2.CAP_PROP_POS_FRAMES, 0)
    return mask[:, :, None].astype(np.float32) / 255, core > 0, nearest


def white_frame(frame, alpha, core, nearest):
    # Extend the interior color through the narrow antialiasing band, so black
    # source-background pixels cannot leave a dark fringe on the white page.
    palette = np.zeros((nearest.max() + 1, 3), np.uint8)
    palette[nearest[core]] = frame[core]
    foreground = frame.copy()
    foreground[~core] = palette[nearest[~core]]
    composite = np.round(foreground * alpha + 255 * (1 - alpha)).astype(np.uint8)
    return composite[90:1020, 160:920]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    capture = cv2.VideoCapture(str(args.source))
    if not capture.isOpened():
        raise RuntimeError("Cannot open the source video")
    if (int(capture.get(cv2.CAP_PROP_FRAME_WIDTH)), int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))) != (1080, 1080):
        raise ValueError("This silhouette is calibrated for the supplied 1080 × 1080 film")
    fps = capture.get(cv2.CAP_PROP_FPS)
    alpha, core, nearest = prepare_matte(capture)
    print("Prepared stable wristband silhouettes", flush=True)
    encoder = subprocess.Popen([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "rawvideo", "-pixel_format", "bgr24", "-video_size", "760x930",
        "-framerate", str(fps), "-i", "pipe:0", "-an",
        "-vf", "scale=out_color_matrix=bt709:out_range=pc:flags=accurate_rnd+full_chroma_int",
        "-color_range", "pc", "-colorspace", "bt709", "-color_trc", "bt709", "-color_primaries", "bt709",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium",
        "-movflags", "+faststart", str(args.output / "wristbands-white-v3.mp4"),
    ], stdin=subprocess.PIPE)
    frames = 0
    try:
        while True:
            success, frame = capture.read()
            if not success:
                break
            composite = white_frame(frame, alpha, core, nearest)
            if frames == 0:
                cv2.imwrite(str(args.output / "wristbands-white-v3-poster.webp"),
                            composite, [cv2.IMWRITE_WEBP_QUALITY, 100])
            encoder.stdin.write(composite.tobytes())
            frames += 1
            if frames % 60 == 0:
                print(f"Prepared {frames} frames", flush=True)
    finally:
        capture.release()
        encoder.stdin.close()
    if encoder.wait() != 0 or frames != 240:
        raise RuntimeError("White-background video encoding failed")
    print(f"Exported {frames} frames at {fps:g} fps to {args.output}")


if __name__ == "__main__":
    main()
