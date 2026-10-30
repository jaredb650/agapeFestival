# Winter redesign: media notes (J2)

All outputs are in `agape-festival/public/assets/winter/` and described in `manifest.json` there. Read paths and sizes from the manifest; don't hard-code them. Stills are sRGB with ICC tags, and videos are H.264 High 8-bit yuv420p, tagged BT.709, with no audio track and `moov` first (faststart). `lab/` belongs to J1.

## What the page builder needs to know

- **Background, desktop** (`bg/desktop.mp4`): 1280x2276 portrait, 30 fps, 601 frames, 13.9 MB. It has a keyframe every 4 frames and no B-frames, so a `currentTime` seek decodes at most 3 extra frames. Locally, a seek costs about 20 ms more than a cold first-frame decode. The source has a 2 s GOP and took about 1.2 s per seek. Show it with `object-fit: cover`. A vertical pan down the tower works because the full portrait height is there.
- **Background, mobile** (`bg/frames/f-000.webp … f-150.webp`): 151 frames, 720x1280, 4.7 MB total. Frame `i` is at `i*4/30` s (every 4th source frame, 7.5 fps). Draw them to a canvas.
- **Posters** (`bg/poster-*.webp`): taken at 4.2 s (the antenna mast, mean luma about 38). The t=0 frame is black, so the poster won't match frame 0. Fade from the poster to the video or canvas once the first frame has drawn.
- **`brightRanges`** in the manifest: frames whose average luma is above 75/255, with peak and level. The typical range is 25–65. The whiteout is 11.97–12.50 s (peak 162). Raise the text scrim inside these ranges.
- **`cuts` / `shots`**: from scene detection (threshold 0.12) plus a visual check. The soft cuts at 7.267 s and 9.900 s were confirmed by eye. Glitch bursts are flagged `glitch: true`. The best smooth-scrub segments are 3.667–7.267 s (mast) and 15.167–20.0 s (inverted mast).
- **Hero** is a photo, not video. None of the performance videos in the repo were shot at the Sept ÄGAPĒ (one is FRONTROW/Kobosil, one is an AI-generated Veo clip, and the press-kit clips come from other events). The David Löhlein street clip is only 576x720. So the hero is `@EMILYGUZZ-120.jpg`: a DJ with his arm raised against ice-blue light columns, with crowd heads in front, which matches the flyer's steel blue and the ice accent.
  - Credit must be kept: **Photo: @EMILYGUZZ**.
  - The DJ isn't identified (no match in the Sept press-kit headshots), so ask Andres before naming him.
  - `hero-2400.webp` is 3:2, so a 16:9 cover crop still keeps both the hand and the face. `hero-1200.webp` is a 1200x2133 portrait for mobile. Suggested `object-position` values are in the manifest.
  - Alternates: `alt-1` (the same DJ from behind, facing the crowd, violet) and `alt-2` (Flash Gea at the decks, who plays Winter Day 2). A02 (wide stage and crowd, blue-white, landscape native) is another option if a crowd-first hero is wanted.
- **Flyer layers**: every `x/y/width/height` is in 2160x3840 space; multiply by the rendered width / 2160.
  - `scrim.webp` + `logos` + `title` + `day1-label` + `day1-names` + `day2-label` + `day2-names` + `date` over `bg-still-1080.webp` reproduces the v3 story flyer. The mean absolute difference is 0.85/255, i.e. visually identical; I checked it by eye.
  - `logo-mark` and `logo-festival` are `logos` split in two. Use either `logos` or the pair, not all three.
  - Text layers carry text coverage as alpha with the grain kept in the colour. Rows are split at the midpoints between bands, so no pixel appears in two layers.
  - The v3 flyers use still **0-00-13-11**, not the 15-15 still the designer's layout PNG was built on.
- **Flash Gea**: `clip.mp4` is 6.25 s (source 2.75–9.0 s, arms up at the decks), 720x1280, 24 fps, 1.05 MB at CRF 29. CRF 26 came to 1.4–1.5 MB, so I added a light hqdn3d denoise and raised CRF to land near the 1 MB target. The headshot is a 1:1 crop of the 1200x1797 press shot (full width, y 470–1670).

## Background encode tradeoffs (1280x2276, 20 s, x264 `-preset slow`)

| Setting | Size | Notes |
|---|---|---|
| all-intra CRF 24 | 36.2 MB | too big |
| all-intra CRF 28 | 18.7 MB | seek ~0 extra, still over budget |
| g4 CRF 22 | 38.8 MB | |
| g4 CRF 25 | 22.6 MB | |
| g4 CRF 25 + hqdn3d | 19.0 MB | denoise barely helps; the grain is the look |
| g4 CRF 26 + hqdn3d | 15.9 MB | |
| g4 CRF 27 | 15.3 MB | |
| **g4 CRF 27.5 (shipped)** | **13.9 MB** | at 1:1 I couldn't tell it from CRF 22 |
| g4 CRF 28 | 12.6 MB | fallback if the budget tightens |
| 1080x1920 g4 CRF 25 | 16.5 MB | lower resolution was no smaller than 1280 at CRF 27.5 |

## Commands

```bash
# mezzanine (lossless qp0, 1280x2276, BT.709; made by the first run, roughly equivalent to the line below), then the shipped background
ffmpeg -i "PLAIN V1.mp4" -an -vf scale=1280:2276:flags=lanczos -c:v libx264 -qp 0 -preset ultrafast mezz1280.mkv
ffmpeg -i mezz1280.mkv -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
  -g 4 -keyint_min 4 -sc_threshold 0 -bf 0 -crf 27.5 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -an -map_metadata -1 -movflags +faststart bg/desktop.mp4

# mobile frames: every 4th frame -> RGB PNG -> WebP q80 (PIL, method 6, sRGB ICC)
ffmpeg -i mezz1280.mkv -vf "select='not(mod(n\,4))',scale=720:1280:flags=lanczos+accurate_rnd+full_chroma_int:in_color_matrix=bt709:in_range=tv:out_range=pc,format=rgb24" -fps_mode passthrough png/f_%03d.png

# cuts / luma
ffmpeg -i mezz1280.mkv -vf "scale=180:320,select='gt(scene\,0.12)',metadata=print:file=-" -f null -
ffmpeg -i mezz1280.mkv -vf "signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=luma.txt" -f null -

# Flash Gea clip
ffmpeg -ss 2.75 -i flashgea-video.mp4 -t 6.25 -an \
  -vf "hqdn3d=2:2:3:3,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv" \
  -c:v libx264 -preset slower -profile:v high -level 4.0 -pix_fmt yuv420p -crf 29 -g 48 -bf 3 \
  -map_metadata -1 -movflags +faststart artists/flash-gea/clip.mp4
```

Photos and flyer layers were made with PIL (WebP via libwebp; `python3 -E`). The hero is q76 and the flyer layers are q90 with alpha_quality 100. The flyer split reuses the repaired-overlay code copied verbatim from `work/render.py`. The text split is `A = t + s(1−t)`, `RGB·A = c·t`, where `s` is the smoothed scrim estimate. The scripts are in the session scratchpad at `…/979a2741-…/scratchpad/j2/scripts/` (`enc_bg.sh`, `bg_stills.py`, `hero_export.py`, `flyer_layers.py`, `enc_fg.sh`, `build_manifest.py`). That location is temporary, so copy the scripts into the repo if they need to be rerun later.
