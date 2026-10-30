#!/bin/bash
# usage: enc_bg.sh <out.mp4> <crf> [vf]
cd "$(dirname "$0")/.."
VF=()
[ -n "$3" ] && VF=(-vf "$3")
ffmpeg -y -v error -i mezz1280.mkv "${VF[@]}" -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
  -g 4 -keyint_min 4 -sc_threshold 0 -bf 0 -crf "$2" \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -an -map_metadata -1 -movflags +faststart -threads 2 "$1"
