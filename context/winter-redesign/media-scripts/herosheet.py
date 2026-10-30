import sys, os
from PIL import Image, ImageOps, ImageDraw
D = os.path.expanduser("~/Downloads/9-5-26 AGAPE FESTIVAL")
# (id, file, center-y fraction for 16:9 crop)
C = [(x.split(":")[0], x.split(":")[1]) for x in sys.argv[2:]]
W, H = 800, 450
cols = 3
rows = (len(C)+cols-1)//cols
sheet = Image.new("RGB", (cols*W, rows*(H+24)), "black")
dr = ImageDraw.Draw(sheet)
for i, (n, cy) in enumerate(C):
    p = os.path.join(D, f"09052026_AGAPEFESTIVAL_@EMILYGUZZ-{n}.jpg")
    if not os.path.exists(p): p = os.path.join(D, "FLASHGEA AGAPE FESTIVAL", f"09052026_AGAPEFESTIVAL_@EMILYGUZZ-{n}.jpg")
    if not os.path.exists(p): p = os.path.join(D, f"AGAPEFESTIVAL_@EMILYGUZZ-{n[1:]}.jpg")
    im = Image.open(p); im.draft("RGB", (1600, 1600)); im = ImageOps.exif_transpose(im).convert("RGB")
    w, h = im.size; ch = int(w*9/16)
    if ch > h:
        cw = int(h*16/9); x0 = int((w-cw)*float(cy)); box = (x0, 0, x0+cw, h)
    else:
        y0 = int(max(0, min(h-ch, float(cy)*h - ch/2))); box = (0, y0, w, y0+ch)
    t = im.crop(box).resize((W, H), Image.LANCZOS)
    x, y = (i % cols)*W, (i//cols)*(H+24)
    sheet.paste(t, (x, y)); dr.text((x+6, y+H+5), f"{i+1}: {n} cy={cy}", fill="yellow")
sheet.save(sys.argv[1], quality=85)
