"""Shadow silhouettes of the merch blanks for the locked merch section (public/assets/winter/merch).

usage: python3 -E merch_silhouettes.py <src-dir> <out-dir>
  <src-dir> holds the September line's two front cut-outs (PNG with alpha, 1200 wide, the garment on a
  transparent ground): liberty-tee-tee_front.png and liberty-hoodie-hoodie_front.png. All four pieces
  used the same two blanks, so these give every shape.
  Writes <out-dir>/{tee,hoodie}-{front,back}-{640,1280}.png; encode each with
  `cwebp -q 80 -alpha_q 90 -m 6 -sharp_yuv in.png -o in.webp`.

We keep the true outline (the alpha) and the cloth's own folds, erase every print and label (inpaint,
then lay the cloth's grain back over the patch), push the tone down to near-black, light it from above
and run a hairline rim round the edge. Back views reuse the same photograph: the front-only features
(the collar dip and neck opening, the hood opening, the pocket) are inpainted away and a back collar /
hood seam is drawn in. Check the result at 6x brightness: no print may survive, even as a ghost.
"""
import os, sys, numpy as np, cv2
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else 'src'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'out'

def load(f):
    im = np.array(Image.open(f).convert('RGBA')).astype(np.float32)
    rgb, a = im[..., :3], im[..., 3] / 255.0
    lum = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    return lum, a

def bleed(lum, a):
    """Extend the cloth's tone past the outline so inpainting near the edge never pulls in background."""
    w = cv2.GaussianBlur(a, (0, 0), 25)
    v = cv2.GaussianBlur(lum * a, (0, 0), 25)
    fill = v / np.maximum(w, 1e-4)
    return np.where(a > 0.5, lum, fill)

def poly_mask(shape, polys=(), lines=(), dilate=0):
    m = np.zeros(shape, np.uint8)
    for p in polys:
        cv2.fillPoly(m, [np.array(p, np.int32)], 255, lineType=cv2.LINE_AA)
    for pts, th in lines:
        cv2.polylines(m, [np.array(pts, np.int32)], False, 255, th, lineType=cv2.LINE_AA)
    m = (m > 0).astype(np.uint8) * 255
    if dilate:
        m = cv2.dilate(m, np.ones((dilate, dilate), np.uint8))
    return m

def bright_mask(lum, a, region, thr):
    """Print/label pixels: much brighter than the cloth, inside a box."""
    x0, y0, x1, y1 = region
    m = np.zeros(lum.shape, np.uint8)
    sub = lum[y0:y1, x0:x1]
    m[y0:y1, x0:x1] = ((sub > thr) & (a[y0:y1, x0:x1] > 0.2)).astype(np.uint8) * 255
    return cv2.dilate(m, np.ones((9, 9), np.uint8))

def inpaint(lum, mask, r=9, tex_from=(0, 0)):
    """Fill `mask` from its surroundings, then lay the cloth's own grain back over the fill (borrowed
    from a clean patch `tex_from` = (dy, dx) away), so the patch has no smooth tell."""
    l8 = np.clip(lum * 4, 0, 255).astype(np.uint8)  # cloth sits at ~5-40: scale up for 8-bit precision
    mask = cv2.dilate(mask, np.ones((13, 13), np.uint8))  # take the print's soft halo too
    out = cv2.inpaint(l8, mask, r, cv2.INPAINT_TELEA).astype(np.float32) / 4
    low = cv2.GaussianBlur(out, (0, 0), 10)
    grain = lum - cv2.GaussianBlur(lum, (0, 0), 3)
    grain = np.roll(grain, tex_from, axis=(0, 1))
    # Feather outwards only: the whole mask is replaced, the blend runs into the cloth around it.
    k = cv2.GaussianBlur(cv2.dilate(mask, np.ones((15, 15), np.uint8)).astype(np.float32) / 255, (0, 0), 4)
    k = np.maximum(k, (mask > 0).astype(np.float32))
    return lum * (1 - k) + (low + grain) * k

def seam(lum, pts, depth=3.0, light=1.6, width=3):
    """A stitched seam: a dark groove with a faint lit lip just under it."""
    g = np.zeros(lum.shape, np.uint8)
    cv2.polylines(g, [np.array(pts, np.int32)], False, 255, width, lineType=cv2.LINE_AA)
    g = cv2.GaussianBlur(g.astype(np.float32) / 255, (0, 0), 1.0)
    lip = np.roll(g, 3, axis=0)
    return lum - depth * g + light * lip

def calm(lum, a, from_y, keep=0.4):
    """Soften the mid-size mottling in the lower body (the hoodie mockup's dark blotches) while keeping
    the fine detail (seams, the pocket) and the broad light: split the bands, damp the middle one."""
    lo = cv2.GaussianBlur(lum, (0, 0), 40)
    fine = cv2.GaussianBlur(lum, (0, 0), 4)
    hi, mid = lum - fine, fine - lo
    ys, _ = np.where(a > 0.5)
    top, bot = ys.min(), ys.max()
    y = (np.arange(lum.shape[0], dtype=np.float32)[:, None] - top) / (bot - top)
    w = np.clip((y - from_y) / 0.15, 0, 1)  # 0 above from_y, 1 from 15% below it
    return lo + mid * (1 - w * (1 - keep)) + hi


def tone(lum, a):
    inside = lum[a > 0.6]
    lo, hi = np.percentile(inside, [0.5, 99.7])
    t = np.clip((lum - lo) / (hi - lo), 0, 1)
    h = lum.shape[0]
    ys, xs = np.where(a > 0.5)
    top, bot = ys.min(), ys.max()
    y = (np.arange(h, dtype=np.float32)[:, None] - top) / (bot - top)
    light = np.clip(1.08 - 0.42 * y, 0.62, 1.08)  # lit from above, sinking into the plate
    return (14 + 27 * t ** 0.9) * light  # ~#0b..#20 grey

def render(lum, a, width, name):
    h0, w0 = lum.shape
    # Crop to the garment with a small margin, then resize.
    ys, xs = np.where(a > 0.02)
    pad = 6
    x0, x1, y0, y1 = max(xs.min() - pad, 0), min(xs.max() + pad, w0), max(ys.min() - pad, 0), min(ys.max() + pad, h0)
    lum, a = lum[y0:y1, x0:x1], a[y0:y1, x0:x1]
    s = width / lum.shape[1]
    size = (width, round(lum.shape[0] * s))
    g = cv2.resize(lum, size, interpolation=cv2.INTER_AREA)
    al = cv2.resize(a, size, interpolation=cv2.INTER_AREA)
    # Rim: a hairline of light just inside the outline (~1.5px at this size).
    ab = (al > 0.5).astype(np.uint8)
    er = cv2.erode(ab, np.ones((3, 3), np.uint8), iterations=1)
    rim = cv2.GaussianBlur((ab - er).astype(np.float32), (0, 0), 0.7)
    rim = np.clip(rim * 1.6, 0, 1)
    # Inner glow-free falloff: the cloth darkens a touch towards the edge so the rim separates.
    dist = cv2.distanceTransform(ab, cv2.DIST_L2, 5)
    edge_dark = np.clip(dist / (0.03 * width), 0, 1) * 0.25 + 0.75
    v = g * edge_dark + rim * 58
    v = v + (np.random.default_rng(7).random(v.shape) - np.random.default_rng(8).random(v.shape)) * 0.8  # dither: no banding
    v = np.clip(v, 0, 255)
    rgba = np.dstack([v, v, v, np.clip(al, 0, 1) * 255]).astype(np.uint8)
    Image.fromarray(rgba).save(f'{OUT}/{name}-{width}.png')
    return rgba

def build():
    res = {}
    # ---- Tee ----
    lum, a = load(os.path.join(SRC, 'liberty-tee-tee_front.png'))
    lum = bleed(lum, a)
    logo = bright_mask(lum, a, (530, 225, 670, 305), 36)
    front = inpaint(lum, logo, 9, (-200, 0))
    res['tee-front'] = (front, a)
    # Back: fill the front collar dip and the neck opening, then a shallow back collar band.
    collar = poly_mask(lum.shape, polys=[[(436, 0), (764, 0), (756, 20), (740, 38), (716, 86), (684, 130), (642, 160),
                                          (600, 172), (558, 160), (516, 130), (484, 86), (460, 38), (444, 20)]], dilate=7)
    back = inpaint(front, collar | logo, 15, (-350, 0))
    back = seam(back, [(452, 24), (500, 30), (550, 33), (600, 34), (650, 33), (700, 30), (748, 24)], depth=4.0, light=2.0)
    res['tee-back'] = (back, a)
    # ---- Hoodie ----
    lum, a = load(os.path.join(SRC, 'liberty-hoodie-hoodie_front.png'))
    lum = bleed(lum, a)
    logo = bright_mask(lum, a, (535, 270, 665, 345), 36)
    label = poly_mask(lum.shape, polys=[[(572, 148), (634, 148), (630, 196), (605, 202), (574, 196)]], dilate=9)
    front = inpaint(lum, logo | label, 9, (-250, 0))
    front = calm(front, a, 0.45)
    res['hoodie-front'] = (front, a)
    hood = poly_mask(lum.shape, polys=[[(453, 42), (504, 27), (600, 24), (714, 33), (747, 51), (732, 90), (684, 132), (636, 174),
                                        (609, 198), (582, 190), (540, 200), (501, 194), (471, 120), (453, 66)]], dilate=9)
    pocket = poly_mask(lum.shape, lines=[([(456, 620), (430, 700), (400, 782)], 16), ([(548, 628), (640, 630), (742, 628)], 18),
                                         ([(734, 624), (760, 700), (792, 786)], 16)])
    back = inpaint(front, hood, 15, (-300, 0))
    back = inpaint(back, pocket, 9, (200, 0))
    # Back of the hood: its centre seam, and where it meets the body.
    back = seam(back, [(600, 16), (601, 80), (602, 150), (603, 214)], depth=3.5, light=1.6)
    back = seam(back, [(452, 196), (500, 214), (550, 222), (603, 225), (656, 222), (706, 214), (752, 196)], depth=3.0, light=1.6)
    res['hoodie-back'] = (back, a)
    for k, (l, al) in res.items():
        for w in (640, 1280):
            render(tone(l, al), al, w, k)

build()
print('done')
