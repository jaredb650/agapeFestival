#!/usr/bin/env python3
"""Pack the background scrub frames into a few files ("frame packs").

The McMaster sprite trick for a frame sequence, without the sprite-sheet
memory cost: a pack is the frames' original WebP files concatenated (each one
is a self-delimiting RIFF chunk), so the client splits a pack back into the
exact same per-frame files while it streams in, and still decodes one 720x1280
frame at a time (3.7 MB) instead of a whole sheet (55 MB for 15 frames).

Only frames the scrub can show (manifest `segments`) are packed. Pack 0 holds
the frames the page needs first: the window around the page-top time, then a
sparse stride-8 sample of the whole timeline (so every scroll position has a
nearby frame early). The rest follow as contiguous runs in timeline order.

Rerun after changing frames, `segments` or BG_TIMES.top:
  python3 -E context/winter-redesign/media-scripts/p3_frame_packs.py
It rewrites agape-festival/public/assets/winter/bg/packs/ and the manifest's
background.frames.packs.
"""
import hashlib
import json
import os
import struct
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "agape-festival"))
PUB = os.path.join(ROOT, "public")
MANIFEST = os.path.join(PUB, "assets", "winter", "manifest.json")
TOP_TIME = 3.7  # BG_TIMES.top in src/components/winter/page/media.ts
RUN = 11  # frames per contiguous pack

m = json.load(open(MANIFEST, encoding="utf8"))
bg = m["background"]
fr = bg["frames"]
step = fr["sourceFrameStep"] / bg["desktop"]["fps"]
count = fr["count"]
segments = bg["segments"]
frame_dir = os.path.join(PUB, fr["dir"].strip("/"))


def frame_at(t):
    return min(count - 1, max(0, round(t / step)))


# Same rule as ScrollBackground's `playable`.
playable = [i for i in range(count) if any(s - step / 2 <= i * step <= e + step / 2 for s, e in segments)]
first = frame_at(TOP_TIME)
head = [i for i in range(first - 2, first + 8) if i in playable]
head.sort(key=lambda i: (i < first, abs(i - first)))  # playhead, then ahead, then behind
sparse = [playable[k] for k in range(0, len(playable), 8) if playable[k] not in head]
pack0 = head + sparse
rest = [i for i in playable if i not in pack0]
packs = [pack0] + [rest[k : k + RUN] for k in range(0, len(rest), RUN)]

out_dir = os.path.join(PUB, "assets", "winter", "bg", "packs")
os.makedirs(out_dir, exist_ok=True)
for f in os.listdir(out_dir):
    os.remove(os.path.join(out_dir, f))

entries = []
for n, frames in enumerate(packs):
    blob = b""
    for i in frames:
        data = open(os.path.join(frame_dir, f"f-{i:03d}.webp"), "rb").read()
        assert data[:4] == b"RIFF" and data[8:12] == b"WEBP"
        assert struct.unpack("<I", data[4:8])[0] + 8 == len(data), f"f-{i:03d}: RIFF size mismatch"
        blob += data
    h = hashlib.sha256(blob).hexdigest()[:10]
    name = f"p{n}.{h}.bin"
    open(os.path.join(out_dir, name), "wb").write(blob)
    entries.append({"src": f"/assets/winter/bg/packs/{name}", "bytes": len(blob), "frames": frames})
    print(f"{name}: {len(frames)} frames, {len(blob) / 1024:.0f} KB")

fr["packs"] = entries
fr["packsNote"] = (
    "Added by P3 (perf): the playable frames' WebP files concatenated (RIFF-delimited, byte-identical), "
    "so the scrub needs ~9 requests instead of ~90 and splits/decodes frame by frame as each pack streams in. "
    "Pack 0 = the window around the page-top time + a stride-8 sample of the timeline; the rest are timeline runs. "
    "Content-hashed names (immutable). Regenerate with context/winter-redesign/media-scripts/p3_frame_packs.py "
    "after changing frames, segments or BG_TIMES.top. The single frames stay for the artist select and as a fallback."
)
with open(MANIFEST, "w", encoding="utf8") as f:
    json.dump(m, f, indent=2, ensure_ascii=False)
    f.write("\n")
print(f"{len(playable)} playable frames in {len(packs)} packs, {sum(e['bytes'] for e in entries) / 1024:.0f} KB", file=sys.stderr)
