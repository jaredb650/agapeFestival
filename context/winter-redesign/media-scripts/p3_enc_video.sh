#!/bin/bash
# P3 perf pass: AV1 + HEVC companions for the two big decorative videos, plus
# the portrait-crop mobile hero. H.264 stays the last-resort fallback (the
# page uses AV1/HEVC only where the device decodes them in hardware).
#   bg/desktop.*       scroll-scrubbed: keyframe every 4 frames, no B-frames/reordering,
#                      so a currentTime seek decodes <= 3 extra frames, same as the H.264.
#                      HEVC crf 29 keeps the grain like the H.264 at 57% of the bytes; AV1
#                      plain smooths the grain away, so it carries film-grain synthesis.
#   winter-kobosil.*   looping hero (desktop): long GOP; VMAF at/above the shipped H.264.
#   winter-kobosil-m.* portrait crop 864x1080 from x=236 at full source resolution: with
#                      object-position 41% the crop lands every portrait (<= 4:5) screen on
#                      exactly the pixels the full frame shows there (x0 = 0.41 * (1440 - 864)).
#                      Phone-tuned rates (VMAF ~90-92 on the 1080p model).
# Results (Oct 30): bg 13.9 MB H.264 -> AV1 7.0 / HEVC 7.9; hero 11.0 -> AV1 7.2 / HEVC 8.4;
#                   phone hero 11.0 -> AV1 2.5 / HEVC 3.3 / H.264 4.1.
# Usage: p3_enc_video.sh <mezz1280.mkv> <"05 KOBOSIL.mp4"> <out dir>
# (mezz1280.mkv = lossless 1280x2276 scale of "PLAIN V1.mp4", see media-notes.md.)
# Then copy into public/ and run p3_manifest_video.py.
set -euo pipefail
MEZZ="$1"; KOB="$2"; OUT="$3"
mkdir -p "$OUT"
COLOR=(-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv)
X265_SCRUB="keyint=4:min-keyint=4:scenecut=0:bframes=0:open-gop=0:no-info=1:log-level=error"
SVT_SCRUB="irefresh-type=2:scd=0:enable-overlays=0:hierarchical-levels=2:lp=4:film-grain=8"
X265_LOOP="keyint=50:min-keyint=25:bframes=4:no-info=1:log-level=error"

# ---- scroll-scrubbed background (1280x2276, 30 fps) ----
ffmpeg -hide_banner -loglevel error -y -i "$MEZZ" -an -map_metadata -1 \
  -c:v libx265 -preset slow -crf 29 -pix_fmt yuv420p -tag:v hvc1 -x265-params "$X265_SCRUB" \
  "${COLOR[@]}" -movflags +faststart "$OUT/desktop.hevc.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$MEZZ" -an -map_metadata -1 \
  -c:v libsvtav1 -preset 5 -crf 38 -g 4 -pix_fmt yuv420p10le -svtav1-params "$SVT_SCRUB" \
  "${COLOR[@]}" -movflags +faststart "$OUT/desktop.av1.mp4"

# ---- hero clip: source 00:12 to the end (15.64 s), 1440x1080, 25 fps ----
HERO_IN=(-ss 12 -i "$KOB" -an -map_metadata -1)
ffmpeg -hide_banner -loglevel error -y "${HERO_IN[@]}" \
  -c:v libx265 -preset slow -crf 27 -pix_fmt yuv420p -tag:v hvc1 -x265-params "$X265_LOOP" \
  "${COLOR[@]}" -movflags +faststart "$OUT/winter-kobosil.hevc.mp4"
ffmpeg -hide_banner -loglevel error -y "${HERO_IN[@]}" \
  -c:v libsvtav1 -preset 5 -crf 36 -g 50 -pix_fmt yuv420p10le -svtav1-params lp=4 \
  "${COLOR[@]}" -movflags +faststart "$OUT/winter-kobosil.av1.mp4"

# ---- mobile hero: portrait crop ----
CROP="crop=864:1080:236:0"
ffmpeg -hide_banner -loglevel error -y "${HERO_IN[@]}" -vf "$CROP" \
  -c:v libx264 -preset slower -profile:v high -crf 30 -pix_fmt yuv420p -g 50 -bf 3 \
  "${COLOR[@]}" -movflags +faststart "$OUT/winter-kobosil-m.mp4"
ffmpeg -hide_banner -loglevel error -y "${HERO_IN[@]}" -vf "$CROP" \
  -c:v libx265 -preset slow -crf 32 -pix_fmt yuv420p -tag:v hvc1 -x265-params "$X265_LOOP" \
  "${COLOR[@]}" -movflags +faststart "$OUT/winter-kobosil-m.hevc.mp4"
ffmpeg -hide_banner -loglevel error -y "${HERO_IN[@]}" -vf "$CROP" \
  -c:v libsvtav1 -preset 5 -crf 46 -g 50 -pix_fmt yuv420p10le -svtav1-params lp=4 \
  "${COLOR[@]}" -movflags +faststart "$OUT/winter-kobosil-m.av1.mp4"
ls -l "$OUT"
