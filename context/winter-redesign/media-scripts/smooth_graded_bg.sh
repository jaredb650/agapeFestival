#!/usr/bin/env bash
# classic-smooth (Nov 3): the background loop with .wbg's old CSS saturate(0.3) baked in, so the page can
# drop the filter (on iOS a filter over a playing video is an offscreen pass every frame).
# Same edit, sizes, codecs, CRFs and GOP as g0_bg_loop.sh, from the same source, plus one filter: chroma
# scaled by 0.3 around neutral. In BT.709 Y'CbCr that is exactly CSS saturate(0.3) (its matrix uses the
# 709 luma weights 0.213/0.715/0.072 on gamma-encoded RGB), so Y' is untouched and there is no RGB round trip.
#   bg-loop/loop-graded-1080.{av1.mp4,hevc.mp4,mp4}  1080x1920
#   bg-loop/loop-graded-720.{av1.mp4,hevc.mp4,mp4}    720x1280
# Source: bg/desktop.mp4 was deleted in 9dda2bc; restore it first:
#   git show 9dda2bc^:agape-festival/public/assets/winter/bg/desktop.mp4 > /path/desktop.mp4
# usage: SRC=/path/desktop.mp4 OUT=/path/out smooth_graded_bg.sh [all|h264|hevc|av1]
set -euo pipefail
FF="${FF:-ffmpeg}"
SRC="${SRC:?restore bg/desktop.mp4 from git (see above) and pass SRC=}"
OUT="${OUT:?OUT=output dir}"
mkdir -p "$OUT"
GRADE="lutyuv=u='round(128+(val-128)*0.3)':v='round(128+(val-128)*0.3)'"
EDIT="[0:v]trim=start_frame=126:end_frame=218,setpts=PTS-STARTPTS[a];\
[0:v]trim=start_frame=376:end_frame=439,setpts=PTS-STARTPTS[b];\
[0:v]trim=start_frame=457:end_frame=567,setpts=PTS-STARTPTS[c];\
[0:v]trim=start_frame=115:end_frame=126,setpts=PTS-STARTPTS[d];\
[a][b][c][d]concat=n=4:v=1:a=0,format=yuv420p"
ONLY="${1:-all}"
for SIZE in 1080:1920 720:1280; do
  W="${SIZE%%:*}"
  FG="$EDIT,scale=$SIZE:flags=lanczos,$GRADE[v]"
  CRF264=27; CRF265=28; CRFAV1=36; LVL264=4.1
  if [ "$W" = 720 ]; then CRF264=27; CRF265=29; CRFAV1=38; LVL264=3.1; fi
  TAGS=(-color_range tv -colorspace bt709 -color_trc bt709 -color_primaries bt709)
  if [ "$ONLY" = all ] || [ "$ONLY" = h264 ]; then
  "$FF" -hide_banner -loglevel error -y -threads 4 -i "$SRC" -filter_complex "$FG" -map "[v]" -an \
    -c:v libx264 -preset slow -crf $CRF264 -profile:v high -level:v $LVL264 -g 60 -keyint_min 30 "${TAGS[@]}" -movflags +faststart \
    "$OUT/loop-graded-$W.mp4"
  fi
  if [ "$ONLY" = all ] || [ "$ONLY" = hevc ]; then
  "$FF" -hide_banner -loglevel error -y -threads 4 -i "$SRC" -filter_complex "$FG" -map "[v]" -an \
    -c:v libx265 -preset slow -crf $CRF265 -tag:v hvc1 -x265-params "keyint=60:min-keyint=30:pools=4:log-level=error" "${TAGS[@]}" \
    -movflags +faststart "$OUT/loop-graded-$W.hevc.mp4"
  fi
  if [ "$ONLY" = all ] || [ "$ONLY" = av1 ]; then
  "$FF" -hide_banner -loglevel error -y -threads 4 -i "$SRC" -filter_complex "$FG" -map "[v]" -an \
    -c:v libsvtav1 -preset 6 -crf $CRFAV1 -g 60 -svtav1-params "lp=2" "${TAGS[@]}" -movflags +faststart \
    "$OUT/loop-graded-$W.av1.mp4"
  fi
done
ls -la "$OUT"
