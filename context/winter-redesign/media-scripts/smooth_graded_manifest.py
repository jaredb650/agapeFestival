# Point the manifest at the graded (saturate 0.3 baked) background media. Originals stay on disk.
# usage: python3 -E smooth_graded_manifest.py <app dir> <enc out dir>
import sys, os, json, subprocess
APP, OUT = sys.argv[1], sys.argv[2]
MP = os.path.join(APP, "public/assets/winter/manifest.json")
m = json.load(open(MP))
pub = lambda rel: os.path.join(APP, "public", rel.lstrip("/"))


def probe_bitrate(path):
    r = subprocess.run(["/opt/homebrew/bin/ffprobe", "-v", "error", "-show_entries", "format=bit_rate", "-of", "csv=p=0", path], capture_output=True, text=True, check=True)
    return int(r.stdout.strip())


loop = m["background"]["loop"]
for key, w in (("landscape", 1080), ("portrait", 720)):
    for s in loop[key]["sources"]:
        ext = {"av1": ".av1.mp4", "hevc": ".hevc.mp4", "h264": ".mp4"}[s["codec"]]
        new = f"/assets/winter/bg-loop/loop-graded-{w}{ext}"
        assert os.path.exists(pub(new)), new
        s["src"] = new
        s["bytes"] = os.path.getsize(pub(new))
        s["bitrate"] = probe_bitrate(pub(new))
loop["grade"] = "classic-smooth (Nov 3): .wbg's CSS saturate(0.3) is baked in (chroma x0.3 around neutral in BT.709 Y'CbCr, which is exactly CSS saturate(0.3)); the page no longer filters. Same edit, sizes, codecs, CRFs and GOP as g0_bg_loop.sh, from the same source (bg/desktop.mp4). Made by context/winter-redesign/media-scripts/smooth_graded_bg.sh. The ungraded loop-<w>.* files are unused."

bg = m["background"]
stills = json.load(open(os.path.join(OUT, "stills.json")))
for key, name in (("posterDesktop", "poster-desktop-graded.webp"), ("posterMobile", "poster-mobile-graded.webp")):
    new = f"/assets/winter/bg/{name}"
    assert os.path.exists(pub(new)), new
    bg[key]["src"] = new
    bg[key]["bytes"] = os.path.getsize(pub(new))
    bg[key]["grade"] = "saturate(0.3) baked in (classic-smooth, smooth_graded_stills.py); the ungraded file is unused."
bg["placeholder"]["dataUri"] = stills["placeholder"]["dataUri"]
bg["placeholder"]["grade"] = "saturate(0.3) baked in (classic-smooth)."

st = m["flyer"]["backgroundStill"]
new = "/assets/winter/flyer/bg-still-1080-graded.webp"
assert os.path.exists(pub(new)), new
st["src"] = new
st["bytes"] = os.path.getsize(pub(new))
st["grade"] = "saturate(0.3) baked in (classic-smooth, smooth_graded_stills.py): the page shows it under no filter now. The ungraded bg-still-1080.webp is unused."

with open(MP, "w") as f:
    json.dump(m, f, indent=2, ensure_ascii=False)
    f.write("\n")
print("manifest updated")
