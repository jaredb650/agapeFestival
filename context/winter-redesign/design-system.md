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
| `--w-volt` | #3D6BFF | **accent**: CTA fill, selected glow | (fill only) |
| `--w-volt-deep` | #1E3BB8 | CTA gradient bottom | frost 7.4 |
| `--w-glow` | rgba(61,107,255,.45) | CTA breathing glow | |
| `--w-accent-grad` / `--w-accent-line` | ice→volt (vertical / horizontal) | active window underline, selection bars | |
| `--w-line`, `--w-line-strong` | frost at 8% / 18% | hairlines, panel edges | |
| `--w-bracket`, `--w-bracket-accent` | frost 34% / ice 85% | Frame corners | |

**Accent rule:** blue only on things you can press or that are selected/live (primary CTA, focus ring, hover
colour on secondary/link, the selected artist tile, the active window). Never on headings, body text,
backgrounds or decoration. No purple anywhere. No gradient text.

**Type**

| Class / token | Face | Size |
|---|---|---|
| `.w-display` (+ `.w-soft` for hero) · `--w-fs-display` | `--font-display` (Bricolage Grotesque 800, opsz 12, wdth 88, caps) | 52 → 112px |
| `.w-h1` · `--w-fs-h1` | display | 34 → 72 |
| `.w-h2` · `--w-fs-h2` | display | 26 → 48 |
| `.w-h3` · `--w-fs-h3` | display | 20 → 28 |
| `.w-lineup` (+ `__line`, `__sep`) · `--w-fs-lineup` | display, centred, `•` separators | 19.5 (390px) → 48; sized so the flyer's line breaks hold on phones |
| `.w-lead` · `--w-fs-lead` | Outfit 300, mist | 17 → 20 |
| `.w-body`, `.w-small` | Outfit, mist | 16 / 14 |
| `.w-hud` (HudLabel) · `--w-fs-micro` / `--w-fs-nano` | Orbitron .3em tracking caps, or Chonky Pixels | 11px / 9px (nano = decorative chrome only) |

Display headings carry a 1px same-colour text-shadow (the flyer's slightly bled type). The flyer face is
probably ABC Whyte Inktrap; when licensed, swap the one definition in `fonts.ts` and keep `--font-display`.
Hand-scrawl (date, DAY 1/2) stays as the image layers cut from the flyer (`public/assets/winter/flyer/layers/`),
never a script font.

**Spacing:** only `--w-s-1…10` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px. Layout: `--w-gutter` (16 → 48),
`--w-section-y` (80 → 128), `--w-max` 1200. Helpers: `.w-container`, `.w-section`, `.w-stack`, `.w-hairline`, `.w-sr-only`.

**Motion:** `--w-ease` (expo-out), `--w-ease-io`, `--w-dur-fast/--w-dur/--w-dur-slow` (.18/.3/.6s). All loops
and bursts stop under `prefers-reduced-motion`.

## Components (`@/components/winter/ui`)

| Component | Props | Notes |
|---|---|---|
| `Button` | `variant` primary\|secondary\|ghost\|link · `size` sm\|md\|lg (44/52/60px) · `href` + `external` → `<a>`, else `<button>` | **primary** = Sept ticket CTA in volt: fill + ice brackets standing 7px off + breathing glow (opacity-only) + CRT scanlines + hover scale 1.05. One per view. secondary = glass + frost brackets → ice on hover. link = HUD caps + arrow. |
| `Frame` | `accent`, `hairline`, `size` md\|lg, `interactive` (bracket flicker on hover), `as` | Corner brackets from one `::after`. Accent only for selected/interactive. |
| `HudLabel` | `tone` mist\|frost\|fog\|ice · `font` orbitron\|pixel · `size` micro\|nano · `index` ("03") · `rule` | Section kickers, readouts, badges. ice only for live/selected. |
| `SectionHeading` | `title`, `label`, `index`, `children` (lead), `align`, `size` display\|h1\|h2, `as`, `id` | Kicker → heading → lead, 24px gaps. |
| `GlassWindow` | `title`, `meta`, `status`, `skin` steel\|chrome, `active`, `flush`, `controls`, `as` | Skinned app window. steel = quiet info panels; chrome = silver bevel bar (artist select). `active` lights the LED + ice→volt underline. Frosted body (`backdrop-filter`). |
| `Redaction` | `length` (em), `seed`, `label` | The flyer's off-white marker blob as inline SVG, sized in em so it sits in a line of display type. `role="img"`, default label "To be revealed". Vary `seed` per blob. |
| `Marquee` | `items`, `duration` (s), `reverse`, `separator` (default `•`), `label` | Transform-only ticker; pauses offscreen; static under reduced motion; moving copy is aria-hidden, `label` is read instead. |
| `Scrim` | `variant` bottom\|top\|radial\|vignette · `strength` 0–1 | Ink darkening behind text over bright background moments. Parent must be positioned. |
| `Grain` | `animated`, `opacity` (default .075) | Fixed brightness-only film grain, no blend mode (one layer; shows on blacks like the flyer). |
| `GlitchLayer` | `intensity` subtle\|medium\|strong · `interactive` · `idleEvery` (ms) · `burstMs` · `as` | Wrap one transparent `<img>` (a flyer layer). Burst = stepped RGB split along alpha edges (two coloured drop-shadows), two slice copies (mounted only during the burst), scanline sweep; ice glow while hovered. Mouse: enter/click. Touch: tap fires one burst and never blocks scroll. Off under reduced motion. Idle bursts only run while on screen and the tab is visible. |
| `cx` | `(...classes)` | class join helper |

Shared state class: `.w-selected` (ice ring + volt halo), for tiles, tabs, the day switch.

## Usage rules for the page builder

- One primary CTA per viewport. Everything else is secondary/link.
- Text is frost or mist. fog only for decorative labels on ink, never on `--w-deep` panels.
- Headings: display classes only, always caps (the CSS uppercases). Don't letter-space them.
- Unannounced acts: `<Redaction>` inline in the lineup board; locked artist tiles show a `?` + a short redaction where the name goes.
- Frames on content blocks; accent frames only on what's selected.
- No new colours, radii, shadows or spacing values. Corners are square everywhere (no pills, no radius).
- Glow belongs to the primary CTA and the selected tile only.
- GlitchLayer on the floating flyer layers and the logo; not on body text or buttons.
- Use the flyer's cut-out layers (`/assets/winter/flyer/layers/*.webp`) for the date scrawl and DAY labels.
