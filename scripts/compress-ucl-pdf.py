"""Prepare the approximately 60 MB web PDF without rasterizing or resizing pages."""
import argparse
from io import BytesIO
from pathlib import Path
import hashlib
import json
from PIL import Image, JpegImagePlugin
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--source", type=Path, default=ROOT / "public/urban/ucl-final/ucl-final-design.pdf")
parser.add_argument("--output", type=Path, default=ROOT / "output/pdf/ucl-final-design-web.pdf")
args = parser.parse_args()
SOURCE = args.source
OUTPUT = args.output
REPORT = ROOT / "tmp/pdfs/ucl-compression-report.json"
TARGET_BYTES = 61_000_000  # Approximately 60 MB, preserving image pixel dimensions.

if SOURCE.resolve() == OUTPUT.resolve():
    raise ValueError("The preserved original must not be overwritten")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
REPORT.parent.mkdir(parents=True, exist_ok=True)

for quality in (57, 56, 55):
    reader = PdfReader(SOURCE)
    writer = PdfWriter(clone_from=reader)
    replaced = []
    for obj in writer._objects:
        if not hasattr(obj, "get") or obj.get("/Subtype") != "/Image" or obj.get("/Filter") != "/DCTDecode":
            continue
        original = obj._data
        if len(original) < 100_000 or obj.get("/Decode") is not None:
            continue
        with Image.open(BytesIO(original)) as image:
            if image.mode not in ("RGB", "L"):
                continue
            compressed = BytesIO()
            options = {"quality": quality, "optimize": True}
            if image.mode == "RGB":
                options["subsampling"] = JpegImagePlugin.get_sampling(image)
            image.save(compressed, "JPEG", **options)
        data = compressed.getvalue()
        if len(data) >= len(original) * 0.98:
            continue
        # The PDF image dimensions, ICC profile, mask and colorspace are intact.
        obj._data = data
        replaced.append({"id": obj.indirect_reference.idnum, "before": len(original), "after": len(data)})
    writer.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
    with OUTPUT.open("wb") as stream:
        writer.write(stream)
    result = {"quality": quality, "source_bytes": SOURCE.stat().st_size,
              "output_bytes": OUTPUT.stat().st_size, "pages": len(reader.pages), "images": replaced}
    print(f"JPEG quality {quality}: {result['output_bytes'] / 1_000_000:.2f} MB; {len(replaced)} images optimized", flush=True)
    if result["output_bytes"] <= TARGET_BYTES:
        break
else:
    raise RuntimeError("Could not reach approximately 60 MB with these quality settings")

check = PdfReader(OUTPUT)
assert len(check.pages) == len(reader.pages)
for index, (before, after) in enumerate(zip(reader.pages, check.pages)):
    assert tuple(before.mediabox) == tuple(after.mediabox), index
    assert tuple(before.cropbox) == tuple(after.cropbox), index
    assert before.get_contents().get_data() == after.get_contents().get_data(), index
result["verified_page_content_streams"] = len(check.pages)
result["sha256"] = hashlib.sha256(OUTPUT.read_bytes()).hexdigest()
REPORT.write_text(json.dumps(result, indent=2) + "\n")
print(f"Verified {len(check.pages)} unchanged page-content streams and page dimensions.", flush=True)
