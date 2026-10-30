# ÄGAPĒ Winter Edition — site redesign plan

Branch `winter-redesign` → preview on Cloudflare Pages (never touches agape-festival.com until merged to `main`).
Inputs: `asset-inventory.md` (this folder), `references/` (Y2K moodboard), the v3 flyers in
`~/Downloads/AgapeFestWinter_Flyers_v3_OnlyNumbersFixed`, archived Sept site in `archive/september-2026/`.

## Design direction — "the flyer, as a website"

The flyer must feel native on the site. Base everything on the flyer's own look; borrow the Y2K
cyber references and the Sept site's UI language as accents, not as the foundation.

| From the flyer (foundation) | From the Sept site (kept) | From the Y2K refs (accent, sparing) |
|---|---|---|
| Fogged blue-grey 3D tower, deep blacks | Frame corner brackets, CRT scanline overlay on buttons | Electric/ice-blue gradient on CTAs + selected state |
| Grainy, slightly soft white type (236 grey, not pure white) | GlitchLogo (RGB-split shader) | Glassy "skinned app window" chrome for the artist select |
| Heavy ink-trap grotesk headings, handwritten date scrawl | Button construction (fill + brackets + pulse glow + CRT) | Thin wireframe lines / HUD labels, subtle chrome sheen |
| Redaction blobs = "to be revealed" motif | Orbitron/pixel micro-labels | Pixel/halftone texture in small doses |

**Palette (sampled from the flyer, `story-9x16_1080x1920.jpg`):**
- `--ink #04060A` (42% of the flyer) · `--deep #1B212C` · `--steel #313743` · `--fog #737C8B`
- `--frost #E9EBEC` text (flyer's off-white) · `--steel-blue #5A6F89` (the flyer's lit blue)
- Accent (Y2K): `--ice #9CC8FF` → `--volt #3D6BFF` gradient; glow `rgba(61,107,255,.45)`.
  Rule: accent appears only on interactive/selected things. Everything else stays in flyer greys.
- Grain overlay site-wide (the flyer's brightness-only grain), type gets a whisper of blur on hero sizes.

**Type:** headings in the flyer's lineup face (best guess **ABC Whyte Inktrap**, Dinamo — Jared to
source; free fallback **Bricolage Grotesque** at low opsz for the ink traps). Micro-labels keep
Orbitron/Chonky Pixels. Hand-scrawl only as image assets cut from the flyer (date, DAY 1/DAY 2).

## Page structure (one scrolling page; remove the current scroll lock)

0. **Background:** the no-text animation (`PLAIN V1`), fixed behind the page, scrubbed by scroll
   (GSAP ScrollTrigger). Desktop: all-intra/short-GOP H.264 1080p `currentTime` scrub. Mobile: WebP frame
   sequence on canvas (immune to iOS Low Power Mode). Cuts in the montage become glitch transitions
   between sections. Darkening scrim behind text at the bright moments (3–3.7s, 9s, 12s whiteout, 15s).
   Reduced-motion → static poster.
1. **Hero:** GlitchLogo + Ä mark, ÄGAPĒ WINTER FESTIVAL, scrawl date + INDUSTRY CITY, GET TICKETS (DICE), countdown.
2. **The flyer moment:** the poster itself, presented full-bleed / framed (it's the key art — it should be seen).
3. **Lineup by day:** one stage per day → DAY 1 and DAY 2 typographic boards echoing the flyer's
   lineup block; unannounced acts as redaction blobs ("TO BE REVEALED").
4. **ARTIST SELECT** (the new centrepiece): skinned glass "app window".
   - Top = P1 panel: big auto-playing clip of the selected DJ, name, DAY badge, bio.
   - Bottom third = grid of all headshots, unordered (not by day). 3 locked "?" tiles (Day 1 TBAs).
   - Desktop hover = select; mobile tap = select (panel pinned above grid); keyboard arrows + roving tabindex.
   - One shared `<video>` whose src swaps (preload on pointerenter/focus + neighbours), WebP tiles.
   - No media yet → icon headshot + the tower animation as the preview + "INTEL PENDING" bio.
5. **Tickets** (DICE link; tiers TBD), **Merch** "THE UNIFORM" (reuse), **Last time** gallery of Sept
   party photos/footage (180 photos by @EMILYGUZZ available, only 18 used now).
6. **FAQ** (rewritten for winter), **Lockers** band, **Getting here** (reuse if still Industry City),
   partners/press, newsletter (Laylo), footer. Restore Event JSON-LD, sitemap lastmod, iOS play-badge CSS.

## Workstreams (parallel subagents; ✱ = needs Jared's input first)

| # | Job | Depends on |
|---|---|---|
| J1 | **Design system + style lab**: tokens, grain, type, button kit (Sept construction in flyer greys + ice accent), frame/HUD components, on a `/lab` preview route | font decision (fallback ok) |
| J2 | **Media pipeline**: PLAIN → desktop scrub encode + mobile frame sequence + poster; strip audio; sRGB stills; Sept photo selects → WebP; cut flyer scrawl/DAY assets | — |
| J3 | **Content/data**: winter lineup + placeholder artists in `festival.ts`, FAQ/tickets copy drafts, remove Sept-only copy ✱ | answers below |
| J4 | **Artist Select component** (incl. iOS-safe autoplay from Sept site, keyboard/tap) | J1, J2 |
| J5 | **Page assembly + scroll background** | J1, J2, J3 |
| J6 | **QA + critique**: mobile perf (Chrome DevTools MCP throttled), Impeccable critique, unslop pass, a11y | J4, J5 |

J1, J2, J3 can start immediately in parallel.

## Open questions for Jared / Andres
1. Venue: still Industry City (571 2nd Ave)? Doors/close times? (countdown is a placeholder)
2. Ticket tiers + prices for winter (or just the DICE link)?
3. Single stage — does it have a name/host? Partners/stage hosts this time?
4. Lockers again (Elockers link)? Merch still on sale?
5. Keep About / timeline / dedication sections from Sept, or drop?
6. Artist media request for Andres: headshot + 5–20s clip + bio for 13 artists (all but Flash Gea).
7. Font: designer's source file would confirm the face.

## Housekeeping found
- Raw reel/animation masters now git-ignored (`.gitignore`); 41 older files in agapeFest_Assets are tracked.
- Two Cloudflare projects build this repo: `agapefestival` (old; production serves the Sept site) and
  `agapefestival2` (new; main correct). Keep one — recommend `agapefestival2`, delete the old one.
- Drop `red-strobes.mp4` (Veo watermark) and `winter-kobosil.mp4` (FRONTROW banner) from the new page.
