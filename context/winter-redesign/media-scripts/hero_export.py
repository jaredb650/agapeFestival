import sys, os, json
from PIL import Image, ImageCms
D = os.path.expanduser("~/Downloads/9-5-26 AGAPE FESTIVAL")
O = sys.argv[1]
SRGB = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
jobs = [
  # out, src, crop fractions (x0,y0,x1,y1), size
  ("hero-2400.webp", "09052026_AGAPEFESTIVAL_@EMILYGUZZ-120.jpg", (0, .11, 1, .61), (2400, 1600), 76),
  ("hero-1200.webp", "09052026_AGAPEFESTIVAL_@EMILYGUZZ-120.jpg", (.2, .06, .8, .86), (1200, 2133), 76),
  ("alt-1.webp", "09052026_AGAPEFESTIVAL_@EMILYGUZZ-128.jpg", (0, .14, 1, .64), (2400, 1600), 76),
  ("alt-2.webp", "09052026_AGAPEFESTIVAL_@EMILYGUZZ-197 (1).jpg", (0, .22, 1, .72), (2400, 1600), 76),
]
for out, src, (a, b, c, d), size, q in jobs:
    im = Image.open(os.path.join(D, src))
    prof = im.info.get("icc_profile")
    desc = ImageCms.getProfileDescription(ImageCms.ImageCmsProfile(__import__("io").BytesIO(prof))) if prof else "none"
    assert "sRGB" in desc, desc
    im = im.convert("RGB")
    w, h = im.size
    im = im.crop((round(a*w), round(b*h), round(c*w), round(d*h))).resize(size, Image.LANCZOS)
    p = os.path.join(O, out)
    im.save(p, "WEBP", quality=q, method=6, icc_profile=prof)
    print(out, im.size, os.path.getsize(p))
