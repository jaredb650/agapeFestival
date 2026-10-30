# ÄGAPĒ Festival Winter Edition: asset inventory

Compiled 2026-10-30 for the winter redesign (branch `winter-redesign`). Paths are relative to the repo root `/Users/jaredbeguelin/code/agape-festival` unless absolute.

Contact sheets (session scratchpad, temporary):
- `/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/979a2741-d728-4f09-b748-8580cd788971/scratchpad/contact_PLAIN.jpg` (12 frames, one every 1.67 s)
- `/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/979a2741-d728-4f09-b748-8580cd788971/scratchpad/contact_PLAIN_dense.jpg` (60 frames, one every 0.33 s)
- `/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/979a2741-d728-4f09-b748-8580cd788971/scratchpad/contact_REEL.jpg`
- `/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/979a2741-d728-4f09-b748-8580cd788971/scratchpad/contact_party.jpg` (existing site party and artist clips)
- `/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/979a2741-d728-4f09-b748-8580cd788971/scratchpad/contact_flashgea_sept.jpg`

---

## 1. WinterReel extraction

| Archive | Contents (`unzip -l`) | Extracted to |
|---|---|---|
| `~/Downloads/REEL.zip` (199 MB) | one empty `/` dir entry + `AGAPE WINTER FEST LINE UP 001 REEL V1.mp4` (**with text**) | `agapeFest_Assets/WinterReel/` |
| `~/Downloads/ANIMATION.zip` (192 MB) | one empty `/` dir entry + `AGAPE WINTER FEST LINE UP 001 PLAIN V1.mp4` (**no text**: the scroll-scrub background) | `agapeFest_Assets/WinterAnimation/` |

- "Reel and Animation" is two zips: REEL.zip holds the **with-text** version, and ANIMATION.zip holds the **no-text** version ("PLAIN"). Both were extracted into new, empty directories. The PLAIN file's CRC32 matches the zip entry (`0d3263c4`).
- **No-text animation (scroll-scrub background):** `agapeFest_Assets/WinterAnimation/AGAPE WINTER FEST LINE UP 001 PLAIN V1.mp4`
- No `__MACOSX`, no scripts, nothing executable. The absolute `/` entry was stripped harmlessly by unzip. The archive set the mp4s' execute bit; it has been removed (`chmod a-x`).

### Gitignore status: NOT ignored (problem)

- `git check-ignore -v agapeFest_Assets/...` matches nothing (exit 1). The root `.gitignore` only covers `.DS_Store`, `node_modules/`, `.next/`, `out/`, `*.tsbuildinfo`, `next-env.d.ts`, `.env*`, `.vercel`.
- `agapeFest_Assets/` is **already tracked**: 41 files committed, including `Flyer/3DFlyer_animated/AGAPE-FEST-WITH-AUDIO-V2.mp4`, logos and the full-size pics.
- `git status` now shows `?? agapeFest_Assets/WinterReel/` and `?? agapeFest_Assets/WinterAnimation/` (also untracked: `context/winter-redesign/`). Both mp4s are about 200 MB each, more than double GitHub's 100 MB hard limit per file. A `git add -A` / `git add .` would include them and the push would be rejected.
- **Recommended:** add `agapeFest_Assets/WinterReel/` and `agapeFest_Assets/WinterAnimation/` (or `*.mp4` / `*.mov` under `agapeFest_Assets/`) to `.gitignore` before any broad `git add`. (Not done, because this task says not to touch site code or commit.)

---

## 2. WinterReel + WinterAnimation videos: technical specs

| | REEL V1 (with text) | PLAIN V1 (no text) |
|---|---|---|
| Path | `agapeFest_Assets/WinterReel/AGAPE WINTER FEST LINE UP 001 REEL V1.mp4` | `agapeFest_Assets/WinterAnimation/AGAPE WINTER FEST LINE UP 001 PLAIN V1.mp4` |
| Size | 208.9 MB | 200.9 MB |
| Duration | 20.03 s (601 frames) | 20.03 s (601 frames) |
| Resolution | 2160×3840 (9:16 portrait, 4K) | 2160×3840 |
| FPS | 30 (CFR) | 30 (CFR) |
| Video codec | H.264 Main@L5.1, `avc1`, yuv420p 8-bit, BT.709, progressive, MainConcept encoder | same |
| Video bitrate | 83.1 Mb/s | 79.9 Mb/s |
| GOP / keyframes | I-frame every **60 frames (2.0 s)**, 11 keyframes; B-frames (has_b_frames=2): 440 B / 150 P / 11 I | same |
| Audio | AAC-LC 48 kHz stereo 317 kb/s. **Real music** (mean −6.9 dB, peak 0.0 dB) | AAC-LC 48 kHz stereo 317 kb/s. **Silent track** (−91 dB): needs stripping |
| Container | MP4 (mp42), `moov` before `mdat` (faststart OK) | same |

**Web-readiness:**
- H.264 Main 8-bit 4:2:0 plays in Safari, iOS, Chrome and Firefox, so the codec is fine. The problem is that 80 Mb/s 4K is unusable on the web. Re-encode to about 1080×1920 (and maybe 720×1280 for mobile) at 3–6 Mb/s, with `-movflags +faststart` and `-an`.
- **Scroll-scrub:** a 2 s GOP with B-frames will stutter or lag when seeking backward in Safari. For scrubbing, re-encode all-intra or near-intra (`-g 1`, or `-g 5 -bf 0`), accepting a larger file. Another option is to export a JPEG/WebP frame sequence (about 300 frames at 15 fps, 720p) and draw it to a canvas.
- **Silent audio track on PLAIN:** strip it with `-an`. A video with an audio track can affect iOS autoplay rules and media-session UI even when muted.
- Source colour is BT.709, which is fine. (The STILLS are Adobe RGB, see §3.)

### What the animation shows (both versions share the same footage)

The animation is a monochrome, blue-grey 3D render of a **telecom / cell-tower lattice structure**: steel lattice column, antenna clusters, a platform underside with grating. Lighting is volumetric fog with cold white-blue point lights. It is **not one continuous camera move**. It is a cut montage of about 7 slow-drifting shots (gentle push-ins and tilts) punctuated by 1–3-frame **glitch / inverted-negative flashes** (presumably cut to the music).

Approximate shot list (from scene-cut detection plus the 0.33 s contact sheet):

| Time | Shot | Brightness |
|---|---|---|
| 0.00–0.07 | black | black |
| 0.07–0.8 | lattice column, side-lit | mid-dark |
| 0.8–3.0 | looking up into the platform underside, lights flicker on | **very dark** (luma ≈25–35/255) |
| 3.0–3.7 | inverted / negative flashes of the antenna mast | **bright, near-white** |
| 3.7–7.2 | antenna mast top, slow drift; ghost-negative frame ~6.0 s; lens flare ~6.3–6.7 s | mid grey (≈55–70) |
| 7.2–8.7 | lattice column close-up | mid-dark |
| 8.7–9.3 | glitch cuts, inverted white lattice ~9.0 s | **bright flash** |
| 9.3–11.9 | platform underside again, lights | **dark** (≈32) |
| 12.0–12.4 | white fog whiteout | **brightest moment** (≈109) |
| 12.5–14.6 | lattice column with interior lights pulsing | mid-dark |
| 14.6–15.0 | ghost-negative, upside-down tower | bright-ish |
| 15.0–19.0 | **upside-down antenna mast**, slow drift, flare ~17 s | mid grey (≈57–65) |
| 19.0–20.0 | fades to near-black | dark (22) |

- **Loopability:** good. It opens on black and fades to near-black at the end, so a loop reads as fade-out, cut, fade-in. There is no seamless match-cut.
- **White-text overlay:** most of the runtime is dark to mid grey-blue, so white text is legible. The danger frames are the bright flashes at about 3.0–3.7 s, 9.0 s, **12.0–12.4 s** (full whiteout) and about 15 s. Use a subtle dark scrim or gradient behind text, or a text-shadow, to survive those moments.
- **Scroll-scrub suitability:** because it is a montage, scrubbing flips between shots rather than moving one camera through space. The two longest continuous shots, **3.7–7.2 s** (mast) and **15.0–19.0 s** (inverted mast), are the best candidates for a smooth scrub segment.
- **Desktop framing:** the source is 9:16 portrait. On 16:9 desktop, `object-fit: cover` crops to the central horizontal band (about 32% of the height). The tower is centred, so this works, but the top and bottom antenna clusters get cut. Consider a blurred-fill or a split layout on desktop.

### REEL (with-text) overlay

The layout matches the flyer: the ÄGAPĒ "Ä" mark and the ÄGAPĒ Festival logo; the title "ÄGAPĒ WINTER FESTIVAL"; DAY 1 and DAY 2 lineups in bold white caps; and a handwritten "FEBRUARY 19–20 2027 / INDUSTRY CITY". The text block sits in the upper-middle (about 13–35% of frame height on 9:16). Logos and title glitch in from about 1.7 s; names appear with glitch/redaction bars that resolve by about 5 s, then the text holds to the end. The 3 unannounced Day 1 acts stay as white redaction bars throughout. The music track peaks at 0 dBFS (no headroom), which is fine for social but loud if it is ever unmuted on the site.

---

## 3. Flyer ingredients and finished flyers (Downloads, not in repo)

### `~/Downloads/AgapeFestWinter_FlyerIngredients/`
- `STILLS/`: 14 PNG stills from the 3D animation, all **2160×3840, 8-bit, Adobe RGB (1998)**, 6.8–9.4 MB each (about 117 MB total). They are named by timecode: 0-00-04-19, 05-00, 05-26, 06-11, 07-18, 08-22, 09-15, 10-04, 10-26, 11-07, 12-04, 13-11, 13-24, 15-15. (Same set as `~/Downloads/STILLS.zip`.)
  - **Adobe RGB must be converted to sRGB** before web use, or colours will shift and look desaturated in browsers that ignore or strip the profile.
- `FlyerLayout)AGAPE 001 (0-00-15-15)_1.png`: designer flyer layout on still 15-15, 2160×3840, Adobe RGB, 1.6 MB.

### `~/Downloads/AgapeFestWinter_Flyers_v3_OnlyNumbersFixed/` (latest finished flyers)
- `digital/`: story 9:16 (1080×1920; 2160×3840 jpg+png), feed 4:5 (1080×1350; 2160×2700), square (1080; 2160), landscape 16:9 1920×1080, FB event cover 1920×1005, **link-preview 1200×630** (an OG image candidate).
- `print/`: letter, tabloid (300 dpi) and 18×24 / 24×36 posters (150 dpi), each as JPG + PDF with bleed.
- `DICE/`: `DICE_image_2160x2160.jpg`, `DICE_alt_no-text_1080x1080.jpg`, `DICE_alt_logos-only_1080x1080.jpg`.
- `Alternate Stills/still_<timecode>/{digital,print,DICE}`: the same full export set for **13 of the 14 stills** (13-11 is missing), plus `_overview_stories.jpg` and `_overview_DICE-logos.jpg` overview sheets.
- Misc: `_logo-fix_before-after.png`, `_font-sample_for-WhatTheFont.png`, `_render.py` (the render script; not run).

Earlier iterations (`AgapeFestWinter_Flyers/`, `_patchedLogo/`) are superseded by v3.

---

## 4. Existing repo assets

### 4a. `agapeFest_Assets/` (tracked, source/originals)

| Group | Files | Notes |
|---|---|---|
| **Party / crowd photos** | `pics/`: 1D3A9267.jpg 3500×2334; 1D3A9488.jpeg 8192×5464; 1D3A9620-2.jpeg 8192×5464; 3BF199AD.jpg 1440×1800; AGAPE_D7.jpeg 1749×2624; AGAPE_F5.jpeg 3130×2075; DSC05585.jpeg 7008×4672; DSC05632.jpeg 4672×7008 | originals of `public/assets/photos/web/*.webp` (previous ÄGAPĒ events) |
| **Party footage** | `videos/david_lohlein_4x5.mp4` (H.264 576×720, 30 fps, 27.7 s, 5.7 MB, no audio) + `.webm` (VP8, 8.3 MB) | night street-party crowd + DJ booth (David Löhlein set) |
| **Previous (Sept) flyer** | `Flyer/2D_flyer_main.png` 2160×3840 (4 MB); `Flyer/3D_flyer_Stills/` 4 WhatsApp JPEGs 900×1600; `Flyer/3DFlyer_animated/AGAPE-FEST-WITH-AUDIO-V2.mp4` (**HEVC** 1080×1920, 30 fps, 16.1 s, 9 MB, AAC with music, `moov` at end) | Sept 2026 edition: superseded. The HEVC source is not web-safe; the site uses an H.264 transcode |
| **Logos** | Agape/ (favicon 32, icon 1024, txtLogo 1024, webclip 256, logo_white_sm 512, **logo_white.png 16667×16667**, 1.2 MB); AgapeFestival/ (AGAPE_FESTIVAL[WHITE].PNG 2666×1500) | |
| **Partner logos** | 240/ (vector redraws: .ai, .eps, .pdf, png 8767×5371, white/black 2295²); FACE 2 FACE/ (.ai, white/black png 2295²); HotMeal/ (jpeg 1600²); Industry City/ (BLOCK 1270×1484, LINE 2104×488, black only) | |
| Fonts | `Fonts/VanillaCreamOx-Regular.otf` (+ zip) | |
| **New** | `WinterReel/` (with-text REEL, 209 MB) + `WinterAnimation/` (no-text PLAIN, 201 MB), see §2; both untracked | |

### 4b. `agape-festival/public/assets/` (138 MB total; artists 105 MB, videos 28 MB)

**Party / crowd footage (`videos/`)**

| File | Specs | Content |
|---|---|---|
| `winter-kobosil.mp4` (current winter hero BG) | H.264 High 1440×1080, 25 fps, 15.6 s, 11 MB, no audio, faststart | dark warehouse with packed crowd, lasers, DJ under a "FRONTROW" banner. Probably a Kobosil set at another event, not ÄGAPĒ; worth confirming |
| `red-strobes.mp4` | H.264 High 960×540, 24 fps, 8 s, 2.1 MB, **all-intra (192 keyframes)** | empty foggy industrial hall with hanging chains. **AI-generated: a "Veo" watermark is visible bottom-right** |
| `david_lohlein_4x5.mp4` | same as 4a | night outdoor street party, DJ + phones-up crowd. The best real crowd energy |
| `flyer-animated.mp4` | H.264 High 1080×1920, 30 fps, 17.1 s, 10 MB, no audio; keyframes up to 8.3 s apart | Sept 3D flyer (LED screen with old lineup), superseded |
| `posters/` | winter-crowd.jpg 1440×1080; red-strobes.webp 960×540; david_lohlein.webp 720×900; flyer-animated.webp 720×1280; chains_red.webp 488×336 (no video, poster only) | |

**Party photos**
- `gallery/01–18-{crowd,dancer,dj}.webp`: 18 curated photos from the **Sept 5 2026 ÄGAPĒ Festival, photographed by @EMILYGUZZ** (1350×1800 / 1200×1800 / one 1800×1200), 2.6 MB total, defined in `src/data/gallery.ts` with alts and source filenames. **`12-dj.webp` is Flash Gea** (source `…EMILYGUZZ-196 (1).jpg`).
- `photos/web/*.webp`: 8 web versions of `agapeFest_Assets/pics` (1200×800 or 800×1200 etc., 11–89 KB).
- `photos/AGAPE_D14.webp`, `AGAPE_D38.webp`, `AGAPE_F14.webp` (1200×800-ish), `photos/about.webp` 1024×1365.
- `flyer-still.webp` 1000×1778 (Sept flyer); `og-image.jpg` 1200×630 (Sept social preview).

**Artist press kits (`artists/<slug>/press-kit/`)**: 24 artists from the **September** lineup: adrian-mills, aiden, bad-boombox, biianco, clara-cuve, cloudy, conrad-taylor, david-lohlein, emilija, fenrick, **flashgea**, fumi, future666, kaya, kobosil, mischluft, obi, ollie-lishman, serafina, somewhen, supergloss, triptykh, ueberrest, wilderich.
- Headshots: mostly **512×384 webp (low-res, 6–37 KB)**. Exceptions at 1200 px wide or more: biianco, conrad-taylor, flashgea (1200×1797), kaya, obi, wilderich (1200×1800); triptykh 640×1138.
- Clips: mostly H.264 1280×720, 11–15 s, no audio, 1.8–6 MB. Vertical clips: conrad-taylor 720×1280, flashgea 720×1280, wilderich 720×1280, biianco 576×1024 (53.8 s).
- Bio `.md` files for 15 of them, plus PDFs for aiden, future666, somewhen. Bios also live in `src/data/festival.ts`.
- **Codec problem:** `obi/press-kit/obi-video.mp4` is **H.264 High 10 (yuv420p10le)**. 10-bit H.264 does **not** play in Safari or iOS, and Chrome generally cannot play it either. It is referenced by `festival.ts`. OBI is not on the winter lineup, so this only matters if the Sept data is reused.

**Logos (`logos/`)**: AGAPE_FESTIVAL[WHITE].PNG 2666×1500; aFestWhite 586×310 / aFestBlack 750×750 (transparent wordmarks); agape_icon/txtLogo 1024; agape_logo_white 282×400; agape_logo_white_sm 512; favicon 32; webclip 256; meka-icon 400×380 + MEKA_watermark 800×800 (Meka); partners: 240-logo-white 500×306, 44-logo-white 296×240, f2f-logo-white 400×398 / black 2295², hotmeal-logo-white 400×356, ic-logo-block-white 400×467, ic-logo-line 2104×488.

**Other:** `fonts/ChonkyPixels.{ttf,woff2}`; Next.js boilerplate SVGs in `public/` (file, globe, next, vercel, window), which are unused.

### 4c. New assets in Downloads not yet in the repo (worth knowing)
- `~/Downloads/9-5-26 AGAPE FESTIVAL/`: **180 full-res Sept 5 2026 festival photos by @EMILYGUZZ** (3675×4900 / 4900×3268, 1.7 GB). Only 18 are on the site. Its subfolder `FLASHGEA AGAPE FESTIVAL/` has **6 photos of Flash Gea performing at ÄGAPĒ** (3675×4900): dark green/blue stage light, arm raised, at the Face 2 Face decks. These are strong lineup imagery.
- `~/Downloads/AgapeFestival_Logo/`: `agape-festival-logo_{black,white}_1233x682.png` (latest festival logo export).
- `~/Downloads/260424_AgapeFestival_Promo.zip`: 2 × 9:16 promo `.mov` (v1, v2, about 35 MB each), April 2026. Not extracted.
- `~/Downloads/agapeNewBack/`: 6 WhatsApp JPEGs (Aug 14), likely merch backs. Not inspected.

---

## 5. Archived September site (`archive/september-2026/`)

Files: `page.tsx.txt` (3586 lines), `layout.tsx.txt`, `globals.css`, `README.md`. Media it references:
- Direct paths: `/assets/photos/about.webp`, `/assets/flyer-still.webp`, `/assets/logos/meka-icon.webp`, `/assets/fonts/ChonkyPixels.woff2`, `/assets/og-image.jpg` (also as `https://agape-festival.com/assets/og-image.jpg` in layout), `/assets/logos/aFestWhite.png`, `/assets/logos/agape_favicon.png`, `/assets/videos/flyer-animated.mp4` + poster.
- Via `@/data/festival` imports: `VIDEOS.redStrobes` (lineup section BG + poster), `VIDEOS.flyerAnimated`, `VIDEOS.davidLohlein`, `VIDEOS.chainsRed.poster` (artist card backgrounds); every `ARTISTS[].imageUrl` / `videoUrl` (all 24 press kits); `PHOTOS` (the 8 `photos/web/*.webp` + D14/D38/F14); `LOGOS.*`; `PARTNERS[].logoUrl`; `MERCH_ITEMS` (Shopify CDN images); Google Maps embed.
- `layout.tsx.txt` JSON-LD lists performers including `"Flashgea"`.

The current winter `src/app/page.tsx` uses `videos/winter-kobosil.mp4` + `posters/winter-crowd.jpg` as the hero background, and `FestivalExperience.tsx` uses `GALLERY` (18 gallery webps).

---

## 6. Winter lineup: per-artist media coverage

Searched (case-insensitive, spelling variants) `src/`, `archive/`, `public/assets/`, `agapeFest_Assets/`, `context/` and Downloads filenames.

| Day | Artist | Headshot | Video clip | Bio | Notes |
|---|---|---|---|---|---|
| 1 | DIOSSA | – | – | – | Only appears in Sept `SET_TIMES` as `"Junkfile F2F Diossa"` (Day 1, 21:15–22:30) |
| 1 | FENIMORE | – | – | – | |
| 1 | ÜBERKIKZ | – | – | – | Not to be confused with **Überrest** (`ueberrest/`), a different artist |
| 1 | BEN KLOCK | – | – | – | |
| 1 | LEN FAKI | – | – | – | |
| 1 | 3× unannounced | n/a | n/a | n/a | redacted on flyer and reel |
| 2 | FLASH GEA | **Yes**: `public/assets/artists/flashgea/press-kit/flashgea-headshot.webp` 1200×1797; plus `gallery/12-dj.webp`; plus 6 full-res live photos in `~/Downloads/9-5-26 AGAPE FESTIVAL/FLASHGEA AGAPE FESTIVAL/` | **Yes**: `flashgea-video.mp4` H.264 720×1280 vertical, 24 fps, 26.9 s, 5.2 MB, no audio (back view at decks, magenta light) | **Yes**: in `festival.ts` (no .md). Text is written for Sept 2026 ("now in 2026…"), so it needs a refresh | Spelled **"Flashgea"** in `festival.ts` name field, folder slug and archive JSON-LD; bio text says "Flash Gea"; IG @flash.gea. Sept: Day 1, indoor, F2F |
| 2 | CARA ELIZABETH | – | – | – | |
| 2 | MIKA HEGGEMANN | – | – | – | |
| 2 | DAVYBOI | – | – | – | |
| 2 | AZZEL 447 | – | – | – | |
| 2 | JOHANNES SCHUSTER | – | – | – | |
| 2 | KUKO | – | – | – | Only name-dropped inside KAYA's bio |
| 2 | ONLYNUMBERS | – | – | – | Only name-dropped inside KAYA's bio as "Only Numbers" |
| 2 | VENDEX | – | – | – | |

**Coverage: 1 of 14 named artists (Flash Gea).** The other 13 need EPKs (headshot, clip, bio).

---

## 7. Problems and recommendations

1. **`agapeFest_Assets/` is not git-ignored and is partially tracked.** WinterReel/ and WinterAnimation/ (one file of about 200 MB each, over GitHub's 100 MB limit) is untracked but would be picked up by `git add .`. Add an ignore rule.
2. **WinterReel is far too heavy for the web**: 4K, about 80 Mb/s, 2 s GOP. Transcode web versions (1080p and 720p, `-an`, faststart). For scroll-scrub, use an all-intra encode or a frame sequence.
3. **PLAIN has a silent AAC track**: strip it. REEL's audio peaks at 0 dBFS.
4. **The STILLS are Adobe RGB**: convert to sRGB for the web.
5. **9:16-only source** for the hero animation: plan the desktop crop or layout.
6. **Bright flash frames** (about 3.0–3.7 s, 9.0 s, 12.0–12.4 s, 15 s): white overlay text needs a scrim or shadow.
7. `obi-video.mp4` is **10-bit H.264**, which is unplayable in Safari (legacy, Sept lineup).
8. `red-strobes.mp4` is **AI-generated with a visible "Veo" watermark**. Avoid featuring it, or crop it.
9. `winter-kobosil.mp4` (current hero) shows a "FRONTROW" banner. It may not be ÄGAPĒ footage, and Kobosil is not on the winter lineup; worth swapping for real ÄGAPĒ footage.
10. Most Sept headshots are 512×384 (low-res); irrelevant for winter except Flash Gea, which is 1200 px.
11. `agapeFest_Assets/Logos/Agape/agape_logo_white.png` is 16667×16667 (1.2 MB) and already tracked; harmless but oversized.
12. Previous Sept flyer source `AGAPE-FEST-WITH-AUDIO-V2.mp4` is HEVC with `moov` at the end. It is not web-safe, but it is not used directly.

**Footage worth featuring:** WinterAnimation PLAIN (hero / scroll-scrub; best continuous segments 3.7–7.2 s and 15–19 s); the 180 Emily Guzz Sept-2026 photos (real ÄGAPĒ crowd, much more than the 18 now used); the Flash Gea live photos and clip; `david_lohlein_4x5.mp4` (real crowd energy); the v3 flyer `digital/link-preview_1200x630.jpg` as the new OG image.
