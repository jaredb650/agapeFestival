import sys, os, glob
from PIL import Image, ImageDraw, ImageOps
d, out = sys.argv[1], sys.argv[2]
files = sorted(glob.glob(os.path.join(d, "*.jpg")) + glob.glob(os.path.join(d, "*", "*.jpg")))
T = 300; cols = 8; per = 48
for si in range(0, len(files), per):
    chunk = files[si:si+per]
    rows = (len(chunk)+cols-1)//cols
    sheet = Image.new("RGB", (cols*T, rows*(T+18)), "black")
    dr = ImageDraw.Draw(sheet)
    for i, f in enumerate(chunk):
        im = Image.open(f); im.draft("RGB", (T*2, T*2)); im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((T, T))
        x, y = (i % cols)*T, (i//cols)*(T+18)
        sheet.paste(im, (x + (T-im.width)//2, y + (T-im.height)//2))
        name = os.path.basename(f).replace("09052026_AGAPEFESTIVAL_@EMILYGUZZ-","").replace("AGAPEFESTIVAL_@EMILYGUZZ-","A")
        sub = "FG/" if "FLASHGEA" in f else ""
        dr.text((x+4, y+T+3), f"{sub}{name} {Image.open(f).size}", fill="yellow")
    sheet.save(f"{out}_{si//per}.jpg", quality=80)
print(len(files))
