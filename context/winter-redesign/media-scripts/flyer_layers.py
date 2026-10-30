"""ÄGAPĒ Winter flyer -> web layers (J2 media pipeline).

usage: python3 -E flyer_layers.py <still.png> <overlay.png> <logo_white.png> <out_dir> <check_dir>

The block between the markers is copied verbatim from work/render.py (module-level code that
builds the repaired overlay `ov`: festival logo replaced with grain/blur match, ONLYNUMBERS
rebuilt). After it we split ov into scrim + text-only layers and export WebP.
"""
import io, os, sys, json
import numpy as np
from PIL import Image, ImageChops, ImageCms, ImageFilter

STILL, OVERLAY, LOGO, OUT, CHECK = sys.argv[1:6]
# ---------------- copied from render.py (lines 44-125) ----------------
src = Image.open(STILL)
icc = src.info["icc_profile"]
bg = src.convert("RGB")
ov = Image.open(OVERLAY).convert("RGBA")

# The festival logo arrived damaged in the overlay (rings aliased into noise, wordmark
# blurred). Erase it, rebuilding the soft scrim underneath, and drop in the clean logo
# at the exact same box (matched on width, centered vertically).
DMG_X0, DMG_X1, DMG_Y0, DMG_Y1 = 1040, 1356, 1004, 1171
TEXT_GRAY = 236                                    # overlay text isn't pure white
ova = np.array(ov).astype(np.float32)
is_scrim = (ova[..., 0] < 40).astype(np.float32)
blur = lambda m: np.array(Image.fromarray(m.astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(30))).astype(np.float32)
scrim_a = blur(ova[..., 3] * is_scrim) / np.maximum(blur(is_scrim * 255) / 255, 1e-3)
ex0, ex1, ey0, ey1 = DMG_X0 - 8, DMG_X1 + 8, DMG_Y0 - 8, DMG_Y1 + 8
ova[ey0:ey1, ex0:ex1, :3] = 0
ova[ey0:ey1, ex0:ex1, 3] = scrim_a[ey0:ey1, ex0:ex1]

# "ONLYNUMBERS" arrived with "NU" covered by a blob. Rebuild it from the designer's own
# glyphs (same size, grain and blur): N from JOHANNES, U from SCHUSTER, one row up (+79px).
# Split each pixel into text coverage t and premultiplied luminance p over the scrim s,
# move text only, then recomposite: A = t + s(1-t), RGB = p / A.
s_all = scrim_a / 255
def split_text(y0, y1, x0, x1):
    A = ova[y0:y1, x0:x1, 3] / 255
    s = s_all[y0:y1, x0:x1]
    return ((A - s) / np.maximum(1 - s, 1e-3)).clip(0, 1), ova[y0:y1, x0:x1, 0] * A

BY0, BY1, DY = 2331, 2412, 79                       # KUKO row band; source row is DY above
LX0, LX1 = 380, 1780                                 # line extent incl. blur
t_new = np.zeros((BY1 - BY0, LX1 - LX0), np.float32)
p_new = np.zeros_like(t_new)
def place(t, p, x):
    sl = (slice(None), slice(x - LX0, x - LX0 + t.shape[1]))
    np.maximum(t_new[sl], t, out=t_new[sl])
    np.maximum(p_new[sl], p, out=p_new[sl])
# (source x0, x1, rows above, target x0): "KUKO • ONLY", N, U, M (the blob touched this
# row's M, so take MIKA's), then "BERS • VENDEX". Letters sit 4-5px apart like the rest.
for sx0, sx1, oy, tx0 in [(LX0 + 2, 937, 0, LX0),
                          (1098, 1158, DY, 936),
                          (1528, 1587, DY, 995),
                          (466, 537, 2 * DY + 1, 1055),
                          (1125, LX1 - 2, 0, 1127)]:
    place(*split_text(BY0 - oy, BY1 - oy, sx0, sx1), tx0)
s = s_all[BY0:BY1, LX0:LX1]
A = t_new + s * (1 - t_new)
ova[BY0:BY1, LX0:LX1, 3] = A * 255
ova[BY0:BY1, LX0:LX1, :3] = (p_new / np.maximum(A, 1e-3)).clip(0, 255)[..., None]

ov = Image.fromarray(ova.round().clip(0, 255).astype(np.uint8), "RGBA")

logo = Image.open(LOGO).convert("RGBA")
logo = logo.crop(logo.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox())
logo_a = logo.getchannel("A")
# The rings are hairlines that fade to a grey wisp at flyer size: thicken them ~1px at
# source (wordmark below y=335 untouched) so the ring structure survives downsampling.
logo_a.paste(logo_a.crop((0, 0, logo_a.width, 335)).filter(ImageFilter.MaxFilter(3)), (0, 0))
LOGO_W = DMG_X1 + 1 - DMG_X0
LOGO_H = LOGO_W * logo.height / logo.width
LOGO_X0 = DMG_X0
LOGO_Y0 = (DMG_Y0 + DMG_Y1 + 1) / 2 - LOGO_H / 2

# Match the designer's text treatment (measured on his Ä mark): edges soft by a ~1.4px
# gaussian, and grain in brightness only (236 ± 5.3, 195..249, ~1-2px speckle) with alpha
# left solid -- grain never punches holes, so no black spots in the rings. The rings get a
# lighter 0.8px blur; at 1.4px they melt back into a solid disc.
PAD = 8
lh = round(LOGO_H)
small = np.zeros((lh + 2 * PAD, LOGO_W + 2 * PAD), np.uint8)
small[PAD:PAD + lh, PAD:PAD + LOGO_W] = np.array(logo_a.resize((LOGO_W, lh), Image.LANCZOS))
split = PAD + round(335 * lh / logo.height)
gblur = lambda m, r: np.array(Image.fromarray(m).filter(ImageFilter.GaussianBlur(r)))
rings, word = small.copy(), small.copy()
rings[split:] = 0
word[:split] = 0
treated_a = np.maximum(gblur(rings, 0.8), gblur(word, 1.4))
noise = np.random.default_rng(2027).normal(0, 1, small.shape).astype(np.float32)
noise = np.array(Image.fromarray((noise * 40 + 128).clip(0, 255).astype(np.uint8))
                 .filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) - 128
lum = (TEXT_GRAY + noise / noise.std() * 5.3).clip(195, 249).astype(np.uint8)
treated = Image.fromarray(np.dstack([lum, lum, lum, treated_a]))
ov.alpha_composite(treated, (LOGO_X0 - PAD, round(LOGO_Y0) - PAD))
# ---------------- end copy ----------------

to_srgb = ImageCms.buildTransform(
    ImageCms.ImageCmsProfile(io.BytesIO(icc)), ImageCms.createProfile("sRGB"),
    "RGB", "RGB", renderingIntent=ImageCms.Intent.PERCEPTUAL)
SRGB_ICC = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
os.makedirs(OUT, exist_ok=True); os.makedirs(CHECK, exist_ok=True)

def srgb_rgba(rgba):
    """Adobe RGB -> sRGB on the colour channels, alpha untouched."""
    rgb = ImageCms.applyTransform(rgba.convert("RGB"), to_srgb)
    return Image.merge("RGBA", (*rgb.split(), rgba.getchannel("A")))

def save(img, name, lossless=False, q=90):
    p = os.path.join(OUT, name)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    if lossless:
        img.save(p, "WEBP", lossless=True, quality=100, method=6, exact=False, icc_profile=SRGB_ICC)
    else:
        img.save(p, "WEBP", quality=q, alpha_quality=100, method=6, exact=False, icc_profile=SRGB_ICC)
    return os.path.getsize(p)

man = {}
# 1) full repaired overlay (text + designer scrim)
ov_s = srgb_rgba(ov)
man["overlay-full.webp"] = dict(w=2160, h=3840, bytes=save(ov_s, "overlay-full.webp", q=92))
ov_half = ov_s.resize((1080, 1920), Image.LANCZOS)
man["overlay-full-1080.webp"] = dict(w=1080, h=1920, bytes=save(ov_half, "overlay-full-1080.webp", q=92))

# 2) split: A = t + s(1-t), RGB*A = c*t (scrim is black). s = smooth scrim estimate.
fin = np.array(ov).astype(np.float32)
A = fin[..., 3] / 255
s = s_all.copy()
t = ((A - s) / np.maximum(1 - s, 1e-3)).clip(0, 1)
p = fin[..., 0] * A                                   # premultiplied luminance (text is neutral)
c = np.where(t > 1e-3, p / np.maximum(t, 1e-3), TEXT_GRAY)
# residue where the smooth scrim estimate under/over-shoots shows up as dark "text": drop it
dark = c < 150
t[dark & (t < 0.25)] = 0
c = np.where(t > 1e-3, c, TEXT_GRAY).clip(0, 255)
# where the scrim estimate was below the actual alpha in pure-scrim pixels, keep that in s
s_out = np.where(t == 0, np.maximum(s, A), s)

text = Image.fromarray(np.dstack([c, c, c, t * 255]).round().clip(0, 255).astype(np.uint8), "RGBA")
text = srgb_rgba(text)
scrim = Image.fromarray(np.dstack([np.zeros_like(s_out)] * 3 + [s_out * 255]).round().clip(0, 255).astype(np.uint8), "RGBA")
man["scrim.webp"] = dict(w=2160, h=3840, bytes=save(scrim, "scrim.webp", q=90))
man["text-full.webp"] = dict(w=2160, h=3840, bytes=save(text, "text-full.webp", q=92))

# 3) per-group crops (y bands measured on the overlay; x from text coverage)
BANDS = {
    "logos":      (974, 1176, None),
    "logo-mark":  (974, 1176, (760, 980)),     # Ä mark x 799-932
    "logo-festival": (974, 1176, (1000, 1400)),  # festival logo x 1040-1356
    "title":      (1310, 1419, None),
    "day1-label": (1541, 1612, None),
    "day1-names": (1616, 1862, None),
    "day2-label": (1998, 2069, None),
    "day2-names": (2097, 2407, None),
    "date":       (2530, 2696, None),
}
PADPX = 16
ta = np.array(text.getchannel("A"))
# split rows at the midpoints between neighbouring bands so no pixel lands in two layers
rows = sorted({(v[0], v[1]) for v in BANDS.values()})
def row_range(y0, y1):
    i = rows.index((y0, y1))
    lo = (rows[i - 1][1] + y0) // 2 if i else y0 - 60
    hi = (y1 + rows[i + 1][0]) // 2 if i + 1 < len(rows) else y1 + 60
    return lo, hi
layers = {}
for name, (y0, y1, xr) in BANDS.items():
    lo, hi = row_range(y0, y1)
    xa, xb = xr if xr else (0, 2160)
    if xr and name == "logo-mark": xb = 990       # split the two logos at the gap
    if xr and name == "logo-festival": xa = 990
    band = ta[lo:hi, xa:xb]
    ys, xs = np.nonzero(band > 2)
    box = (int(max(xa, xs.min() + xa - PADPX)), int(max(lo, ys.min() + lo - PADPX)),
           int(min(xb, xs.max() + 1 + xa + PADPX)), int(min(hi, ys.max() + 1 + lo + PADPX)))
    crop = text.crop(box)
    b = save(crop, f"layers/{name}.webp", q=90)
    layers[name] = dict(x=box[0], y=box[1], w=box[2] - box[0], h=box[3] - box[1], bytes=b)
    print(name, layers[name])
man["layers"] = layers

# 4) verification: recomposite scrim + layers (excluding sub-logos) over the still, vs. ov
bg_s = ImageCms.applyTransform(bg, to_srgb).convert("RGBA")
ref = bg_s.copy(); ref.alpha_composite(ov_s)
rec = bg_s.copy(); rec.alpha_composite(Image.open(os.path.join(OUT, "scrim.webp")).convert("RGBA"))
for name, L in layers.items():
    if name.startswith("logo-"): continue
    rec.alpha_composite(Image.open(os.path.join(OUT, f"layers/{name}.webp")).convert("RGBA"), (L["x"], L["y"]))
d = np.abs(np.array(ref.convert("RGB")).astype(int) - np.array(rec.convert("RGB")).astype(int))
print("recomposite diff: mean %.3f  p99.9 %.1f  max %d" % (d.mean(), np.percentile(d, 99.9), d.max()))
ref.convert("RGB").save(os.path.join(CHECK, "ref.png")); rec.convert("RGB").save(os.path.join(CHECK, "rec.png"))
# text-only over mid grey, to eyeball the scrim removal
g = Image.new("RGBA", (2160, 3840), (60, 70, 85, 255)); g.alpha_composite(text)
g.convert("RGB").crop((300, 900, 1860, 2760)).save(os.path.join(CHECK, "text_on_grey.png"))
json.dump(man, open(os.path.join(CHECK, "flyer_manifest.json"), "w"), indent=1)
