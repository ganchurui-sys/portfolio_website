"""Compress large embedded JPEGs without rasterizing pages or resizing images."""
from io import BytesIO
from pathlib import Path
import json
from PIL import Image, JpegImagePlugin
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/urban/ucl-final/ucl-final-design.pdf"
OUTPUT = ROOT / "output/pdf/ucl-final-design-web.pdf"
REPORT = ROOT / "tmp/pdfs/ucl-compression-report.json"
TARGET_BYTES = 103_000_000  # Below GitHub's 100 MiB (104,857,600 byte) limit.

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
REPORT.parent.mkdir(parents=True, exist_ok=True)

for quality in (82,):
    reader = PdfReader(SOURCE)
    writer = PdfWriter(clone_from=reader)
    replaced = []
    for obj in writer._objects:
        if not hasattr(obj, "get") or obj.get("/Subtype") != "/Image" or obj.get("/Filter") != "/DCTDecode":
            continue
        original = obj._data
        if len(original) < 200_000 or obj.get("/Decode") is not None:
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
        REPORT.write_text(json.dumps(result, indent=2))
        break
else:
    raise RuntimeError("Could not reach the safe upload size with these quality settings")

check = PdfReader(OUTPUT)
assert len(check.pages) == len(reader.pages)
for index, (before, after) in enumerate(zip(reader.pages, check.pages)):
    assert tuple(before.mediabox) == tuple(after.mediabox), index
    assert before.get_contents().get_data() == after.get_contents().get_data(), index
print(f"Verified {len(check.pages)} unchanged page-content streams and page dimensions.", flush=True)
