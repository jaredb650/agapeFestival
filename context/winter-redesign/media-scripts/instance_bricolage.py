# J4: instance Bricolage Grotesque (OFL 1.1) to what winter.css uses, for a lighter LCP font.
#   wght pinned 800, opsz 12-14, wdth 75-92  ->  latin 131 KB -> 43 KB.
# Inputs: the Google Fonts latin / latin-ext variable subsets (e.g. the .woff2 files
# next/font downloads into .next or out/_next/static/media).
# Usage: python3 -E instance_bricolage.py <latin.woff2> <latin-ext.woff2> <out_dir>
import os, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

latin, ext, out = sys.argv[1:4]
for src, name in [(latin, "bricolage-winter-800-latin.woff2"), (ext, "bricolage-winter-800-latin-ext.woff2")]:
    font = instancer.instantiateVariableFont(TTFont(src), {"wght": 800, "opsz": (12, 14), "wdth": (75, 92)})
    font.flavor = "woff2"
    dst = os.path.join(out, name)
    font.save(dst)
    print(dst, os.path.getsize(dst))
