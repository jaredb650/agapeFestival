"""Render the ÄGAPĒ Winter flyer in every format.

usage: python3 -E render.py <still.png> <overlay.png> <logo_white.png> <out_dir>

Composites in the sources' native Adobe RGB, then converts to sRGB on export
(the stills are tagged Adobe RGB; dropping the profile washes them out).
The designer's overlay (text + soft scrim) is kept intact; each format only
changes the background crop and the overlay scale.
"""
import io, os, shutil, sys
import numpy as np
from PIL import Image, ImageChops, ImageCms, ImageFilter

STILL, OVERLAY, LOGO, OUT = sys.argv[1:5]

# Overlay content bounds in source px (measured): text spans y 974..2696, x 351..1808.
TEXT_TOP, TEXT_BOT = 974, 2696
TEXT_CY = (TEXT_TOP + TEXT_BOT) / 2          # 1835
TEXT_H = TEXT_BOT - TEXT_TOP                 # 1722
TEXT_W = 1808 - 351                          # 1457 (title row is widest after lineup)
SRC_W, SRC_H = 2160, 3840

BLEED_IN = 0.125

# name, folder, width, height, dpi (None = digital), bleed?, bg focus y (source px) for short crops
FORMATS = [
    # --- digital ---
    ("story-9x16_2160x3840",      "digital", 2160, 3840, None, False),
    ("story-9x16_1080x1920",      "digital", 1080, 1920, None, False),
    ("feed-4x5_2160x2700",        "digital", 2160, 2700, None, False),
    ("feed-4x5_1080x1350",        "digital", 1080, 1350, None, False),
    ("square-1x1_2160x2160",      "digital", 2160, 2160, None, False),
    ("square-1x1_1080x1080",      "digital", 1080, 1080, None, False),
    ("landscape-16x9_1920x1080",  "digital", 1920, 1080, None, False),
    ("fb-event-cover_1920x1005",  "digital", 1920, 1005, None, False),
    ("link-preview_1200x630",     "digital", 1200,  630, None, False),
    # --- print (inches) ---
    ("print-letter-8.5x11_300dpi", "print", 8.5, 11, 300, True),
    ("print-tabloid-11x17_300dpi", "print", 11, 17, 300, True),
    ("print-poster-18x24_150dpi",  "print", 18, 24, 150, True),
    ("print-poster-24x36_150dpi",  "print", 24, 36, 150, True),
]

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

to_srgb = ImageCms.buildTransform(
    ImageCms.ImageCmsProfile(io.BytesIO(icc)), ImageCms.createProfile("sRGB"),
    "RGB", "RGB", renderingIntent=ImageCms.Intent.PERCEPTUAL)
srgb_icc = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()


def render(W, H, safe_frac):
    """W,H: full canvas px. safe_frac: fraction of canvas the text block may occupy."""
    # Cover-crop the background (every format is wider than 9:16, so full source width).
    crop_h = SRC_W * H / W
    # Keep text where the designer put it relative to the tower when it fits at native
    # scale; otherwise (landscape) center the crop on the text block's center as well.
    top = min(max(TEXT_CY - crop_h / 2, 0), SRC_H - crop_h)
    k = W / SRC_W                                      # source px -> output px
    canvas = bg.resize((W, H), Image.LANCZOS, box=(0, top, SRC_W, top + crop_h)).convert("RGBA")

    # Overlay scale: native relative to the background, shrunk only if the text won't fit.
    fit = min(H * safe_frac / TEXT_H, W * safe_frac / TEXT_W) / k
    s = min(1.0, fit)
    ok = k * s
    ov_scaled = ov.resize((round(SRC_W * ok), round(SRC_H * ok)), Image.LANCZOS)
    if s == 1:
        # Native scale: keep the designer's exact placement relative to the background.
        x, y = 0, round(-top * k)
    else:
        # Shrunk (landscape): center the text block on the canvas.
        x = round(W / 2 - SRC_W * ok / 2)
        y = round(H / 2 - TEXT_CY * ok)
    # Crop the overlay to the canvas window (transparent padding where it falls short).
    layer = ov_scaled.crop((-x, -y, -x + W, -y + H))
    if s < 1:
        # Landscape: the lit tower sits behind the logos at this scale, so add a soft
        # shadow under the white text (portrait formats keep the designer's art untouched).
        r, g, b, a = layer.split()
        text_a = ImageChops.multiply(a, r).filter(ImageFilter.GaussianBlur(W / 160))
        shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        shadow.putalpha(text_a.point(lambda v: min(190, int(v * 2.4))))
        canvas.alpha_composite(shadow)
    canvas.alpha_composite(layer)
    out = ImageCms.applyTransform(canvas.convert("RGB"), to_srgb)
    return out, s


for name, kind, w, h, dpi, bleed in FORMATS:
    folder = os.path.join(OUT, kind)
    os.makedirs(folder, exist_ok=True)
    if dpi:
        b = BLEED_IN if bleed else 0
        W, H = round((w + 2 * b) * dpi), round((h + 2 * b) * dpi)
        # keep text inside trim with a generous margin
        img, s = render(W, H, 0.80 * min(w / (w + 2 * b), h / (h + 2 * b)))
        img.save(os.path.join(folder, name + "_bleed.jpg"), quality=95, dpi=(dpi, dpi),
                 icc_profile=srgb_icc, subsampling=0)
        img.save(os.path.join(folder, name + "_bleed.pdf"), resolution=W / (w + 2 * b))
        up = W / SRC_W
    else:
        img, s = render(w, h, 0.86 if w <= h else 0.88)
        img.save(os.path.join(folder, name + ".jpg"), quality=95, icc_profile=srgb_icc, subsampling=0)
        if w == SRC_W and h == SRC_H:
            img.save(os.path.join(folder, name + ".png"), icc_profile=srgb_icc)
        up = w / SRC_W
    print(f"{name:32s} {img.width}x{img.height}  text-scale={s:.2f}  bg-scale={up:.2f}{'  (UPSCALED)' if up > 1.01 else ''}")


# --- DICE: square, JPG only, min 768px; DICE advises avoiding text at thumbnail size ----
folder = os.path.join(OUT, "DICE")
os.makedirs(folder, exist_ok=True)
shutil.copy(os.path.join(OUT, "digital", "square-1x1_2160x2160.jpg"),
            os.path.join(folder, "DICE_image_2160x2160.jpg"))
print(f"{'DICE_image_2160x2160':32s} 2160x2160  (full flyer square)")
# Alternates cropped on the lit top of the tower (the bright lattice reads when tiny).
DICE = 1080
dice_top = 120
dice_bg = bg.resize((DICE, DICE), Image.LANCZOS, box=(0, dice_top, SRC_W, dice_top + SRC_W))
for name, with_logos in [("DICE_alt_no-text_1080x1080", False), ("DICE_alt_logos-only_1080x1080", True)]:
    canvas = dice_bg.convert("RGBA")
    if with_logos:
        # Both logos (Ä mark + repaired festival logo) from the overlay, scaled up and centered.
        LX0_, LY0_, LX1_, LY1_ = 790, 965, 1366, 1185
        lg = ov.crop((LX0_, LY0_, LX1_, LY1_))
        sc = DICE * 0.62 / lg.width
        lg = lg.resize((round(lg.width * sc), round(lg.height * sc)), Image.LANCZOS)
        r, g, b, a = lg.split()
        text_a = ImageChops.multiply(a, r)
        lx, ly = (DICE - lg.width) // 2, (DICE - lg.height) // 2
        shadow = Image.new("RGBA", (DICE, DICE), (0, 0, 0, 0))
        sh_a = Image.new("L", (DICE, DICE), 0); sh_a.paste(text_a, (lx, ly))
        shadow.putalpha(sh_a.filter(ImageFilter.GaussianBlur(DICE / 60)).point(lambda v: min(200, int(v * 2.6))))
        canvas.alpha_composite(shadow)
        # Text coverage as alpha, so the overlay's scrim box edges don't come along.
        canvas.alpha_composite(Image.merge("RGBA", (r, g, b, text_a)), (lx, ly))
    out = ImageCms.applyTransform(canvas.convert("RGB"), to_srgb)
    out.save(os.path.join(folder, name + ".jpg"), quality=95, icc_profile=srgb_icc, subsampling=0)
    print(f"{name:32s} {out.width}x{out.height}")
