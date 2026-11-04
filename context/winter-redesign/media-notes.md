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
  - **Nov 3: replaced by `clip-agape.mp4`** (the old `clip.mp4` / `clip-poster.webp` are unreferenced and await deletion). Source: his press kit's `clips/Agape Festival/CF1_nyx3.mov`, a 19.6 s 1280x720 HEVC 29.97 F2F-at-ÄGAPĒ recap. Only three shots are him (the "the bronx" cap); the rest are another DJ, and a centred F2F logo covers everything before 9.63 s. Cut B 13.33–15.38 + C 17.52–19.55 + A 9.70–10.98 (B first for a face-on poster), 4:5 crop at native res (576x720, x 352–928, which also drops the corner watermarks), CRF 24 + hqdn3d: 5.3 s, 746 KB. CRF 22 was 950 KB with no visible gain. Script: `media-scripts/enc_fg_agape.sh`; `clip-agape-poster.webp` is frame 0 at q80.
- **Diossa** (Nov 3): `headshot-600/1200.webp` from her press kit's `_DSC3806 4.JPG` (Sony A7IV, 4672x7008, **Adobe RGB**, converted to sRGB). Square crop 3738 px at (771, 1261), q80: 19 KB / 50 KB. Tile focus `52% 36%`, zoom 1.5. Her "New Press Shots" (four iPhone HEICs) are full-body on white or in profile, so they were not used. Script: `media-scripts/export_headshot.py SRC OUTDIR PREVIEW 0.8 0.565 0.18 0.52 0.36 1.5 80`.
- **Winter roster from the press kits** (Nov 3, "epk2"): Fenimore, Überkikz, Ben Klock, Len Faki, Cara Elizabeth, Mika Heggemann, Davyboi, Kuko, Onlynumbers and Vendex, each in `artists/<slug>/`. Azzel 447 and Johannes Schuster came later (below). The specs are `media-scripts/roster_kit_headshots.txt` and `roster_kit_clips.txt`.
  - **Sources.** Drive kits (Liminal/Diagonal) were listed with `media-scripts/drive_tree.py`, which reads the public `embeddedfolderview` page and returns names and IDs without the connector's JSON. Contact sheets were built from `drive.google.com/thumbnail?id=…&sz=w700`, so only the chosen originals were downloaded (`drive.usercontent.google.com/download?id=…&confirm=t`). Davyboi's Dropbox folder serves a 6.99 GB zip from `dl=1` with no Range support. Per-file links come from the web listing endpoint (`POST /list_shared_link_folder_entries` with the page's `t` cookie and each subfolder's `secureHash` + `sub_path`). Its photo was carved out of a 261 MB partial of the zip (stored entries, data descriptors).
  - **Headshots.** `export_headshot.py` (ICC to sRGB, square crop, LANCZOS) at **q76** for all ten. The q80→q76 step roughly halved the 1200s (Fenimore 104→77 KB) with no visible change at 1:1. Sizes: 600s are 11–29 KB and 1200s are 35–89 KB. Ben Klock, Fenimore and Davyboi are Adobe RGB and Len Faki is ProPhoto; all were converted. Davyboi's original is 8736x11648 (PIL's bomb warning is harmless).
  - **Clips.** `enc_clip.py` takes per-segment crops (each scaled to 576x720), concatenates them, then applies Flash Gea's recipe (hqdn3d 2:2:3:3, x264 slower High L4.0, g60 bf3, BT.709 tags, faststart, no audio). 4K, 9:16, 60 fps and full-range (yuvj) sources all end at 576x720 tv-range at 25/30 fps. CRF was set per clip to land at 0.6–1.0 MB: Davyboi 29 (fisheye crowd: 1.8 MB at CRF 24; 29 looked the same at 1:1), Überkikz/Cara 28, Ben/Onlynumbers/Mika 26, Len/Fenimore/Kuko 24. The first segment is chosen for a face-on poster; `clip-poster.webp` is frame 0 at q80. Ben Klock's Boiler Room clip skips 0–10 s (BR logo and name cards). Mika's Boiler Room highlight was rejected for BR backdrops, and the Schrotty Cologne take was used instead. Vendex's kit has no video. Davyboi's clip shows the venue's "unreal" backdrop behind him.
- **Johannes Schuster** (Nov 3, Liminal kit `1am7UjakRplPq41JzSjnJzlr7am1frWUH`). **Headshot:** `Pressphotos/IMG_6154.JPEG` (Feb 2026 shoot, 4437x6655, no ICC so treated as sRGB): black bomber on red, studio key light, direct gaze. The 2025 `DSC04526` (leather coat, shutter wall) frames well too, but its grain and stripes made the 1200 154 KB at q76; the "AI BG" variant was skipped. Square 0.75 W at cx 0.42, top 0.02, q76: 15 KB / 49 KB; tile focus `40% 36%`, zoom 1.35. **Clip:** `Promo Videos/Kopie von copy_B01F76FE-ED44-4143-9407-E4BB451ABE6B.mov` (2160x2160 HEVC 50 fps, 30 s, P3 primaries tagged smpte432 and retagged BT.709 like the others). Shots 21.58–24.30 (face-on at the mixer, poster) + 10.62–12.12 + 2.38–4.40 (arm up), 4:5 crop x 216, 25 fps, CRF 24: 6.2 s, 913 KB. The kit's other videos are Boiler Room renders (BR logo/name cards), dark wide crowd shots or screen recordings. Bio: the kit text complete, with "Agape" → "ÄGAPĒ" and "NineTimesNineSoma" → "NineTimesNine, Soma".
- **Azzel 447** (Nov 3, Liminal kit `1KHj9tEpbKwQY-9kbfZpl1MuFLsKKOQwb`): a technical/hospitality rider PDF and a "P R E S S  P I C" shortcut to four JPEGs by Marvin Ruppert (June 2026, 2000x3000, no ICC): 207 and 212 in colour (green/violet light) plus `sw` black-and-white copies. **No bio, no video** anywhere in the kit, so the bio stays pending and `clip: false`. Headshot: `260605-azzel447-207-foto-marvin-ruppert.jpg` (212 covers the face with both hands), square 0.8 W at cx 0.5, top 0.1, q76: 23 KB / 66 KB; focus `49% 33%`, zoom 1.35. The rider's billing clause says promotion must use only "AZZel 447 (44 FRONT ROW)" and only press-kit material; the site shows "Azzel 447" / "AZZEL 447" as on the flyer (flagged to Jared).
- **Diossa clip** (Nov 4): from her Drive "Videos" folder `1-1_jGj989ZUw8a527Rb0szeLYAJh4Ppr` (owner diossamusic@gmail.com, ~45 clips: EDC, Ägape NYC Kuko, NYC, recaps, BAUM, HÖR ADE, Bogotá). Picked `Agape NYC Kuko.MOV` (`1kWOrNl_xXb03NxkCEkukFsJ-u48lIzHK`, 1920x1080 H.264 23.976, BT.709, 39 s): her ÄGAPĒ NYC set, a packed room, her at the decks. Kuko 2 was dark and all from behind. Shots 0.00–2.40 (profile at the decks, face lit: poster) + 15.10–16.70 (green light, crowd past her) + 21.95–24.10 (arms up to the room), 864x1080 crops scaled to 576x720, native 23.976 fps, `enc_clip.py` at CRF 22: 6.1 s, 684 KB (CRF 24 was 514 KB; the dark footage compresses well). Spec line in `roster_kit_clips.txt`; `clip-poster.webp` is frame 0 at q80.

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
