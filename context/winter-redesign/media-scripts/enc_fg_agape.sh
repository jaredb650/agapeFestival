#!/bin/bash
# Flash Gea at AGAPE (F2F, Sept 2026): his three shots from CF1_nyx3.mov (1280x720 HEVC 29.97),
# B 13.33-15.38 / C 17.52-19.55 / A 9.70-10.98 (the F2F logo is gone by 9.63; other cuts are the other DJ).
# 4:5 crop at native res (576x720, x 352-928: his face in every shot, corner watermarks out).
# usage: enc_fg_agape.sh SRC.mov OUT.mp4 CRF
set -euo pipefail
SRC="$1"; OUT="$2"; CRF="${3:-26}"
ffmpeg -v error -y -i "$SRC" -an -sn -dn -filter_complex "\
[0:v]trim=start=13.33:end=15.38,setpts=PTS-STARTPTS[b];\
[0:v]trim=start=17.52:end=19.55,setpts=PTS-STARTPTS[c];\
[0:v]trim=start=9.70:end=10.98,setpts=PTS-STARTPTS[a];\
[b][c][a]concat=n=3:v=1:a=0,crop=576:720:352:0,hqdn3d=2:2:3:3,\
setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -preset slower -profile:v high -level 4.0 -pix_fmt yuv420p -crf "$CRF" -g 60 -bf 3 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -map_metadata -1 -movflags +faststart "$OUT"
