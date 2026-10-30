# ÄGAPĒ Winter: design system (J1)

"The flyer, as a website." The flyer's greys, grain and heavy caps are the foundation. The Sept site's UI
language (corner brackets, CRT scanlines, the ticket-button construction) is kept but recoloured. The Y2K
blue is the accent and stays rare.

Live preview: `npm run dev` → `/lab` (dev only; production 404s unless `NEXT_PUBLIC_LAB=1`; noindex).

## Files

| Path | What |
|---|---|
| `agape-festival/src/styles/winter.css` | Tokens (scoped to `.winter`), type classes, all component CSS. Every class is `w-*` and every keyframe `w-*`, so nothing collides with the live page's `.winter-*`. |
| `agape-festival/src/components/winter/fonts.ts` | next/font definitions. `winterFontVariables` = the four variable classNames. |
| `agape-festival/src/components/winter/ui/*` | Components; import from `@/components/winter/ui`. |
| `agape-festival/src/app/lab/*` | Style lab (not part of the kit). |

## Wiring the page needs (J5)

1. `import "@/styles/winter.css";` in the winter page (or layout).
2. Put `winterFontVariables` (from `fonts.ts`) on `<body>` or the page root, and give the page root `className="winter"`.
   The layout's existing Orbitron/Outfit can then go: the kit falls back to `--font-orbitron`/`--font-outfit` if present, but uses its own `--font-hud`/`--font-body`.
3. Render `<Grain />` once inside the `.winter` root (`animated` on desktop is fine; it's compositor-only).
4. Remove globals.css' `html, body { overflow: hidden; height: 100% }` scroll lock (the lab works around it with a fixed scroll root).
5. Keep the iOS play-badge CSS from Sept (`video::-webkit-media-controls…`). The kit doesn't include it.

## Tokens (`.winter`)

**Colour** (sampled from `story-9x16_1080x1920.jpg`)

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--w-ink` | #04060A | page bg, flyer blacks | frost on ink 17.0 |
| `--w-deep` | #1B212C | panels, fog shadow | frost 13.5 · mist 7.3 |
| `--w-steel` | #313743 | raised chrome, tower mids | frost 10.0 · mist 5.4 |
| `--w-steel-blue` | #5A6F89 | the tower's lit blue. Decoration only | 3.9 on ink |
| `--w-fog` | #737C8B | fogged sky; decorative labels on ink only | 4.8 on ink, **3.8 on deep: not for small text there** |
| `--w-mist` | #A7AFBA | secondary text (added: fog fails AA on panels) | 9.2 on ink |
| `--w-frost` | #E9EBEC | primary text (flyer's off-white, never #fff) | 17.0 on ink |
| `--w-ice` | #9CC8FF | **accent**: hover, focus ring, selected | 11.7 on ink |
| `--w-volt` | #3D6BFF | **accent**: CTA edge light + halo, selected glow | (light only, never a fill) |
| `--w-volt-deep` | #1E3BB8 | legacy (no longer used by buttons) | frost 7.4 |
| `--w-glow` | rgba(61,107,255,.45) | selection halo | |
| `--w-accent-grad` / `--w-accent-line` | ice→volt (vertical / horizontal) | active window underline, selection bars | |
| `--w-line`, `--w-line-strong` | frost at 8% / 18% | hairlines, panel edges | |
| `--w-bracket`, `--w-bracket-accent` | frost 34% / ice 85% | Frame corners | |

**Accent rule:** blue appears as *light* (edges, glass, halos, scan bands) on things you can press or that are
selected/live (primary CTA, focus ring, hover colour on secondary/link, the selected artist tile, the active
window). No solid blue slabs. Never on headings, body text or backgrounds. No purple anywhere. No gradient text.

**Type**

| Class / token | Face | Size |
|---|---|---|
| `.w-display` (+ `.w-soft` for hero) · `--w-fs-display` | `--font-display` → Orbitron 900, tracking 0.12em, caps | 36 → 76px |
| `.w-h1` · `--w-fs-h1` | Orbitron 800, 0.08em | 24 → 44 |
| `.w-h2` · `--w-fs-h2` | Orbitron 800, 0.08em | 20 → 32 |
| `.w-h3` · `--w-fs-h3` | Orbitron 700, 0.06em | 16 → 22 |
| `.w-lineup` (+ `__line`, `__sep`) · `--w-fs-lineup` | display 800, 0.06em, centred, `•` separators | 13 (390px) → 36 |
| hero title `.whero__title` | display 900 | 84px one line on desktop (≈12.6em wide), 2 lines at 48px on a 390 phone |
| lineup names `.wlineup__name` | display 800, 0.06em | 17 → 28 (JOHANNES SCHUSTER fits one line at 390) |
| `.w-lead` · `--w-fs-lead` | Outfit 300, mist | 17 → 20 |
| `.w-body`, `.w-small` | Outfit, mist | 16 / 14 |
| `.w-hud` (HudLabel) · `--w-fs-micro` / `--w-fs-nano` | Orbitron .3em tracking caps, or Chonky Pixels | 11px / 9px (nano = decorative chrome only) |

Display = **Orbitron**, the Sept site's heading face (Oct 30: Bricolage was dropped as "wack"). It is the same
12 KB variable woff2 as the HUD labels, so display type costs no extra download. Orbitron is wide: sizes run ~30%
under a grotesk's, and tracking is part of the face (Sept: display 0.12em, headings 0.08em), with the trailing
space pulled back by a matching negative right margin. Display headings carry a 1px same-colour text-shadow
(the flyer's slightly bled type). **Swap point:** winter.css resolves `var(--font-display, var(--font-hud))`, so
to change the display face later (e.g. ABC Whyte Inktrap) add a font in `fonts.ts` with
`variable: "--font-display"` and list it in `winterFontVariables`. Nothing else changes.
Hand-scrawl (date, DAY 1/2) stays as the image layers cut from the flyer (`public/assets/winter/flyer/layers/`),
never a script font.

**Spacing:** only `--w-s-1…10` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px. Layout: `--w-gutter` (16 → 48),
`--w-section-y` (80 → 128), `--w-max` 1200. Helpers: `.w-container`, `.w-section`, `.w-stack`, `.w-hairline`, `.w-sr-only`.

**Motion:** `--w-ease` (expo-out), `--w-ease-io`, `--w-dur-fast/--w-dur/--w-dur-slow` (.18/.3/.6s). All loops
and bursts stop under `prefers-reduced-motion`.

## Components (`@/components/winter/ui`)

| Component | Props | Notes |
|---|---|---|
| `Button` | `variant` primary\|secondary\|ghost\|link · `size` sm\|md\|lg (44/52/60px) · `href` + `external` → `<a>`, else `<button>` | **Hologram panes** (Oct 30, after the Y2K refs): a chamfered pane of near-transparent ice glass (top-left + bottom-right corners cut, `--w-cut` 7/8/11px) with fine scanlines, a 1px luminous edge (even-odd clip-path ring, ice→volt), and the Sept corner brackets standing off the two square corners. Orbitron 700 caps at 0.32em. **primary**: ice edge, ▶ transport glyph, breathing halo cast by the ring (static drop-shadow, opacity-only pulse). Hover: holographic sheen sweeps the glass (transform), caps split red/cyan for one beat, brackets step out and flicker, scale 1.03. One per view. **secondary**: same pane, frost edge, faint scan, no glow; edge/brackets go ice on hover. No fill slab, bevel, drop shadow or backdrop-filter. Label AA: frost on a ≥50% ink pane plus a dark text halo. link = HUD caps + arrow. |
| `Frame` | `accent`, `hairline`, `size` md\|lg, `interactive` (bracket flicker on hover), `as` | Corner brackets from one `::after`. Accent only for selected/interactive. |
| `HudLabel` | `tone` mist\|frost\|fog\|ice · `font` orbitron\|pixel · `size` micro\|nano · `index` ("03") · `rule` | Section kickers, readouts, badges. ice only for live/selected. |
| `SectionHeading` | `title`, `label`, `index`, `children` (lead), `align`, `size` display\|h1\|h2, `as`, `id` | Kicker → heading → lead, 24px gaps. |
| `GlassWindow` | `title`, `meta`, `status`, `skin` steel\|chrome, `active`, `flush`, `controls`, `as` | Skinned app window. steel = quiet info panels; chrome = silver bevel bar (artist select). `active` lights the LED + ice→volt underline. Frosted body (`backdrop-filter`). |
| `Redaction` | `length` (em), `seed`, `label` | The flyer's off-white marker blob as inline SVG, sized in em so it sits in a line of display type. `role="img"`, default label "To be revealed". Vary `seed` per blob. |
| `Marquee` | `items`, `duration` (s), `reverse`, `separator` (default `•`), `label` | Transform-only ticker; pauses offscreen; static under reduced motion; moving copy is aria-hidden, `label` is read instead. |
| `Scrim` | `variant` bottom\|top\|radial\|vignette · `strength` 0–1 | Ink darkening behind text over bright background moments. Parent must be positioned. |
| `Grain` | `animated`, `opacity` (default .075) | Fixed brightness-only film grain, no blend mode (one layer; shows on blacks like the flyer). |
| `GlitchLayer` | `intensity` subtle\|medium\|strong · `interactive` · `idleEvery` (ms) · `burstMs` · `as` | Wrap one transparent `<img>` (a flyer layer). Burst (one `data-burst` attribute, no React render) = layer jitter + red/cyan silhouettes of the layer's own alpha (CSS mask) split off its edges + one slice copy tearing sideways + a scan band. Effect boxes are `display:none` between bursts; motion is transform/opacity only (no filter, blend mode or isolation group). Mouse: real hover (ignored while content scrolls under a resting cursor) or click. Touch: tap (`click`), never the touch that starts a scroll. Off under reduced motion. Idle bursts only while on screen and the tab is visible. |
| `cx` | `(...classes)` | class join helper |

Shared state class: `.w-selected` (ice ring + volt halo), for tiles, tabs, the day switch.

## Usage rules for the page builder

- One primary CTA per viewport. Everything else is secondary/link.
- Text is frost or mist. fog only for decorative labels on ink, never on `--w-deep` panels.
- Headings: display classes only, always caps (the CSS uppercases). Don't letter-space them.
- Unannounced acts: `<Redaction>` inline in the lineup board; locked artist tiles show a `?` + a short redaction where the name goes.
- Frames on content blocks; accent frames only on what's selected.
- No new colours, radii, shadows or spacing values. Corners are square everywhere (no pills, no radius).
- Glow belongs to the primary CTA, the selected tile and HUD light; never a slab of blue.
- GlitchLayer on the floating flyer layers and the logo; not on body text or buttons.
- Use the flyer's cut-out layers (`/assets/winter/flyer/layers/*.webp`) for the date scrawl and DAY labels.

## Scroll background: always visible (J5, Oct 30)

- The scrub only shows the playable footage: `manifest.background.segments` = 3.667–7.267, 8.4–9.867,
  12.0–18.9 s. Outside those the footage is black or near-black (frame luma under ~25/255: 0.8–2.93 s,
  10.0–11.87 s, the fade from 19.07 s). Scroll maps linearly onto the segments laid end to end, and a gap is
  crossed as a cut that fires a flyer glitch burst. `BG_TIMES` (media.ts) are source seconds inside segments.
- Layers bottom-up: a ~0.5 KB inline still (`background.placeholder`), the poster (after load), the live
  video/canvas. The poster never fades out, so a stalled or failed live layer still shows the tower. The
  mobile canvas is never cleared: if the wanted frame isn't decoded yet, the nearest decoded one stays up.
- Sections dim the footage but never hide it: lineup `data-bg-dim` 0.4, ticket stub ≤0.88, footer ≤0.8.
