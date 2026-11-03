# classic-smooth: bake .wbg's CSS saturate(0.3) into the background stills (posters, flyer still,
# inline placeholder) so the page can drop the filter. CSS saturate() is a matrix on the gamma-encoded
# sRGB values (Filter Effects spec, feColorMatrix type=saturate; browsers apply the shorthand in sRGB).
# usage: python3 -E smooth_graded_stills.py <app dir> <out dir>
import sys, os, io, base64, json
import numpy as np
from PIL import Image, ImageCms

APP, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
S = 0.3
M = np.array([
    [0.213 + 0.787 * S, 0.715 - 0.715 * S, 0.072 - 0.072 * S],
    [0.213 - 0.213 * S, 0.715 + 0.285 * S, 0.072 - 0.072 * S],
    [0.213 - 0.213 * S, 0.715 - 0.715 * S, 0.072 + 0.928 * S],
])
ICC = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()


def grade(im):
    a = np.asarray(im.convert("RGB")).astype(np.float64)
    g = np.clip(np.rint(a @ M.T), 0, 255).astype(np.uint8)
    return Image.fromarray(g)


res = {}
for src, dst, q in [
    ("public/assets/winter/bg/poster-desktop.webp", "poster-desktop-graded.webp", 82),
    ("public/assets/winter/bg/poster-mobile.webp", "poster-mobile-graded.webp", 82),
    ("public/assets/winter/flyer/bg-still-1080.webp", "bg-still-1080-graded.webp", 82),
]:
    im = Image.open(os.path.join(APP, src))
    g = grade(im)
    p = os.path.join(OUT, dst)
    g.save(p, "WEBP", quality=q, method=6, icc_profile=ICC)
    res[dst] = {"from": src, "width": g.width, "height": g.height, "bytes": os.path.getsize(p), "origBytes": os.path.getsize(os.path.join(APP, src))}

man = json.load(open(os.path.join(APP, "public/assets/winter/manifest.json")))
# Reads the ungraded originals; the manifest's placeholder is graded in place once update_manifest ran.
assert "grade" not in man["background"]["placeholder"], "placeholder already graded: use the pre-grade manifest"
uri = man["background"]["placeholder"]["dataUri"]
raw = base64.b64decode(uri.split(",", 1)[1])
ph = grade(Image.open(io.BytesIO(raw)))
buf = io.BytesIO()
ph.save(buf, "JPEG", quality=62, optimize=True)
res["placeholder"] = {"dataUri": "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode(), "bytes": len(buf.getvalue()), "origBytes": len(raw)}
json.dump(res, open(os.path.join(OUT, "stills.json"), "w"), indent=1)
print(json.dumps({k: {kk: vv for kk, vv in v.items() if kk != "dataUri"} for k, v in res.items()}, indent=1))
