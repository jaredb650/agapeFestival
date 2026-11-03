> **Superseded (Nov 3 2026)** by [`classic-brief.md`](classic-brief.md). The hairline-grid look was replaced by the classic-refined system, and the grid kit (`styles/grid.css`, `components/winter/grid/`) is no longer imported anywhere. Kept for history; don't build from it.

# Grid system (G0, Nov 2026): how to build a section

Everything below the flyer is built from one system: **rows of hairline cells on a 12-column page grid**, one interface face, black/white/greys and a rare red. The lines ARE the layout. The footer (`page/Footer.tsx`) is the worked example; copy its patterns.

Read with `grid-brief.md` (the why and Jared's rules). The skills (unslop, impeccable, design-taste-frontend, emil-design-eng) apply strictly; the grid's hairlines and the background loop + parallax are the documented, client-mandated exceptions.

## Where things live

| What | File |
|---|---|
| Tokens, type roles, `Button` styles, frozen hero/flyer styles | `src/styles/winter.css` |
| Rows, cells, link cells, section header | `src/styles/grid.css` |
| Page frame, background loop, the frozen hero + flyer wrapper | `src/styles/winter-page.css` |
| Primitives (server components, no client JS) | `src/components/winter/grid/` (`import { … } from "@/components/winter/grid"`) |
| Button | `src/components/winter/ui/Button.tsx` (`import { Button } from "@/components/winter/ui"`) |
| Icons (4 line glyphs) | `src/components/winter/grid/icons.tsx` |
| Your section's CSS | `src/styles/sections/<name>.css`, imported by your component |

The kit CSS loads before every section stylesheet (page.tsx imports it first), so a section class at equal specificity wins over a kit class.

## Tokens

Use only these families in new CSS. Never hard-code a colour, size, space or duration.

**Colour (`--c-*`)**

| Token | Value | Use |
|---|---|---|
| `--c-ink` | `#000` | page |
| `--c-fg` | `#fff` | primary text, headings, values |
| `--c-fg-2` | `#b3b3b3` | secondary text: leads, paragraphs, inactive nav |
| `--c-fg-3` | `#8c8c8c` | muted: labels, meta, captions, legal (6.4:1 on black) |
| `--c-rule` | white 12% | the grid's hairlines |
| `--c-rule-control` | white 40% | outline buttons, inputs |
| `--c-wash` | white 5% | hover / pressed surface step |
| `--c-shade` | black 55% | a cell holding long text over the footage (`<Cell tone="shade">`) |
| `--c-red` / `--c-red-hover` | `#8b0000` / `#a00000` | the primary action's fill (white on it: 10:1) |
| `--c-mark` | `#e52424` | small marks: the active state, ONE key figure per section (4.8:1 on black) |
| `--c-red-line` | `#a42b2b` | a red hairline, if a mark needs a line |
| `--c-focus` | `#fff` | focus rings |

Red is rare: the primary action, the active state, one key figure. Never a background wash, never on decoration.

**Type (`--f-ui`, `--t-*`)**: one family, Archivo semi-expanded (width 112.5), weights **400 and 500 only** (`font-synthesis: none`, so 600+ silently renders 500). Hierarchy comes from size and colour, never weight. Sentence case everywhere. Five sizes, nothing else:

| Token | Size | Class | Line height / tracking | Use |
|---|---|---|---|---|
| `--t-display` | 40 → 72 | `.w-display` | 1.0 / -0.03em, 500 | section titles (one per section) |
| `--t-title` | 24 → 32 | `.w-title` | 1.1 / -0.015em, 500 | cell titles, a big value |
| `--t-lead` | 18 → 20 | `.w-lead` | 1.45, 400, `--c-fg-2`, 36em max | the one intro line under a title; the menu rows |
| `--t-body` | 16 | `.w-body` | 1.55, 400, `--c-fg-2`, 62ch max | running text |
| `--t-small` | 14 | `.w-small` | 1.45, 400, `--c-fg-3` | labels, nav, meta, legal |

Numbers that line up get `.w-num` (tabular lining figures). Orbitron and Chonky Pixels are hero/flyer/preloader only: `--w-font-hud` / `--w-font-pixel` resolve to Archivo outside the hero.

**Space (`--s-N` = N × 4px)**: `--s-1` 4 · `--s-2` 8 · `--s-3` 12 · `--s-4` 16 · `--s-5` 20 · `--s-6` 24 · `--s-8` 32 · `--s-10` 40 · `--s-12` 48 · `--s-16` 64 · `--s-20` 80 · `--s-24` 96 · `--s-32` 128. Every margin, padding, gap and fixed height is a multiple of 4. Same thing, same size.

**Grid (`--g-*`)**, mobile → ≥768 → ≥1024 → ≥1280:

| Token | Value | |
|---|---|---|
| `--g-cols` | 4 → 12 | page columns |
| `--g-margin` | 16 → 32 → 48 → 80 | page margin; the frame lines sit here |
| `--g-pad` | 16 → 24 | cell padding |
| `--g-gutter` | 32 → 64 (≥1024) | the empty band between sections (`<Gap />`) |
| `--g-row-1 … 5` | 56 / 96 / 160 / 192→240 / 240→320 | cell min-heights (`h={1…5}`) |
| `--g-nav` | 56 → 64 (≥1100) | the fixed bar's height (anchor offsets: `scroll-padding-top` is 72px) |
| `--g-scrim` | 0.72 | how dark the footage gets behind the grid |

**Motion (`--m-*`)**: `--m-ease` `cubic-bezier(0.22, 1, 0.36, 1)` is the ONLY curve. `--m-dur-1` 160ms (hover, press, colour) · `--m-dur-2` 240ms (small reveals, the active mark, the menu) · `--m-dur-3` 420ms (full-screen reveals, big clip wipes) · `--m-stagger` 40ms (at most 8 siblings).

**Layers (`--z-*`)**: `--z-bg` 0 (the loop) · `--z-content` 1 (main, footer) · `--z-nav` 50 · `--z-skip` 100.

## The model

```
<SectionGrid id="tickets">        a <section>: a stack of Rows, nothing else directly inside
  <SectionHeader … />             row 1: the title (and an optional aside)
  <Row> <Cell/> <Cell/> … </Row>  each Row = a full-bleed band; cells sit on the columns
  <Row> … </Row>
</SectionGrid>
<Gap />                           page.tsx puts one between sections (you don't)
```

- **Columns**: 12 from 768px, 4 below. A cell spans `span` of 12 (default 12) and `spanSm` of 4 (default 4: cells stack on phones). Cells may span lines inside their Row with `rows` / `rowsSm`.
- **Lines**: a cell draws its own top and left hairline; the Row draws the right frame line and the margin pieces of its top line, so every horizontal rule runs edge to edge and the frame lines run down the margins. Nothing doubles, nothing is decorative.
- **Tiling rule**: every Row must be completely filled, on both breakpoints, or a line goes missing. Fill the end of a short row with `<Fill md={…} sm={…} />` or an empty `<Cell />`. Empty cells are fine (Intercell has them).
- **Content** sits inside `--g-pad`. Align it with `x` (start | center | end | stretch) and `y` (start | center | end | between); a cell is a flex column with a 12px gap.
- The **background loop** shows through every cell (cells are transparent). Over it sits a flat 72% black scrim. If a cell holds long text and the footage behind it is busy, give it `tone="shade"`; don't invent other fills.

## Primitives

```tsx
import { SectionGrid, SectionHeader, Row, Cell, LinkCell, Fill, Gap, ArrowUpRight } from "@/components/winter/grid";
import { Button } from "@/components/winter/ui";
```

| Component | Props | Notes |
|---|---|---|
| `SectionGrid` | `id`, `labelledBy`, `as?: "section" \| "footer"`, `className` | The nav finds sections by their id (`main > section[id]`). Keep the ids in `src/data/winter.ts` SECTIONS. |
| `SectionHeader` | `id` (for the h2), `title`, `aside?`, `titleSpan?` (default 8) | Row 1 of every section: the title in `.w-display` at the foot of a 160px cell; the aside (a string → a paragraph, or one `Button`) beside it. No eyebrow, no number, no label above it. |
| `Row` | `as?: "div" \| "ul" \| "ol"`, `h?` (min line height), `close?` (bottom rule), `className`, `style` | Use `as="ul"` for lists; then cells are `Cell as="li"` / `LinkCell listItem`. |
| `Cell` | `as?`, `span`, `spanSm`, `start`, `startSm`, `rows`, `rowsSm`, `h?: 1–5`, `x`, `y`, `pad?: "none" \| "lg"`, `tone?: "shade"`, `only?: "sm" \| "md"` | `pad="none"` for media that runs to the hairlines. |
| `LinkCell` | Cell layout props + `href`, `external`, `label?`, `size?: "body" \| "title"`, `variant?: "primary"`, `fx?: "wipe"`, `icon?: "arrow" \| "external" \| "none"`, `listItem?` | The whole cell is the link: label (muted) on top, value below, corner arrow (↗ by default for external). Hover = wash, focus = inset ring. `variant="primary"` = the red ticket cell. `fx="wipe"` = red fill wipes across on hover/focus. |
| `Fill` | `md` (cols left, of 12), `sm` (of 4), `as?` | Tiles the end of a row, only where needed. |
| `Gap` | — | The band between sections. G0 owns where they go (page.tsx). |
| `Button` | `variant: "primary" \| "secondary" \| "link"`, `size: "sm" \| "md" \| "lg"` (40/48/56), `block`, `icon`, `href` + `external` | A plain rectangle: flat red fill or hairline outline, no radius. One primary per view. Inside a cell, `block` makes it fill the cell's width. |
| Icons | `ArrowUpRight`, `ArrowRight`, `MenuIcon`, `CloseIcon` (`size`, default 16) | 1.5 stroke, square caps, `currentColor`. The only icons; no emoji, no Unicode arrows. |

## Example: a section built from cells

```tsx
// src/components/winter/page/Tickets.tsx (sketch — content comes from src/data/winter.ts)
import { Cell, LinkCell, Row, SectionGrid, SectionHeader } from "@/components/winter/grid";
import { Button } from "@/components/winter/ui";
import { LINEUP, TICKETS, WINTER } from "@/data/winter";
import { sentenceCase as sentence } from "@/components/winter/nav/sections";
import "@/styles/sections/tickets.css";

export function Tickets() {
  return (
    <SectionGrid id="tickets" labelledBy="tickets-title">
      <SectionHeader id="tickets-title" title="Tickets" aside="Tickets are sold on DICE." />

      {/* A tall feature cell beside two stacked cells: the feature spans both lines of the row. */}
      <Row>
        <Cell span={8} rows={2} h={5} y="end" className="tk-feature">
          <p className="w-title">{WINTER.dates.display}</p>
          <p className="w-body">{WINTER.venue.full}</p>
        </Cell>
        <Cell span={4} h={3} y="end">
          <p className="w-small">Doors</p>
          <p className="w-title">To be announced</p>
        </Cell>
        <Cell span={4} h={3} y="end">
          <Button href={TICKETS.url} external block>
            Get tickets
          </Button>
        </Cell>
      </Row>

      {/* A list row: one link cell per day (6 of 12 each; full width on phones). */}
      <Row as="ul">
        {LINEUP.map((day) => (
          <LinkCell key={day.day} listItem href="#lineup" icon="arrow" span={6} h={2} label={sentence(day.label)}>
            {day.dateLong}
          </LinkCell>
        ))}
      </Row>
    </SectionGrid>
  );
}
```

On phones the feature cell stacks above the two smaller cells (`spanSm` defaults to 4, `rowsSm` to 1). Check the tiling at both widths: 8 + 4 / 4 on desktop, 6 + 6 in the list; one cell per line on phones. The data's labels are set in caps ("DAY 1"); `sentenceCase` from `nav/sections` turns them into sentence case (it keeps FAQ).

## Layout rules

- One `SectionHeader` per section, first. Titles are short nouns in sentence case ("Lineup", "Getting here").
- Vary the rows: a tall feature cell beside narrow ones, a full-width list, a row of equal link cells. Don't stack three identical rows of equal cards.
- Labels may sit centred in big cells (Intercell) or at the foot-left of a tall cell; pick one per section and keep it.
- Media in a cell: `pad="none"`, `object-fit: cover`, square corners; the cell's hairlines frame it.
- Phones are their own composition: decide `spanSm` for every cell; fewer, taller cells beat squeezed ones; no text under 14px.
- Real content only (`src/data/winter.ts`). Anything TODO_CONFIRM renders as "To be announced". No invented facts.

## Buttons and links

- **Primary** (red fill): Get tickets, and at most one other primary action per view. **Secondary** (outline): everything else that is a button. **Link** variant: a quiet underlined text link.
- A whole cell that navigates is a `LinkCell`, not a button inside a cell.
- Labels name the action in sentence case: "Get tickets", "Sign up for updates", "Directions". No arrows or glyphs in the label; external links get the ↗ icon from LinkCell.
- States: hover = colour step (fine pointers only, `@media (hover: hover) and (pointer: fine)`); press = `scale(0.98)` on standalone buttons, wash on cells; focus = 2px white ring (inset on cells); disabled = 40% opacity.

## Motion

- Only `transform`, `opacity` and `clip-path`. Never width/height/top/left/margins/large blurs. Name the properties in `transition` (never `all`).
- One curve (`--m-ease`), three durations. Hover 160ms. Exits faster than entrances.
- **No idle loops.** The page's constant motion is the background loop alone. Nothing pulses, breathes, flickers, scrambles or glitches.
- **Entrances**: at most one short fade + rise (8px, `--m-dur-3`) per section's first rows as they enter, staggered 40ms, triggered once; content is visible if JS never runs.
- **Click / interaction animations are welcome, built from rectangles on the grid.** The tool is `clip-path: inset()` on a rectangle: it reveals a cell, a panel or a fill without moving layout, and hairlines reveal with it. Recipes:

```css
/* A panel that opens out of its cell (e.g. a bio, an answer): wipe down from the cell's top edge. */
.x-panel { clip-path: inset(0 0 100% 0); transition: clip-path var(--m-dur-3) var(--m-ease); }
.x-panel[data-open] { clip-path: inset(0); }

/* A red fill that wipes across a cell on hover/focus (LinkCell fx="wipe" does exactly this). */
.x-cell { position: relative; isolation: isolate; }
.x-cell::before { content: ""; position: absolute; inset: 0; z-index: -1; background: var(--c-red);
  clip-path: inset(0 100% 0 0); transition: clip-path var(--m-dur-2) var(--m-ease); }
.x-cell:hover::before, .x-cell:focus-visible::before { clip-path: inset(0); }

/* Cells revealing in sequence (the mobile menu): one keyframe, a per-cell index. */
@keyframes x-wipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0); } }
.x-seq[data-in] > * { animation: x-wipe var(--m-dur-2) var(--m-ease) both;
  animation-delay: calc(var(--k) * var(--m-stagger)); }   /* style={{ "--k": i }} */
```

  For a pop-out (the roster's bio window), grow a rectangle from the clicked cell: `clip-path: inset(top right bottom left)` computed from the cell's rect inside the target panel, animated to `inset(0)`; or a FLIP of `transform: translate/scale` on the panel only (never its text at large scale). Close faster than open (240ms vs 420ms). Interruptible: use transitions, not keyframes, for anything a user can toggle quickly.
- **Reduced motion**: drop travel and wipes (show the end state, or a 160ms fade). The background shows its poster only.
- **Performance**: no per-frame React state; scroll work rAF-throttled and transform/opacity-only; nothing animates off screen (no idle CSS loops below the hero; `observeInView` from `components/winter/perf` gates video playback); lazy-init heavy things near the viewport, and don't render closed dialogs or far-below-the-fold media into the initial HTML (React hoists a preload for every eager `<img>` it server-renders).

## Banned

Eyebrows / kickers / small labels above headings · section numbers (01 / 02) · wide-tracked uppercase micro-labels · HUD text (codes, coordinates, status readouts, "ready", "locked", "system …") · decorative lines, ticks, brackets, crosshairs, crop marks, notches, chamfers, clipped corners, slanted or angled shapes · glows, coloured shadows, gradients on chrome or text, glass / backdrop blur, scanlines, grain, noise · glitch bursts, decode/scramble text, flicker, pulsing or breathing elements, marquees · 3D (perspective cards, tilt) · radius on cells or buttons · weights above 500, italics for emphasis, negative tracking on small text · emoji, Unicode glyphs as icons, `▶` / `→` in labels · exclamation marks, hype words · monospace outside real code · any colour outside the tokens · new fonts.

## Frozen zone and legacy

- **Hero, flyer, preloader**: untouched files (`Hero.tsx`, `HeroBits.tsx`, `sections/hero.css`, `FlyerSection.tsx`, `FlyerStage.tsx`, `preloader/*`). They keep Orbitron, Chonky Pixels, their scanlines (`.wposter`, page.tsx) and the deployed Get tickets look (winter.css `.wh .w-btn.wh__cta`). `GlitchLayer` and its CSS stay for them.
- **Removed in the final QA pass (grid-opt)**: `HudLabel`, `GlassWindow`, `Marquee`, `Redaction`, `HudBezel`, `hudFx`, `OffscreenPauser` / `usePauseOffscreen` (no section has a CSS loop to park), and the `--w-*` alias block (the only `--w-*` names left are the frozen ones on `.wh`).
- `GestureRescue` stays (the hero, background and roster videos use `playWithRescue`).

## Requests for G0-owned files

Tokens, `grid.css`, the primitives, `Button`, `page.tsx` (section order, `Gap`s), the nav and the background belong to G0. If your section needs a new primitive, token or variant, build it locally in your section CSS first and list it in your report; don't edit G0 files.
