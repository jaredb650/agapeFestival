#!/usr/bin/env python3
"""Add the background loop (g0_bg_loop.sh) to public/assets/winter/manifest.json as background.loop.

Run after g0_bg_loop.sh. Codec strings are read from the files (profile/level), sizes and bitrates
measured, the cuts listed in loop seconds (see g0_bg_loop.sh for the edit).
"""
import json
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.path.join(HERE, "..", "..", "..", "agape-festival"))
MANIFEST = os.path.join(APP, "public", "assets", "winter", "manifest.json")
DIR = os.path.join(APP, "public", "assets", "winter", "bg-loop")


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=codec_name,profile,level,width,height,bit_rate,nb_frames:format=duration,bit_rate", "-of", "json", path],
        check=True, capture_output=True, text=True).stdout
    j = json.loads(out)
    s, f = j["streams"][0], j["format"]
    return s, f


def codec_string(s):
    lvl = int(s["level"])
    if s["codec_name"] == "h264":
        return f'video/mp4; codecs="avc1.6400{lvl:02X}"'
    if s["codec_name"] == "hevc":
        return f'video/mp4; codecs="hvc1.1.6.L{lvl}.B0"'
    if s["codec_name"] == "av1":
        return f'video/mp4; codecs="av01.0.{lvl:02d}M.08"'
    raise ValueError(s["codec_name"])


def entry(size):
    sources = []
    for suffix in ("av1.mp4", "hevc.mp4", "mp4"):
        name = f"loop-{size}.{suffix}"
        path = os.path.join(DIR, name)
        s, f = probe(path)
        sources.append({
            "src": f"/assets/winter/bg-loop/{name}",
            "type": codec_string(s),
            "codec": s["codec_name"],
            "width": s["width"],
            "height": s["height"],
            "bytes": os.path.getsize(path),
            "bitrate": int(float(f["bit_rate"])),
        })
    return {"sources": sources, "duration": round(float(probe(os.path.join(DIR, f"loop-{size}.mp4"))[1]["duration"]), 3)}


m = json.load(open(MANIFEST, encoding="utf8"))
m["background"]["loop"] = {
    "notes": "G0 grid redesign: the page background as a plain muted loop (no scrub). ~9.2 s cut from the same footage "
             "(frames 126-217, 376-438, 457-566, 115-125 @30fps): no black stretches, no glitch shots, seamless loop point. "
             "Opens on the existing poster frame (t=4.2 s). Normal 2 s GOP. Made by context/winter-redesign/media-scripts/g0_bg_loop.sh.",
    "fps": 30,
    "cuts": [3.067, 5.167, 8.833],
    "landscape": entry(1080),
    "portrait": entry(720),
}
with open(MANIFEST, "w", encoding="utf8") as fh:
    fh.write(json.dumps(m, indent=2, ensure_ascii=False) + "\n")
print(json.dumps(m["background"]["loop"], indent=2))
