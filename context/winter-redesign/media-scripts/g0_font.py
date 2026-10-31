#!/usr/bin/env python3
"""The grid redesign's interface face: Archivo, pinned at width 112.5 (semi-expanded), weight 400-500.

Source: fonts-src/Archivo.ttf = Archivo[wdth,wght].ttf from github.com/google/fonts (OFL, Archivo-OFL.txt).
Output: agape-festival/src/components/winter/load/fonts/archivo.woff2 (one variable file covering 400-500).

Glyphs = ASCII + Latin-1 + every character the site's source/manifest uses (ÄGAPĒ, en/em dashes, arrows,
curly quotes) + common punctuation. Features = what the interface needs (kerning, marks, tabular and lining
figures, case-sensitive forms). Rerun after adding copy with new characters (run with python3 -E).
"""
import glob
import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.path.join(HERE, "..", "..", "..", "agape-festival"))
SRC = os.path.join(HERE, "fonts-src", "Archivo.ttf")
OUT = os.path.join(APP, "src", "components", "winter", "load", "fonts", "archivo.woff2")

ASCII = {chr(c) for c in range(0x20, 0x7F)}
LATIN1 = {chr(c) for c in range(0xA0, 0x100)}

SAFE = {chr(c) for c in [*range(0x2010, 0x2028), *range(0x2030, 0x203B), 0x20AC, 0x2122, *range(0x2190, 0x2199), 0x2212]}

found = set()
files = glob.glob(os.path.join(APP, "src", "**", "*.ts*"), recursive=True)
files += glob.glob(os.path.join(APP, "src", "**", "*.css"), recursive=True)
files += [os.path.join(APP, "public", "assets", "winter", "manifest.json")]
for f in files:
    try:
        found |= set(open(f, encoding="utf8").read())
    except (UnicodeDecodeError, IsADirectoryError):
        pass

font = TTFont(SRC)
inst = instancer.instantiateVariableFont(font, {"wdth": 112.5, "wght": (400, 500)})
chars = ASCII | LATIN1 | SAFE | {c for c in found if c in {chr(u) for u in inst.getBestCmap()}}

opts = subset.Options()
opts.flavor = "woff2"
opts.hinting = False
opts.layout_features = ["kern", "mark", "mkmk", "ccmp", "locl", "liga", "rvrn", "tnum", "pnum", "lnum", "case"]
opts.drop_tables += ["DSIG", "FFTM"]
opts.name_IDs = ["*"]
sub = subset.Subsetter(opts)
sub.populate(unicodes=[ord(c) for c in chars])
sub.subset(inst)
inst.flavor = "woff2"
inst.save(OUT)
print(f"{os.path.relpath(OUT, APP)}: {os.path.getsize(OUT)} bytes, {inst['maxp'].numGlyphs} glyphs, {len(chars)} chars", file=sys.stderr)
