"""Export PDF pages 8–11 for the outfit gallery, preserving their ICC colors.

Usage: python3 scripts/export-outfit-studies.py /path/to/个人ip项目.pdf
Requires pypdf and Pillow with LittleCMS support. This is an asset preparation
step; the website build uses the exported files without requiring the PDF.
"""

import argparse
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageCms
from pypdf import PdfReader


INTENTS = {
    "/Perceptual": ImageCms.Intent.PERCEPTUAL,
    "/RelativeColorimetric": ImageCms.Intent.RELATIVE_COLORIMETRIC,
    "/Saturation": ImageCms.Intent.SATURATION,
    "/AbsoluteColorimetric": ImageCms.Intent.ABSOLUTE_COLORIMETRIC,
}


def image_intents(page):
    # PDF rendering intent belongs to the graphics state at each image draw;
    # a later text operation must not change how an earlier image is exported.
    intent = ImageCms.Intent.RELATIVE_COLORIMETRIC
    stack = []
    result = {}
    for operands, operator in page.get_contents().operations:
        if operator == b"q":
            stack.append(intent)
        elif operator == b"Q":
            intent = stack.pop()
        elif operator == b"ri":
            intent = INTENTS[str(operands[0])]
        elif operator == b"gs":
            state = page["/Resources"]["/ExtGState"][operands[0]]
            if "/RI" in state:
                intent = INTENTS[str(state["/RI"])]
        elif operator == b"Do":
            result[str(operands[0])] = intent
    return result


def export(source: Path, destination: Path):
    reader = PdfReader(source)
    srgb = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB"))
    destination.mkdir(parents=True, exist_ok=True)

    for look_number, page_number in enumerate(range(8, 12), start=1):
        page = reader.pages[page_number - 1]
        intents = image_intents(page)
        images = {image.name: image for image in page.images}
        for label, name in (("look", "Im0"), ("reference", "Im1")):
            if f"{name}.jpg" not in images:
                continue
            image_object = page["/Resources"]["/XObject"][f"/{name}"]
            color_space = image_object["/ColorSpace"].get_object()
            if color_space[0] != "/ICCBased":
                raise ValueError(f"Page {page_number}, {name}: expected an embedded ICC profile")
            profile = ImageCms.ImageCmsProfile(BytesIO(color_space[1].get_object().get_data()))
            intent = INTENTS.get(str(image_object.get("/Intent")), intents[f"/{name}"])
            rgb = ImageCms.profileToProfile(
                images[f"{name}.jpg"].image, profile, srgb,
                renderingIntent=intent, outputMode="RGB",
            )
            filename = f"{label}-{look_number:02}"
            rgb.save(destination / f"{filename}.webp", "WEBP", quality=95, method=6, icc_profile=srgb.tobytes())
            if label == "look":
                thumbnail = rgb.copy()
                thumbnail.thumbnail((480, 270), Image.Resampling.LANCZOS)
                thumbnail.save(destination / f"{filename}-thumb.webp", "WEBP", quality=90, method=6, icc_profile=srgb.tobytes())
            print(f"Page {page_number}: {filename} — {ImageCms.getProfileName(profile).strip()} → sRGB")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path)
    parser.add_argument(
        "--output", type=Path,
        default=Path(__file__).resolve().parents[1] / "public/project-media-v1/aigc/project-01/outfits-v2",
    )
    arguments = parser.parse_args()
    export(arguments.pdf, arguments.output)
