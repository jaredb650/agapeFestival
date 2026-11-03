# usage: python3 -E compose.py <refdir> <portdir> <outdir>
# For each element: [c9688b5 original | port, blue palette | port, red palette], labelled.
import os, sys
from PIL import Image, ImageDraw, ImageFont

ref, port, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
PAIRS = [
    ("hero", "TargetingHud + SegmentLcd + HoloButton"),
    ("hudbar", "HudBar + ChromeNotch"),
    ("seg", "SegmentLcd"),
    ("cta", "HoloButton (primary)"),
    ("chip", "HudChip"),
    ("hudbezel", "HudBezel"),
    ("key", "ChromeKey"),
    ("armory", "PortBezel"),
    ("chip-slant", "ChromePlate (slant)"),
    ("window-chrome", "GlassWindow (chrome)"),
    ("railbezel", "RailBezel"),
    ("terminal", "TerminalFrame"),
    ("mechwindow", "MechWindow + SectorPlate"),
    ("notch", "ChromeNotch"),
    ("sockets", "ChromeSocket"),
    ("housing", "ChromeHousing"),
    ("orbs", "Orb"),
    ("ctarig", "CtaRig"),
    ("holokey", "HoloKey"),
]
PORT_NAME = {"holokey": "keys", "lcd-faq": "lcds"}
try:
    font = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 22)
except Exception:
    font = ImageFont.load_default()

def load(p, maxw):
    im = Image.open(p).convert("RGB")
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    return im

made = []
for key, title in PAIRS:
    r = os.path.join(ref, {"hudbezel": "footer-bezel"}.get(key, key) + ".png")
    pk = PORT_NAME.get(key, key)
    b = os.path.join(port, "blue-" + pk + ".png")
    rd = os.path.join(port, "red-" + pk + ".png")
    if not (os.path.exists(r) and os.path.exists(b) and os.path.exists(rd)):
        print("skip", key)
        continue
    maxw = 1500 if key in ("hero", "hudbar") else 900
    ims = [load(r, maxw), load(b, maxw), load(rd, maxw)]
    labels = ["c9688b5 original (winter-redesign preview)", "port · palette blue", "port · palette red (default)"]
    stack = key in ("hero", "hudbar", "terminal", "railbezel", "hudbezel", "housing", "ctarig")
    pad, head = 24, 44
    if stack:
        w = max(i.width for i in ims) + pad * 2
        h = sum(i.height + head for i in ims) + pad * 2 + 50
    else:
        w = sum(i.width for i in ims) + pad * 4
        h = max(i.height for i in ims) + head + pad * 2 + 50
    sheet = Image.new("RGB", (w, h), (20, 20, 20))
    d = ImageDraw.Draw(sheet)
    d.text((pad, 14), title, fill=(235, 235, 235), font=font)
    x, y = pad, 50 + pad
    for im, lab in zip(ims, labels):
        d.text((x, y), lab, fill=(150, 150, 150), font=font)
        sheet.paste(im, (x, y + head - 8))
        if stack:
            y += im.height + head
        else:
            x += im.width + pad
    p = os.path.join(out, f"sbs-{key}.png")
    sheet.save(p)
    made.append(p)
    print("saved", p)
