import json, os, sys, glob, subprocess
from PIL import Image
J, ROOT = sys.argv[1], sys.argv[2]           # ROOT = public/assets/winter
URL = "/assets/winter/"
def b(p): return os.path.getsize(os.path.join(ROOT, p))
def img(p, **kw):
    im = Image.open(os.path.join(ROOT, p))
    return dict(src=URL + p, width=im.width, height=im.height, bytes=b(p), **kw)
def vid(p, **kw):
    o = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets",
        "-show_entries", "stream=width,height,r_frame_rate,nb_read_packets:format=duration", "-of", "json", os.path.join(ROOT, p)]))
    st = o["streams"][0]; n, d = st["r_frame_rate"].split("/")
    return dict(src=URL + p, width=st["width"], height=st["height"], duration=round(float(o["format"]["duration"]), 3),
                fps=round(int(n) / int(d), 3), frames=int(st["nb_read_packets"]), bytes=b(p), **kw)

fl = json.load(open(os.path.join(J, "flyercheck", "flyer_manifest.json")))
frames = sorted(glob.glob(os.path.join(ROOT, "bg/frames/*.webp")))
fr0 = Image.open(frames[0])

M = {
  "version": 1,
  "generated": "2026-10-30",
  "colorSpace": "sRGB (stills ICC-tagged; videos H.264 High 8-bit yuv420p, BT.709 tagged, no audio, faststart)",
  "background": {
    "source": "agapeFest_Assets/WinterAnimation/AGAPE WINTER FEST LINE UP 001 PLAIN V1.mp4 (2160x3840, 30fps, 20.03s, BT.709)",
    "desktop": vid("bg/desktop.mp4", gop=4, bframes=0, crf=27.5,
                   notes="Portrait 1280x2276. Keyframe every 4 frames, no B-frames: currentTime seeks decode <=3 extra frames. Display object-fit: cover; can pan vertically."),
    "frames": dict(dir=URL + "bg/frames/", pattern="f-{000}.webp", first="f-000.webp", count=len(frames),
                   width=fr0.width, height=fr0.height, fps=7.5, sourceFrameStep=4,
                   totalBytes=sum(os.path.getsize(f) for f in frames),
                   timeOfIndex="index * 4 / 30 seconds (index 150 = 20.0s, last frame)",
                   notes="Mobile canvas scrub. Zero-padded 3 digits, f-000..f-%03d." % (len(frames) - 1)),
    "posterDesktop": img("bg/poster-desktop.webp", time=4.2, notes="Antenna mast shot (frame 126), mean luma ~38/255. Not the t=0 frame (t=0 is black)."),
    "posterMobile": img("bg/poster-mobile.webp", time=4.2),
    "duration": 20.033,
    "brightRanges": [
      {"start": 0.067, "end": 0.200, "peakLuma": 134, "level": "flash"},
      {"start": 2.967, "end": 3.700, "peakLuma": 143, "level": "strong"},
      {"start": 6.267, "end": 6.433, "peakLuma": 76,  "level": "mild"},
      {"start": 8.633, "end": 9.333, "peakLuma": 113, "level": "strong"},
      {"start": 11.967, "end": 12.500, "peakLuma": 162, "level": "whiteout"},
      {"start": 14.633, "end": 15.200, "peakLuma": 86,  "level": "strong"},
      {"start": 15.633, "end": 16.267, "peakLuma": 77,  "level": "mild"}
    ],
    "brightRangesNote": "Frame-average luma (0-255, ffmpeg signalstats YAVG) > 75. Typical frames sit at 25-65. Boost the text scrim inside these ranges.",
    "cuts": [0.067, 0.767, 2.967, 3.667, 7.267, 8.633, 9.333, 9.900, 11.967, 12.500, 14.633, 15.167],
    "shots": [
      {"start": 0.000, "end": 0.067, "label": "black"},
      {"start": 0.067, "end": 0.767, "label": "lattice column, interior lit"},
      {"start": 0.767, "end": 2.967, "label": "platform underside (very dark)"},
      {"start": 2.967, "end": 3.667, "label": "glitch burst: inverted mast flashes", "glitch": True},
      {"start": 3.667, "end": 7.267, "label": "antenna mast top, slow drift (best continuous scrub segment)"},
      {"start": 7.267, "end": 8.633, "label": "lattice column close-up"},
      {"start": 8.633, "end": 9.333, "label": "glitch burst: inverted lattice", "glitch": True},
      {"start": 9.333, "end": 9.900, "label": "lattice column close-up (cont.)"},
      {"start": 9.900, "end": 11.967, "label": "platform underside (dark)"},
      {"start": 11.967, "end": 12.500, "label": "fog whiteout glitch", "glitch": True},
      {"start": 12.500, "end": 14.633, "label": "lattice column, interior lights pulsing"},
      {"start": 14.633, "end": 15.167, "label": "glitch: ghost-negative upside-down tower", "glitch": True},
      {"start": 15.167, "end": 20.033, "label": "upside-down antenna mast, slow drift; fades to near-black from ~19s"}
    ]
  },
  "hero": {
    "type": "photo",
    "credit": "Photo: @EMILYGUZZ",
    "photographer": "Emily Guzz (@EMILYGUZZ)",
    "event": "ÄGAPĒ Festival, September 5, 2026",
    "artist": None,
    "artistNote": "DJ not identifiable from filenames or site data (curly hair, moustache; not in the Sept press-kit headshots). Ask Andres before captioning a name.",
    "source": "~/Downloads/9-5-26 AGAPE FESTIVAL/09052026_AGAPEFESTIVAL_@EMILYGUZZ-120.jpg",
    "desktop": img("hero/hero-2400.webp", aspect="3:2", objectPosition="45% 50%", alt="A DJ raises one arm against icy blue stage light at ÄGAPĒ Festival"),
    "mobile": img("hero/hero-1200.webp", aspect="9:16", objectPosition="40% 40%"),
    "alternates": [
      dict(img("hero/alt-1.webp", aspect="3:2", objectPosition="62% 50%"),
           source="09052026_AGAPEFESTIVAL_@EMILYGUZZ-128.jpg", artist=None,
           credit="Photo: @EMILYGUZZ", note="Same DJ from behind, both hands up, facing the crowd; violet haze."),
      dict(img("hero/alt-2.webp", aspect="3:2", objectPosition="50% 40%"),
           source="FLASHGEA AGAPE FESTIVAL/09052026_AGAPEFESTIVAL_@EMILYGUZZ-197.jpg", artist="Flash Gea",
           credit="Photo: @EMILYGUZZ", note="Flash Gea (Winter Day 2) at the decks, arm raised, blue beams.")
    ]
  },
  "flyer": {
    "coordinateSpace": {"width": 2160, "height": 3840, "note": "Layer x/y/w/h are in this space; scale all by (rendered flyer width / 2160)."},
    "overlayFull": img("flyer/overlay-full.webp", notes="Repaired designer overlay incl. soft dark scrim (logo replaced, ONLYNUMBERS rebuilt)."),
    "overlayFull1080": img("flyer/overlay-full-1080.webp"),
    "scrim": img("flyer/scrim.webp", notes="Black with alpha = designer's soft scrim. Composite under the text layers."),
    "textFull": img("flyer/text-full.webp", notes="All text, scrim removed, full 2160x3840 canvas."),
    "layers": {k: dict(src=URL + "flyer/layers/%s.webp" % k, x=v["x"], y=v["y"], width=v["w"], height=v["h"], bytes=v["bytes"])
               for k, v in fl["layers"].items()},
    "layersNote": "Text-only (alpha = text coverage, grain kept in colour). 'logos' = both logos together; 'logo-mark' (Ä) and 'logo-festival' are the same pixels split for independent motion - use either 'logos' or the two sub-layers, not all three. Reassembly: scrim + logos + title + day1-label + day1-names + day2-label + day2-names + date at their x/y reproduces overlay-full (mean abs diff ~0.1/255).",
    "storyFlyer": img("flyer/flyer-story-1080.jpg", source="~/Downloads/AgapeFestWinter_Flyers_v3_OnlyNumbersFixed/digital/story-9x16_1080x1920.jpg"),
    "storyFlyerWebp": img("flyer/flyer-story-1080.webp"),
    "backgroundStill": img("flyer/bg-still-1080.webp", source="FlyerIngredients/STILLS/AGAPE 001 (0-00-13-11).png (Adobe RGB -> sRGB)", animationTime=13.367,
                           notes="The v3 story flyer = this still + scrim + text layers (verified: mean abs diff 0.85/255 vs story-9x16_2160x3840.jpg). The designer's layout file sat on still 15-15, but v3 uses 13-11."),
  },
  "og": {"image": img("og/og-1200x630.jpg", source="v3 digital/link-preview_1200x630.jpg")},
  "artists": {
    "flash-gea": {
      "name": "Flash Gea",
      "headshot600": img("artists/flash-gea/headshot-600.webp", aspect="1:1"),
      "headshot1200": img("artists/flash-gea/headshot-1200.webp", aspect="1:1"),
      "clip": vid("artists/flash-gea/clip.mp4", sourceRange=[2.75, 9.0], loop=True,
                  notes="From press-kit flashgea-video.mp4: back view at the decks, arms up, magenta light. Light denoise + CRF 29."),
      "clipPoster": img("artists/flash-gea/clip-poster.webp", notes="First frame of clip.mp4")
    }
  }
}
out = os.path.join(ROOT, "manifest.json")
json.dump(M, open(out, "w"), indent=2, ensure_ascii=False)
print(open(out).read()[:400]); print(os.path.getsize(out))
