#!/usr/bin/env python3
"""Subset the winter fonts to the glyphs the site uses (run with python3 -E).

Sources (fonts-src/): Orbitron[wght].ttf and Outfit[wght].ttf from
github.com/google/fonts (OFL), ChonkyPixels.ttf (the original, formerly in
public/). Outputs:
  agape-festival/src/components/winter/load/fonts/orbitron.woff2  (wght 400-900)
  agape-festival/src/components/winter/load/fonts/outfit.woff2    (wght 300-500, one file instead of latin + latin-ext)
  agape-festival/public/assets/fonts/ChonkyPixels.woff2           (same URL globals.css uses)

Glyphs = what the site's text uses (scanned from src/, the manifest and the
built HTML: ÄGAPĒ, ▸ ◂ ▮ etc.) plus ASCII and common punctuation; Outfit and
ChonkyPixels keep all of Latin-1 for future names. Outlines, metrics and the
exact OpenType features the Google Fonts files carried are kept, so text
shapes and renders as before. Unhinted, like those files.
Run `next build` first (it scans out/), and rerun after adding copy with new
characters.
"""
import glob
import os
import subprocess
import sys

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.path.join(HERE, "..", "..", "..", "agape-festival"))
SRC = os.path.join(HERE, "fonts-src")
OUT = os.path.join(APP, "src", "components", "winter", "load", "fonts")
PYFTSUBSET = os.path.expanduser("~/Library/Python/3.9/bin/pyftsubset")
os.makedirs(OUT, exist_ok=True)

ASCII = {chr(c) for c in range(0x20, 0x7F)}
LATIN1 = {chr(c) for c in range(0xA0, 0x100)}
# Punctuation/symbols worth keeping even if unused today (quotes, dashes, bullets, euro, trademark, arrows).
SAFE = {chr(c) for c in [*range(0x2010, 0x2028), *range(0x2030, 0x203B), 0x20AC, 0x2122, *range(0x2190, 0x2194), 0x2212, 0x152, 0x153]}
# Google Fonts' "latin" subset. Orbitron was only ever served this, so its glyph set stays inside it
# (a character outside it, like Ē, keeps rendering from the fallback exactly as before).
GOOGLE_LATIN = {chr(c) for c in [*range(0x20, 0x100), 0x131, 0x152, 0x153, 0x2BB, 0x2BC, 0x2C6, 0x2DA, 0x2DC,
                                 *range(0x2000, 0x2070), 0x20AC, 0x2122, 0x2191, 0x2193, 0x2212, 0x2215]}

found = set()
files = glob.glob(os.path.join(APP, "src", "**", "*.ts*"), recursive=True)
files += glob.glob(os.path.join(APP, "src", "**", "*.css"), recursive=True)
files += glob.glob(os.path.join(APP, "out", "**", "*.html"), recursive=True)
files += [os.path.join(APP, "public", "assets", "winter", "manifest.json")]
for f in files:
    try:
        found |= set(open(f, encoding="utf8").read())
    except (UnicodeDecodeError, IsADirectoryError):
        pass
found = {c for c in found if ord(c) >= 0x20 and not (0xD800 <= ord(c) <= 0xDFFF)}
print(f"{len(found)} characters in use", file=sys.stderr)


def subset(src, out, chars, features):
    unicodes = ",".join(f"U+{ord(c):04X}" for c in sorted(chars))
    subprocess.run([PYFTSUBSET, src, f"--unicodes={unicodes}", f"--layout-features={features}", "--no-hinting",
                    "--drop-tables+=DSIG,FFTM", "--flavor=woff2", f"--output-file={out}"], check=True)
    t = TTFont(out)
    print(f"{os.path.relpath(out, APP)}: {os.path.getsize(out)} bytes, {t['maxp'].numGlyphs} glyphs")


# Feature lists = exactly what the Google Fonts files carried, so shaping is unchanged.
subset(os.path.join(SRC, "Orbitron.ttf"), os.path.join(OUT, "orbitron.woff2"), (ASCII | found | SAFE) & GOOGLE_LATIN, "kern,mark")

# Outfit: the page only sets 300/400/500, so trim the weight axis first.
tmp = os.path.join(OUT, "_outfit-300-500.ttf")
instancer.instantiateVariableFont(TTFont(os.path.join(SRC, "Outfit.ttf")), {"wght": (300, 500)}).save(tmp)
subset(tmp, os.path.join(OUT, "outfit.woff2"), ASCII | LATIN1 | found | SAFE, "ccmp,frac,liga,pnum,rvrn,tnum,kern,mark,mkmk")
os.remove(tmp)

subset(os.path.join(SRC, "ChonkyPixels.ttf"), os.path.join(APP, "public", "assets", "fonts", "ChonkyPixels.woff2"),
       ASCII | LATIN1 | found | SAFE, "")
