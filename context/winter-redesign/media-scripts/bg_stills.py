import sys, glob, os
from PIL import Image, ImageCms
J, O = sys.argv[1], sys.argv[2]
ICC = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
os.makedirs(f"{O}/frames", exist_ok=True)
fs = sorted(glob.glob(f"{J}/png720/f_*.png"))
tot = 0
for i, f in enumerate(fs):
    p = f"{O}/frames/f-{i:03d}.webp"
    Image.open(f).convert("RGB").save(p, "WEBP", quality=80, method=6, icc_profile=ICC)
    tot += os.path.getsize(p)
print(len(fs), "frames", tot)
Image.open(f"{J}/poster/p1280.png").convert("RGB").save(f"{O}/poster-desktop.webp", "WEBP", quality=82, method=6, icc_profile=ICC)
Image.open(f"{J}/poster/p720.png").convert("RGB").save(f"{O}/poster-mobile.webp", "WEBP", quality=82, method=6, icc_profile=ICC)
