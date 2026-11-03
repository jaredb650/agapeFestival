"""Square headshot export + framing preview.
usage: export_headshot.py SRC OUTDIR PREVIEW.jpg side_frac cx_frac top_frac focus_x focus_y zoom [quality]
  side_frac: square side as a fraction of the source width; cx_frac: square centre x (fraction of width);
  top_frac: square top (fraction of height). focus/zoom mimic roster.css (tile) and the bio frames.
"""
import io, os, sys
from PIL import Image, ImageCms, ImageEnhance, ImageOps

src, outdir, preview = sys.argv[1:4]
side_f, cx_f, top_f, fx, fy, zoom = map(float, sys.argv[4:10])
q = int(sys.argv[10]) if len(sys.argv) > 10 else 80

im = Image.open(src)
icc = im.info.get("icc_profile")
srgb = ImageCms.createProfile("sRGB")
if icc:
    im = ImageCms.profileToProfile(im, ImageCms.ImageCmsProfile(io.BytesIO(icc)), srgb, outputMode="RGB")
im = im.convert("RGB")
W, H = im.size
side = round(side_f * W)
x0 = round(cx_f * W - side / 2); y0 = round(top_f * H)
x0 = max(0, min(W - side, x0)); y0 = max(0, min(H - side, y0))
sq = im.crop((x0, y0, x0 + side, y0 + side))
print("crop box", (x0, y0, x0 + side, y0 + side))
srgb_bytes = ImageCms.ImageCmsProfile(srgb).tobytes()
os.makedirs(outdir, exist_ok=True)
outs = {}
for n in (600, 1200):
    p = os.path.join(outdir, f"headshot-{n}.webp")
    sq.resize((n, n), Image.LANCZOS).save(p, "WEBP", quality=q, method=6, icc_profile=srgb_bytes)
    outs[n] = p
    print(p, os.path.getsize(p), "bytes")

# --- preview (from the 1200 export, as the browser would see it) ---
def grade(img, b):
    g = ImageOps.grayscale(img).convert("RGB")
    g = ImageEnhance.Contrast(g).enhance(1.08)
    return ImageEnhance.Brightness(g).enhance(b)

big = Image.open(outs[1200]).convert("RGB")
N = 1200
# tile: scale(zoom) about the focus point -> visible square of side N/zoom
vs = N / zoom
tx0 = fx * N - fx * vs; ty0 = fy * N - fy * vs
tile = grade(big.crop((round(tx0), round(ty0), round(tx0 + vs), round(ty0 + vs))).resize((420, 420), Image.LANCZOS), 0.86)
def bio(aspect, h=520):
    vw = N * aspect  # cover by height, visible width
    bx0 = fx * (N - vw)
    return grade(big.crop((round(bx0), 0, round(bx0 + vw), N)).resize((round(h * aspect), h), Image.LANCZOS), 0.9)
phone = bio(0.8); desk = bio(416 / 638)
full = big.resize((420, 420), Image.LANCZOS)
parts = [full, tile, phone, desk]
Wt = sum(p.width for p in parts) + 12 * 5; Ht = max(p.height for p in parts) + 24
sheet = Image.new("RGB", (Wt, Ht), (30, 30, 30)); x = 12
for p in parts:
    sheet.paste(p, (x, 12)); x += p.width + 12
sheet.save(preview, quality=85)
print(preview)
