"""Encode a roster clip from segments, each with its own crop, to 576x720 (4:5) muted H.264.
usage: enc_clip.py SPECFILE SLUG OUT.mp4 CRF
SPECFILE lines: slug|src|fps|seg;seg;...   seg = start-end@cw:ch:x:y
Recipe = media-scripts/enc_fg_agape.sh (hqdn3d 2:2:3:3, x264 slower High L4.0, g60 bf3, BT.709 tags, faststart, no audio).
"""
import subprocess, sys
spec, slug, out, crf = sys.argv[1:5]
for line in open(spec):
    line = line.strip()
    if not line or line.startswith("#"): continue
    s, src, fps, segs = line.split("|")
    if s != slug: continue
    parts, labels = [], []
    for i, seg in enumerate(segs.split(";")):
        t, c = seg.split("@"); a, b = t.split("-"); cw, ch, x, y = c.split(":")
        parts.append(f"[0:v]trim=start={a}:end={b},setpts=PTS-STARTPTS,crop={cw}:{ch}:{x}:{y},"
                     f"scale=576:720:flags=lanczos:out_range=tv,fps={fps},setsar=1[s{i}]")
        labels.append(f"[s{i}]")
    fc = ";".join(parts) + ";" + "".join(labels) + f"concat=n={len(labels)}:v=1:a=0,hqdn3d=2:2:3:3," \
         "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv,format=yuv420p[v]"
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", src, "-an", "-sn", "-dn", "-filter_complex", fc, "-map", "[v]",
           "-c:v", "libx264", "-preset", "slower", "-profile:v", "high", "-level", "4.0", "-pix_fmt", "yuv420p",
           "-crf", crf, "-g", "60", "-bf", "3", "-color_primaries", "bt709", "-color_trc", "bt709",
           "-colorspace", "bt709", "-color_range", "tv", "-map_metadata", "-1", "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)
    print(out)
    break
else:
    sys.exit(f"no spec for {slug}")
