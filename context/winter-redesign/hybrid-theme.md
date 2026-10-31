# Red hybrid theme: rules for the section agents (H1–H3)

Written by H0 (foundation), Oct 31, 2026. Branch `red-hybrid`, cut from `winter-redesign` @ `c9688b5`.
Spec: `context/winter-redesign/hybrid-plan.md` (read the Decisions at the bottom, including **#5, the Roster layout**, which is H1's).

**The idea:** the deployed site (agape-festival.com), meaning black, deep red, Orbitron + Chonky Pixels, one thin red divider, faint corner ticks and quiet scanlines, carried through the blue build's best interactive pieces. Same structure and interactions, re-skinned and de-cluttered. Jared: "We went too far." When in doubt, **remove**.

Look at the deployed hero before you start. It is the reference for every section:
- the live site, https://agape-festival.com;
- or the port on this branch, `src/components/winter/page/Hero.tsx` + `src/styles/sections/hero.css`.

---

## 0. What H0 already did (your starting point)

You start from a **red baseline**, not from blue. Please don't redo this work:

- **Tokens** (`src/styles/winter.css`): the palette is the deployed one, and the old token names are re-pointed (table below). So any CSS that uses `var(--w-ice)`, `var(--w-volt)` or `var(--w-mist)` is already red or neutral.
- **Literal conversion** over every CSS file:
  - every blue hex/rgba became red or neutral:
    - ice `rgb(156,200,255)` → `#a42b2b`;
    - volt `rgb(61,107,255)` → `#8b0000` when solid, `rgba(200,0,0,a×0.6)` when translucent;
    - pale blues/teals → near-white;
    - steel/blue-tinted greys → neutral greys of the same luminance;
  - `rgba(4,6,10,a)` → `rgba(0,0,0,a)`;
  - `rgba(233,235,236,a)` → `rgba(255,255,255,a)`.
  - It was mechanical, so **some spots are now too red** (see §9). Fixing them is your job.
- **Text and focus:**
  - `color: var(--w-ice)` → `color: var(--w-red-hi)`;
  - focus rings (`outline: 2px solid var(--w-ice)`) → white.
- **Per-section scanlines:**
  - `--asel-scan`, `--tk-scan`, `--wmx-scan`, `--wfq-scan`, `--wlu-scan`, `--wft-scan` and `--wgh-scan` are all set to `none`;
  - inline scanline layers (lockers, merch) were replaced with `none`.
  - **Leave them off.**
- **Shared kit:**
  - `Button` is now the flat deployed button;
  - `Grain` is now the one global scanline layer;
  - the `GlitchLayer` split is now red + white (was red + cyan).
- **Owned by H0, so don't edit:**
  - `winter.css`, `winter-page.css`;
  - `Hero*`, `Nav`, `MenuDialog`, `FloatingCta`;
  - `hero.css`, `nav.css`, `cta.css`;
  - `ui/*`.
  - Put requests for shared changes in your report.
- `components/winter/preloader/**` belongs to agent P. Never touch it.

---

## 1. Tokens

Use the **new names** in new code. The legacy names still work, so old CSS keeps rendering, but when you touch a rule, switch it to the new name.

| Role | Token | Value | Notes |
|---|---|---|---|
| Page | `--w-ink` | `#000` | page background |
| Raised page / scrims | `--w-ink-2` | `#050505` | |
| Panel fill | `--w-deep` | `#0b0b0b` | the default panel |
| Raised panel / hover fill | `--w-panel` | `#121212` | |
| Raised chrome / pressed | `--w-steel` | `#1f1f1f` | flat title bars |
| Primary text | `--w-frost` | `#fff` | |
| Secondary emphasis | `--w-soft` | `#d5d5d5` | the deployed date line |
| Secondary text | `--w-mist` | `#a6a6a6` | the deployed unit labels |
| Decorative text only | `--w-fog` | `#777` | large text only, never body |
| **Red fill** | `--w-red` | `#8b0000` | buttons, selected fills |
| Red fill hover | `--w-red-hover` | `#a00000` | |
| **Red line** | `--w-red-line` | `#a42b2b` | hairlines, dividers, marks; **never text** (contrast 2.96:1) |
| **Red small/bright** | `--w-red-hi` | `#e52424` | accent text, tiny marks, active states; sparingly (4.6:1) |
| Glow | `--w-red-glow` | `rgba(164,43,43,.4)` | `#a42b2b66`; see §5 |
| Hairline | `--w-line` / `--w-line-strong` | white 8% / 18% | |
| Corner ticks | `--w-bracket` | `#ffffff35` | the deployed `.winter-frame` |
| Button ticks | `--w-bracket-accent` | `#ff2a2a99` | buttons and selected things only |
| *legacy* `--w-ice` | → `--w-red-line` | | lines; text uses of it are already converted |
| *legacy* `--w-volt` | → `--w-red` | | |
| *legacy* `--w-glow` | → `--w-red-glow` | | |
| *deleted* | `--w-accent-grad`, `--w-accent-line` | | gone; use `--w-red` / `--w-red-line` |

**Day colour coding** (Roster, Lineup): **Day 1 = white**, **Day 2 = red**.
- White: `--w-frost` text, `rgba(255,255,255,…)` lines.
- Red: `--w-red-hi` text, `--w-red` fills, `--w-red-line` lines.
- Never blue, and never two reds fighting.

**Solid colours only.** No `linear-gradient` between two colours on any accent, button, bar, LED, tab or title bar. Gradients are allowed only for:
- darkening scrims/vignettes (black → transparent);
- mask fades;
- the 1px-arm tick trick (`linear-gradient(c, c)` as a solid fill).

---

## 2. Buttons

Use `<Button>` from `@/components/winter/ui`. Don't build your own CTA.

| Variant | Look | Use |
|---|---|---|
| `primary` (lg default) | flat `#8b0000`, white Orbitron 700 caps tracked .3em, four `#ff2a2a99` corner ticks, a soft 4s breathing glow; hover `#a00000` + `scale(1.05)` | **one per view**: Get tickets |
| `secondary` (md) | transparent, a white hairline (`inset 0 0 0 1px rgba(255,255,255,.22)`), small white ticks; hover fills red | View item, Navigate, Reserve a locker, Sign up |
| `ghost` | grey text, underline grows on hover | tertiary |
| `link` | label + arrow, hover red | "Shop all →" |

**Never** add any of the following to a button:
- gradients, glass or `backdrop-filter`;
- inner bevels or 3D shading;
- sheens, RGB-split text or ▶ glyphs;
- hologram scanlines;
- pulsing rings, or extra halos.

If a section has a bespoke button (`.tk-cta`, `.wmx-win__btn`, `.wft__slot`, `.wlk-*` …), either switch it to `<Button>` or restyle it to match one of the variants exactly. The deployed reference:

```css
/* deployed .winter-notify, = .w-btn--primary */
background: #8b0000; color: #fff; font: 700 13px/1 Orbitron; letter-spacing: .3em;
min-height: 60px; padding: 20px 48px; box-shadow: 0 0 8px rgba(200,0,0,.3);
/* + 16px corner ticks in #ff2a2a99 at inset -1px; hover: #a00000, scale(1.05) */
```

---

## 3. Brackets, ticks and frames

- **Corner ticks** are the deployed `.winter-frame`: 13px arms, 1px, `--w-bracket` (white ~21%). Draw them with `<Frame>` / `.w-frame` (one pseudo-element) or four `<i>`s.
  - Default to white ticks.
  - Red ticks (`--w-bracket-accent`) only on buttons and on the selected/active item.
- **One frame per block.** No double frames, nested bezels, chamfered bezel + ticks + hairline, or registration crosses.
- **Chamfers / clip-path shards:** keep them only on the shapes that *carry an interaction* (the roster tiles, the ticket, the merch slots, the map HUD panels). Drop them on static decoration.
- **Silver chrome title bars** (`.w-window[data-skin="chrome"]`, `--hud-silver`, the `#e3e6ea→#959ca8` bars, now neutral silver after the conversion): replace them with a flat `--w-steel` bar and `--w-mist` text, or remove the bar.
- **Glass orbs / LEDs / LCD bezels:** remove them where they are ornament.
  - An LED may stay only if it encodes real state (e.g. "on sale"), as a flat 6px square: `--w-red-hi` when on, `rgba(255,255,255,.2)` when off.
  - No radial-gradient orbs.
- **Panels:**
  - fill: `--w-deep` / `--w-panel`, or `rgba(0,0,0,.6–.85)` over footage;
  - border: hairline `--w-line` / `--w-line-strong`.
  - No steel-blue panel gradients, and no backdrop blur on big areas.

---

## 4. Text diet (every section)

**Delete:**
- fake telemetry: `SYS`, `SIGNAL`, `REC`, `FEED`, `CH.06`, `BOOT SEQ`, `LINK OK`, `NAV.SYS`, `SCAN 000%`, `CREDIT 00`, `INSERT COIN`;
- coordinates and serials:
  - `40.6559° N`, `LAT/LON`, `TGT-01`, `N° 6DYNG3`, `SLOT 01/04`, `CAM 01 :: INSPECT`;
  - grid/heading numbers on maps;
  - `GRID 036°`;
- `:: XYZ ::` code-style headers:
  - `:: Access terminal ::`, `:: Armory / Loadout ::`, `:: Intel archive ::`;
  - `:: NAV-LINK :: SUNSET PARK ::`, `:: Select artist ::`, `:: Target lock ::`;
  - `:: End credits ::`, `:: System shutdown ::`, `:: Status ::`, `:: T-minus ::`;
- status filler:
  - `STANDBY`, `AWAITING INPUT`, `STATUS: …`, `EQUIPPED`, `LOCKED` (as decoration);
  - `ENCRYPTED` repeated per row (keep the redaction blob itself);
  - `END OF TRANSMISSION`, `CONTINUE? 8`;
- tick-ruler labels (`01…17` rulers, `+40/-40`), EQ meters, scrolling marquees of repeated date/venue strings, doubled labels (`QUESTION 01` above every question);
- **repeated date/venue strings.** The date and venue appear in the hero, the tickets info and Getting Here. Nowhere else.

**Keep:**
- section titles (THE ROSTER, LINEUP, TICKETS, THE UNIFORM, FREQUENTLY ASKED, LOCKERS, FIND YOUR WAY IN, JOIN THE MOVEMENT);
- real info (names, days, prices/"on sale", addresses, subway lines, FAQ text, links);
- **at most one small label per block** (e.g. "Day 1", "Apparel", "Subway");
- the redaction blobs for unannounced artists.

**Tracked caps** survive only at the deployed scale:
- 8–11px Orbitron, letter-spacing .18–.3em, `--w-mist`;
- e.g. the countdown's `DAYS`.
- Not on 9px decorative codes everywhere.

**Example:**

```
BEFORE  ● SYS  TICKETS            :: ACCESS TERMINAL ::            LINK  DICE.FM ●
        ▸ INSERT COIN                                            CREDIT 00
        OPTIONS + PRICES :: DICE.FM
AFTER   TICKETS
        On sale on DICE.                                  [ GET TICKETS ]
```

---

## 5. Glow allowance

- **Default: none.** Text has no `text-shadow` glow. Lines have no bloom.
- **Allowed:**
  - `box-shadow: 0 0 14px var(--w-red-glow)` on *divider-type marks only* (a short red rule, the active tick, the map target line);
  - the primary button's own deployed glow (built in).
- Existing glows that carry an interaction (the ticket holo, the merch flip, the map crosshair): **halve** their alpha/blur. If it still reads as "neon", remove it.

---

## 6. Scanlines, grain, texture

- **One global scanline layer** for the whole page (`<Grain />` in `page.tsx`, `.w-grain` in `winter.css`): a dark line every 4px at 10%, fixed, painted once.
- **No section adds its own scanlines**, grain or noise. Leave your `--x-scan` vars at `none`.
- No animated grain anywhere.

---

## 7. Motion rules

- **Keep:** the interactions (roster select + splash, lineup board, 3D ticket tilt, merch flip + select preview, map pan/crosshair, the FAQ open/close, the footer sign-up colour change) and the scroll-ins.
- **Remove:**
  - idle decorative loops: blinking LEDs/orbs, `steps()` flicker loops, bouncing EQ bars, rotating reticles, scan bands sweeping on a timer, marquee tickers;
  - text decode/scramble effects on decorative labels. A decode on a real title on entry is fine, once.
- **Glitch bursts:** only on hover/tap and once on entry. No `idleEvery` on `GlitchLayer`.
- **Perf contract (unchanged):**
  - animate transform/opacity only;
  - no per-frame React state;
  - no live `filter` / `backdrop-filter` / `mix-blend-mode` animation on big areas;
  - lazy-init near the viewport, park off screen (`[data-offscreen]`, `pauseWhenOffscreen`);
  - `prefers-reduced-motion` → static.
- **Easing:** `--w-ease` (`cubic-bezier(.16,1,.3,1)`) for entrances; 150–300ms for UI, ≤600ms for scroll-ins. No overshoot on structural elements.

---

## 8. Type

- **Orbitron** (`--w-font-display` / `--w-font-hud`): titles, labels, buttons, numbers.
- **Chonky Pixels** (`--w-font-pixel`): dates/countdown-style accents only, as in the hero. Not for status lines.
- **Outfit** (`--w-font-body`): paragraphs.
- No new fonts.

---

## 9. Known "too red" spots from the mechanical conversion (fix in your section)

- **H1:**
  - The Roster backdrop washes the whole stage pink/red (ex-blue radial glows → red), so it reads magenta. Make the wash neutral black, with red only on the selected tile and the Day 2 accents.
  - Day 1 must be **white** (it may currently be red-on-red).
  - Lineup: the EQ meter, the 01–17 ruler and the per-row `CONFIRMED/ENCRYPTED` labels go (text diet). Day 2 = red, Day 1 = white.
- **H2:**
  - `tickets/Pass.tsx`: the holo foil's SVG gradient stops are now `#eeeeee → #a42b2b → #6c6c6c → #8b0000`. Re-do the foil as black/red/silver with real restraint (plan: "remove the gradients").
  - The ticket's silver window bars (`STATUS`, `T-MINUS`) → flat, or cut.
  - Merch: the "Armory" chrome, `EQUIPPED`, `SLOT`, `CAM 01` labels.
- **H3:**
  - FAQ: the red `QUESTION 0x` labels above each question → delete.
  - Getting Here: the red map blocks are loud. Keep the red for the venue + route only; neutral for the other buildings. The coordinate/grid text goes.
  - Footer: the `END CREDITS` / `SYSTEM SHUTDOWN` / marquee strings go; keep the sign-up colour effect.

---

## 10. Before / after (CSS)

```css
/* BEFORE (blue build): LED orb */
.x-led { background: radial-gradient(circle at 34% 30%, #fff 0 10%, #cfe6ff 22%, #7ab8ff 44%, #2f62ff 74%, #0d2a99 100%);
         box-shadow: 0 0 8px 1px rgba(110,170,255,.75); }
/* AFTER: delete it. Or, if it encodes real state: */
.x-led { width: 6px; height: 6px; background: rgba(255,255,255,.2); }
.x-led[data-on] { background: var(--w-red-hi); }

/* BEFORE: title bar */
.x-bar { background: linear-gradient(180deg, #e3e6ea 0%, #b9bfc8 48%, #959ca8 52%, #aab1bb 100%); color: #0b0e14; }
.x-bar::after { background: var(--w-accent-line); }            /* ice→volt underline */
/* AFTER */
.x-bar { background: var(--w-steel); color: var(--w-mist); }   /* no underline, or a 1px var(--w-line) */

/* BEFORE: selected tile */
.x-tile[aria-selected] { box-shadow: 0 0 0 1px var(--w-ice), 0 0 0 3px rgba(61,107,255,.35), 0 0 22px rgba(61,107,255,.25); }
/* AFTER */
.x-tile[aria-selected] { box-shadow: inset 0 0 0 1px var(--w-red-hi); }   /* + red corner ticks if it needs more */

/* BEFORE: section kicker */
<HudLabel index="06" rule tone="ice">Support :: FAQ</HudLabel>
/* AFTER: one small label, or none */
<HudLabel>FAQ</HudLabel>

/* The one glowing mark (deployed divider) */
.x-divider { width: 30px; height: 1px; background: var(--w-red-line); box-shadow: 0 0 14px var(--w-red-glow); }
```

---

## 11. Done checklist (per section)

- [ ] `grep -nE '#3d6bff|#9cc8ff|--w-volt|--w-ice|rgba\(61, ?107|rgba\(156, ?200' <your css>` is empty, or only legacy uses you consciously kept.
- [ ] No `linear-gradient(` between two colours on any button, bar, LED or tab.
- [ ] No `repeating-linear-gradient` scanlines.
- [ ] No infinite `animation` except an interaction-bound one, parked off screen.
- [ ] Decorative text deleted per §4. Each block has ≤ 1 small label.
- [ ] Day 1 white / Day 2 red (H1).
- [ ] Desktop 1440×900 and mobile 390×844 screenshots compared against the hero for "same site".
- [ ] tsc, lint and both builds pass.
