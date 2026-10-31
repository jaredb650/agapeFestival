#!/usr/bin/env python3
"""Record the P3 video sources (AV1 / HEVC / H.264) and hero posters in the manifest.

Run after p3_enc_video.sh has written the files into public/ (python3 -E).
Codec strings come from the encoded streams, so MediaCapabilities checks the
real profile/level. Sources are listed best first; H.264 is always last.
"""
import json
import os
import subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "agape-festival", "public"))
MANIFEST = os.path.join(ROOT, "assets", "winter", "manifest.json")


def probe(src):
    path = os.path.join(ROOT, src.lstrip("/"))
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=codec_name,profile,level,width,height,bit_rate,pix_fmt:format=duration,size", "-of", "json", path],
        check=True, capture_output=True, text=True).stdout
    j = json.loads(out)
    s, f = j["streams"][0], j["format"]
    codec, level = s["codec_name"], int(s["level"])
    if codec == "av1":
        depth = "10" if "10" in s["pix_fmt"] else "08"
        mime = f'video/mp4; codecs="av01.0.{level:02d}M.{depth}"'
    elif codec == "hevc":
        mime = f'video/mp4; codecs="hvc1.1.6.L{level}.B0"'
    else:
        mime = f'video/mp4; codecs="avc1.6400{level:02X}"'
    return {"src": src, "type": mime, "codec": codec, "width": s["width"], "height": s["height"],
            "bytes": int(f["size"]), "bitrate": round(int(f["size"]) * 8 / float(f["duration"]))}


m = json.load(open(MANIFEST, encoding="utf8"))

bg = m["background"]["desktop"]
bg["sources"] = [probe("/assets/winter/bg/desktop.av1.mp4"), probe("/assets/winter/bg/desktop.hevc.mp4"), probe(bg["src"])]
bg["sourcesNote"] = (
    "Added by P3 (perf): same 4-frame GOP in every file (AV1 SVT crf 38 + film-grain synthesis / HEVC x265 "
    "slow crf 29, no B-frames or reordering, so a seek still decodes <= 3 extra frames). Best first; the page "
    "plays AV1/HEVC only where MediaCapabilities reports a hardware (powerEfficient) decoder, else the H.264. "
    "Grain and VMAF vs the lossless mezzanine match the H.264. Made by "
    "context/winter-redesign/media-scripts/p3_enc_video.sh."
)

hv = m["heroVideo"]
hv["sources"] = [probe("/assets/videos/winter-kobosil.av1.mp4"), probe("/assets/videos/winter-kobosil.hevc.mp4"), probe(hv["src"])]
hv["mobile"] = {
    "crop": {"x": 236, "y": 0, "width": 864, "height": 1080},
    "sources": [probe("/assets/videos/winter-kobosil-m.av1.mp4"), probe("/assets/videos/winter-kobosil-m.hevc.mp4"),
                probe("/assets/videos/winter-kobosil-m.mp4")],
    "notes": ("Added by P3 (perf): portrait crop at full source resolution for (max-aspect-ratio: 3/4). With "
              "objectPositionMobile 41% the crop shows exactly the pixels the full frame shows on any screen up "
              "to 4:5 (x = 0.41 * (1440 - 864) = 236)."),
}
posters = os.path.join(ROOT, "assets", "videos", "posters")
hv["posterWebp"] = {"src": "/assets/videos/posters/winter-crowd.webp", "width": 1440, "height": 1080,
                    "bytes": os.path.getsize(os.path.join(posters, "winter-crowd.webp")), "time": 6.5,
                    "notes": "Added by P3: the poster frame re-cut from the source (05 KOBOSIL 18.5 s), WebP q60. Replaces the JPEG on the page."}
hv["posterMobile"] = {"src": "/assets/videos/posters/winter-crowd-m.webp", "width": 864, "height": 1080,
                      "bytes": os.path.getsize(os.path.join(posters, "winter-crowd-m.webp")), "time": 6.5,
                      "notes": "Added by P3: portrait crop of posterWebp (x 236, same rule as mobile.crop)."}
with open(MANIFEST, "w", encoding="utf8") as f:
    json.dump(m, f, indent=2, ensure_ascii=False)
    f.write("\n")
for s in bg["sources"] + hv["sources"] + hv["mobile"]["sources"]:
    print(s["src"], s["type"], s["bytes"])
