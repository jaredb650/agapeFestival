#!/usr/bin/env python3
"""P3 perf pass: lighter stills (run with python3 -E).

1. Hero poster: re-cut from the source clip (05 KOBOSIL.mp4 at 18.5 s = the
   shipped poster's frame, winter-kobosil.mp4 at 6.5 s), WebP q60 instead of the
   JPEG made from the H.264 encode: half the bytes and closer to the source.
   Plus the portrait crop (864x1080 from x=236) for phones: with
   object-position 41% it shows exactly the pixels the full frame shows on
   any portrait (<= 4:5) screen, at 29% of the JPEG's bytes.
2. Flyer layers at 0.5x and 0.75x of the 2160-space originals (premultiplied
   Lanczos, same WebP q90 / alpha 100 as the originals) for srcset: phones and
   1x desktops never need the full 2160-space files.
(A 984 px hero logo was tried and dropped: re-encoded lossless it came out
larger than the hand-tuned 1233 px file.)
"""
import glob
import json
import os
import subprocess
import sys

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "agape-festival", "public"))
SRC_CLIP = os.path.expanduser("~/Downloads/05 KOBOSIL.mp4")
TMP = os.environ.get("P3_TMP", "/tmp/p3-stills")
os.makedirs(TMP, exist_ok=True)


def run(*cmd):
    subprocess.run(cmd, check=True, capture_output=True)


def size(p):
    return os.path.getsize(p)


# ---- 1. hero poster ----
posters = os.path.join(ROOT, "assets", "videos", "posters")
if os.path.exists(SRC_CLIP):
    png = os.path.join(TMP, "poster.png")
    run("ffmpeg", "-hide_banner", "-y", "-ss", "18.5", "-i", SRC_CLIP, "-frames:v", "1",
        "-vf", "scale=in_color_matrix=bt709:in_range=tv:out_range=pc,format=rgb24", png)
    crop = os.path.join(TMP, "poster-m.png")
    Image.open(png).crop((236, 0, 236 + 864, 1080)).save(crop)
    for src, out in ((png, "winter-crowd.webp"), (crop, "winter-crowd-m.webp")):
        run("cwebp", "-quiet", "-q", "60", "-m", "6", "-sharp_yuv", src, "-o", os.path.join(posters, out))
        print(out, size(os.path.join(posters, out)))
else:
    print("source clip missing, skipped posters", file=sys.stderr)

# ---- 2. flyer layers ----
manifest = json.load(open(os.path.join(ROOT, "assets", "winter", "manifest.json"), encoding="utf8"))
layers = manifest["flyer"]["layers"]
for lid, l in layers.items():
    path = os.path.join(ROOT, l["src"].lstrip("/"))
    im = Image.open(path).convert("RGBA")
    assert im.size == (l["width"], l["height"]), lid
    if lid == "logos":
        continue  # the page uses the split logo-mark / logo-festival pair
    base, ext = os.path.splitext(path)
    variants = []
    for old in glob.glob(f"{base}-*w.webp"):
        os.remove(old)
    for scale in (0.5, 0.75):
        # Pick the width near the scale whose rounded height keeps the original aspect best:
        # the page sizes the layer by width with height:auto, so an aspect drift would nudge
        # the glyphs by a fraction of a pixel.
        target = round(l["width"] * scale)
        w = min(range(max(1, target - 8), target + 9),
                key=lambda c: abs(round(l["height"] * c / l["width"]) / c - l["height"] / l["width"]))
        h = max(1, round(l["height"] * w / l["width"]))
        small = im.convert("RGBa").resize((w, h), Image.LANCZOS).convert("RGBA")
        out = f"{base}-{w}w.webp"
        small.save(out, "WEBP", quality=90, alpha_quality=100, method=6, icc_profile=im.info.get("icc_profile"))
        variants.append({"src": "/" + os.path.relpath(out, ROOT), "width": w, "height": h, "bytes": size(out)})
        print(os.path.basename(out), w, h, size(out))
    l["variants"] = variants
    if lid == "logo-mark":
        # The nav shows the mark at 20 CSS px wide: 64 px covers a DPR-3 phone.
        w = 64
        h = round(l["height"] * w / l["width"])
        out = f"{base}-{w}w.webp"
        im.convert("RGBa").resize((w, h), Image.LANCZOS).convert("RGBA").save(
            out, "WEBP", quality=90, alpha_quality=100, method=6, icc_profile=im.info.get("icc_profile"))
        manifest["flyer"]["navMark"] = {"src": "/" + os.path.relpath(out, ROOT), "width": w, "height": h, "bytes": size(out),
                                        "notes": "Added by P3: logo-mark for the nav (shown 20 CSS px wide)."}
        print(os.path.basename(out), w, h, size(out))
manifest["flyer"]["variantsNote"] = (
    "Added by P3 (perf): each layer's `variants` are 0.5x/0.75x copies (premultiplied Lanczos, WebP q90/alpha 100) "
    "for srcset, so phones and 1x desktops skip the 2160-space files. Made by "
    "context/winter-redesign/media-scripts/p3_stills.py."
)
with open(os.path.join(ROOT, "assets", "winter", "manifest.json"), "w", encoding="utf8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)
    f.write("\n")
