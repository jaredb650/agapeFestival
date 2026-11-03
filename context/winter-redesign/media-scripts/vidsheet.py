"""Timestamped frame sheet for a video. usage: vidsheet.py VIDEO OUT.jpg [fps=2] [start=0] [dur=all] [tilew=220]"""
import json, os, subprocess, sys, tempfile, glob
from PIL import Image, ImageDraw
v, out = sys.argv[1], sys.argv[2]
fps = float(sys.argv[3]) if len(sys.argv) > 3 else 2.0
ss = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
dur = sys.argv[5] if len(sys.argv) > 5 else None
tw = int(sys.argv[6]) if len(sys.argv) > 6 else 220
pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", v], capture_output=True).stdout)
vs = [s for s in pr["streams"] if s["codec_type"] == "video"][0]
rot = ""
for sd in vs.get("side_data_list", []):
    if "rotation" in sd: rot = f" rot={sd['rotation']}"
print(f"{os.path.basename(v)}: {vs['codec_name']} {vs.get('profile','')} {vs['width']}x{vs['height']}{rot} {vs.get('r_frame_rate')} dur={float(pr['format']['duration']):.2f}s pix={vs.get('pix_fmt')} trc={vs.get('color_transfer','?')} prim={vs.get('color_primaries','?')}")
base = os.path.join(os.path.dirname(out), '_frames'); os.makedirs(base, exist_ok=True)
td = tempfile.mkdtemp(dir=base, prefix=os.path.basename(out).rsplit('.',1)[0] + '_')
cmd = ["ffmpeg", "-v", "error", "-ss", str(ss), "-i", v]
if dur: cmd += ["-t", dur]
cmd += ["-vf", f"fps={fps},scale={tw}:-2", "-q:v", "4", os.path.join(td, "f_%04d.jpg")]
subprocess.run(cmd, check=True)
fs = sorted(glob.glob(os.path.join(td, "f_*.jpg")))
ims = [Image.open(f).convert("RGB") for f in fs]
if not ims: sys.exit("no frames")
cols = max(1, min(len(ims), 1800 // tw)); rows = (len(ims) + cols - 1) // cols
w, h = ims[0].size
sheet = Image.new("RGB", (cols * w, rows * (h + 14)), "black"); d = ImageDraw.Draw(sheet)
for i, im in enumerate(ims):
    x, y = (i % cols) * w, (i // cols) * (h + 14)
    sheet.paste(im, (x, y)); d.text((x + 3, y + h + 1), f"{ss + i / fps:.1f}s", fill="yellow")
sheet.save(out, quality=75)
# frames are kept (no-deletion rule); _sheets/_frames is listed in the cleanup manifest
print(out, len(ims), "frames")
