#!/usr/bin/env bash
# Grid redesign (G0): the page background as a plain LOOP of the tower footage.
#
# The scroll scrub is retired, so the 4-frame-GOP encodes it needed are overkill. This cuts a calm,
# seamless ~9.2 s loop out of the same footage (agapeFest PLAIN V1, via the existing bg/desktop.mp4)
# and encodes it with a normal GOP at two sizes, in AV1 / HEVC / H.264 (load/videoSource.ts picks):
#   bg-loop/loop-1080.{av1.mp4,hevc.mp4,mp4}  1080x1920  landscape screens (shown full width, panned)
#   bg-loop/loop-720.{av1.mp4,hevc.mp4,mp4}    720x1280  portrait screens
#
# The edit (source frames @30 fps), skipping the black/near-black stretches and every glitch shot
# (inverted flashes, fog whiteout, ghost negative):
#   126-217  antenna mast top, slow drift (opens on the existing poster frame, t=4.2 s)
#   376-438  lattice column, interior lights (holds the flyer's own still, t=13.367 s)
#   457-566  upside-down antenna mast, slow drift
#   115-125  antenna mast top, the 11 frames just before 126, so the loop point is continuous
# Hard cuts inside the loop (loop seconds): 3.067, 5.167, 8.833. The page reads them from the manifest
# (background.loop.cuts) to glitch the flyer layers on a cut, as the scrub used to.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
APP="$HERE/../../../agape-festival"
SRC="$APP/public/assets/winter/bg/desktop.mp4"
OUT="$APP/public/assets/winter/bg-loop"
mkdir -p "$OUT"

EDIT="[0:v]trim=start_frame=126:end_frame=218,setpts=PTS-STARTPTS[a];\
[0:v]trim=start_frame=376:end_frame=439,setpts=PTS-STARTPTS[b];\
[0:v]trim=start_frame=457:end_frame=567,setpts=PTS-STARTPTS[c];\
[0:v]trim=start_frame=115:end_frame=126,setpts=PTS-STARTPTS[d];\
[a][b][c][d]concat=n=4:v=1:a=0,format=yuv420p"

for SIZE in 1080:1920 720:1280; do
  W="${SIZE%%:*}"
  FG="$EDIT,scale=$SIZE:flags=lanczos[v]"
  CRF264=27; CRF265=28; CRFAV1=36; LVL264=4.1
  if [ "$W" = 720 ]; then CRF264=27; CRF265=29; CRFAV1=38; LVL264=3.1; fi
  ffmpeg -hide_banner -loglevel error -y -i "$SRC" -filter_complex "$FG" -map "[v]" -an \
    -c:v libx264 -preset slow -crf $CRF264 -profile:v high -level:v $LVL264 -g 60 -keyint_min 30 -movflags +faststart \
    "$OUT/loop-$W.mp4"
  ffmpeg -hide_banner -loglevel error -y -i "$SRC" -filter_complex "$FG" -map "[v]" -an \
    -c:v libx265 -preset slow -crf $CRF265 -tag:v hvc1 -x265-params "keyint=60:min-keyint=30:log-level=error" \
    -movflags +faststart "$OUT/loop-$W.hevc.mp4"
  ffmpeg -hide_banner -loglevel error -y -i "$SRC" -filter_complex "$FG" -map "[v]" -an \
    -c:v libsvtav1 -preset 6 -crf $CRFAV1 -g 60 -svtav1-params "lp=2" -movflags +faststart \
    "$OUT/loop-$W.av1.mp4"
done
ls -la "$OUT"
