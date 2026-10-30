#!/bin/bash
# usage: enc_fg.sh <ss> <t> <crf> <vf> <out>
P=/Users/jaredbeguelin/code/agape-festival/agape-festival/public/assets/artists/flashgea/press-kit/flashgea-video.mp4
ffmpeg -v error -y -ss "$1" -i "$P" -t "$2" -an -vf "$4" -c:v libx264 -preset slower -profile:v high -level 4.0 -pix_fmt yuv420p -crf "$3" -g 48 -bf 3 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -map_metadata -1 -movflags +faststart "$5"
echo "$5 $(stat -f %z "$5")"
