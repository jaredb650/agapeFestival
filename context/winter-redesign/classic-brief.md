# Classic refined: direction and system (Nov 3 2026)

Branch `classic-refined` (from `grid-redesign` 7b9fd45). Preview: https://classic-refined.agapefestival.pages.dev/

This replaces the strict hairline-grid look (`grid-brief.md`, `grid-system.md`) with the **September 2026 site's look, done better**. The festival's own artists screenshotted the old lineup cards and posted them ("favourites folder", "face card"). Jared: "double down on the old aesthetic but even more refined, move away from the super strict grid". Refined means better spacing, type, image grading and consistency. It does not mean more decoration.

Phase 1 (done): the foundation, the nav and menu, the Lineup and the Roster.
Phase 2 (to do): the preloader, Tickets, Merch, FAQ, Lockers, Getting here and the Footer. They are still on the grid kit and will look inconsistent until they're moved. That's expected.

## Reference screenshots

The old site was run locally from `main` at 0d9a58f, the last commit before Winter. Screenshots are in `references/classic/old/`:

| File | Shows |
|---|---|
| `instagram-artist-post.jpg` | The artist's Instagram post: 2-up cards, Orbitron names on dark plates, the B2B2B / ??? / TO BE REVEALED card, and the thread texture |
| `sept-390-cards-and-tba.jpg` | The same view rendered at 390 |
| `sept-1440-lineup-head.jpg`, `sept-390-lineup-head.jpg` | Section heading: small label, Orbitron title, 48px rule, centred stage header between fading hairlines |
| `sept-1440-cards.jpg`, `sept-1440-cards-3up.jpg` | The card grids at 4-up and 3-up |
| `sept-1440-set-times.jpg` | The set-times board (red DAY label, Orbitron date, hairline rows, red TO BE REVEALED) |
| `sept-1440-hero-nav.jpg` | The nav: Orbitron caps, tracked |
| `sept-1440-other-sections.jpg` | Set times, Tickets, Merch, FAQ, Getting here, About: the source for phase 2 |

Phase 1 results are in `references/classic/new/`.

## What we took, and what we left

**Kept:**
- Orbitron for titles, names and short caps labels.
- Black, white and deep red (`#8b0000`).
- Artist photos on dark name plates.
- Dark panels over the moving background.
- A fading hairline at every section edge.
- The 48px rule under a section title.
- Centred stage headers between hairlines.
- The red "to be revealed" treatment (`???` in deep red).
- The fine-line thread texture from the old WebGL torus knot. It's now a still image: `public/assets/winter/texture/threads.webp`, 68 KB, rendered by `media-scripts/classic_threads.py`.

**Left behind:**
- The `01 — LINEUP` numbered kickers.
- The chrome shimmer on headings (headings are now solid).
- Corner-bracket frames.
- Glow and breathing on buttons.
- The noise and pulsing on the mystery card.
- The 3D canvas (the texture is a still now).
- 9–10px type. Nothing is under 11px, and body text is 16px.
- Outfit as the body face. Archivo stays: it's already self-hosted, and its width suits Orbitron.

## Tokens (`src/styles/classic.css`, on `.winter`)

Use these. The `--g-*`, `--c-fg*`, `--c-rule*`, `--c-wash`, `--c-shade`, `--t-display` and `--t-title` tokens belong to the grid kit. They are legacy, so don't use them in new code.

**Colour**

| Token | Value | Use |
|---|---|---|
| `--c-ink` | `#000` | page |
| `--c-text` | `#ececec` | headings, names, values (16:1) |
| `--c-text-hi` | `#fff` | hover, current |
| `--c-text-2` | `#a8a8a8` | reading text, leads (8.7:1) |
| `--c-text-3` | `#7d7d7d` | caps labels, meta, captions (5.0:1) |
| `--c-line` | white 8% | hairlines: section edges, list rows, plate and card edges |
| `--c-line-2` | white 18% | control outlines, hovered edges, the heading rule |
| `--c-plate` / `--c-plate-hi` | `#0a0a0a` / `#141414` | solid name plates and card bodies, and their hover step |
| `--c-panel` | `rgba(8,8,8,.78)` | a translucent panel over the footage (`.k-panel`) |
| `--c-red` / `--c-red-hover` | `#8b0000` / `#a00000` | primary action fill |
| `--c-mark` | `#e52424` | small red text: day labels, the current-section mark |
| `--c-red-ink` | `#c0141b` | large red display glyphs only (`???`), 3.4:1 |

Red is used for the primary action, day labels, the current-section mark and "to be revealed". It is never a background wash.

**Type**

There are two families.

**Orbitron** (`--f-display`, weights 400–900 from one variable file) is for:
- section titles
- sub-headings
- artist names
- caps labels of 3 words or fewer (nav, buttons, "Day 1", "Date")

Never use Orbitron for a sentence.

**Archivo** (`--f-ui`, weights 400/500) is for every sentence.

Orbitron is a subset (`load/fonts/orbitron.woff2`). It has Latin letters plus Ä, Ü, á, é and ö, but no Ē. If you set new characters in it, rerun `media-scripts/p3_fonts.py`.

| Class | Token / size | Setting |
|---|---|---|
| `.k-h1` | `--t-h1` 28 → 44 | Orbitron 700, caps, 0.06em, `--c-text`. One per section |
| `.k-h2` | `--t-h2` 16 → 20 | Orbitron 600, caps, 0.08em. A day, a group |
| `.k-name` | `--t-name` 14 → 16 | Orbitron 600, as spelled (mixed case), 0.06em. Names on plates. List rows use 17 → 22 (`.lu-name`) |
| `.k-label` (`--red`) | `--t-label` 12 | Orbitron 500, caps, 0.2em, `--c-text-3` (or red) |
| `.k-lead` | `--t-lead` 18 → 20 | Archivo 400, 1.6, `--c-text-2`, 40em max |
| `.k-body` | `--t-body` 16 | Archivo 400, 1.65, `--c-text-2`, 62ch max |
| `.k-small` | `--t-small` 14 | Archivo 400, `--c-text-3` |

Caps tracking adds space after the last letter. When tracked caps are centred, pull it back with a negative right margin equal to the tracking (see `.k-stage__text`).

**Rhythm.** The spacing scale is `--s-1 … --s-32` (multiples of 4). Values change at 768 and 1024:

| Token | Phone → 768 → 1024 | |
|---|---|---|
| `--sec-y` | 88 → 120 → 152 | section top/bottom padding |
| `--sec-x` | 20 → 32 → 48 | page side padding |
| `--wrap` | 1280 | content max width (`.k-wrap`). The nav aligns to it |
| `--head-gap` | 40 → 56 → 64 | heading block → content |
| `--group-gap` | 64 → 88 → 104 | between groups (Day 1 → Day 2) |
| `--card-gap` | 12 → 16 | card grids |
| `--plate-h` | 48 → 56 | name plate |
| `--row-h` | 56 → 64 | a list row |

There is no radius anywhere: every corner is square, as on the old site.

**Motion.** There is one curve, `--m-ease` = `cubic-bezier(.22,1,.36,1)`, and these durations:

| Token | Duration | Use |
|---|---|---|
| `--m-dur-1` | 160ms | hover, colour, press |
| `--m-dur-2` | 240ms | small reveals, menus |
| `--m-dur-3` | 420ms | the pop-out |
| `--m-reveal` | 640ms | the scroll entrance, with `--m-reveal-step` 50ms between siblings |

Press is `scale(0.97–0.985)`. Hover rules go inside `@media (hover: hover) and (pointer: fine)`. Only animate `transform`, `opacity` and `clip-path`, and name the properties you transition.

## The kit

```tsx
import { Section, StageHeading } from "@/components/winter/classic";
import { Button, ArrowRight, ArrowUpRight, CloseIcon, MenuIcon } from "@/components/winter/ui";
```

- **`<Section id title intro? align?>`** renders a `<section class="k-sec">` with:
  - a fading top hairline
  - side padding
  - a 1280 content column
  - the heading block: `.k-h1` title, the 48px rule, then an optional `.k-lead`

  Keep the ids (the nav finds `main > section[id]`). Titles are as the nav names them, set in caps by CSS. `align="center"` is for short sections that have one block of content.
- **`<StageHeading label="Day 1" red>Friday, February 19</StageHeading>`** is a centred sub-heading between two fading hairlines.
- **`data-reveal` on a container** makes its children fade and rise 16px, 50ms apart, once, as the container enters the viewport (`RevealObserver`, mounted in page.tsx). Content is visible without JS. Use it once or twice per section, on the heading (automatic) and the main list or grid. Don't use it on single small elements.
- **`Button`** (`ui/Button.tsx`, `.w-btn`) is restyled by classic.css:
  - **Primary:** flat `#8b0000`, Orbitron 600 caps 12px, 0.16em tracking. One per view.
  - **Secondary:** a 1px `--c-line-2` outline.
  - **Link:** Archivo with an underline.
  - No glow, ticks or radius. Sizes are sm 40, md 48 and lg 56 high.
  - The hero's Get tickets (`.wh__cta`) is excluded on purpose.
- **`.k-panel`** is a dark translucent panel with a hairline. Use it behind long text, a form or a map over the footage.
- **Icons:** `ui/icons.tsx` (1.5 stroke, square caps, `currentColor`, 16/20px). Don't use emoji or Unicode arrows.

## Layout rules

- Sections are editorial blocks, not cells:
  - heading at top-left
  - content in the 1280 column
  - real air between sections (`--sec-y`)

  Don't use visible grid lines, and don't box everything into rectangles.
- Hairlines separate things. They don't frame decoration. Use them for:
  - section edges (automatic)
  - list rows (`border-top: 1px solid var(--c-line)`)
  - plate tops
  - card and panel edges
- Lists, like the September set times (see `.lu-*`):
  - a red caps label over an Orbitron date
  - then rows of `--row-h` with hairlines between
  - the value on the left, the meta or arrow on the right
- Cards, like the September lineup (see `.rs-*`):
  - a media area over a solid `--c-plate` plate
  - a 1px `--c-line` card edge
  - square corners
  - a grid with `--card-gap`, 2 across on phones and 3 from 768
  - with an odd count on phones, the first card spans both columns
- Two columns from 768 where content pairs naturally (Day 1 | Day 2, map | directions). Stack on phones.
- Phones are their own layout: fewer columns, full-width controls, nothing under 11px and no body text under 16px.
- Content comes only from `src/data/*`. Anything TODO_CONFIRM reads "To be announced". Don't invent facts.

## Image treatment

The rule is one grade for every photo:
- `filter: grayscale(1) contrast(1.08) brightness(.86)`
- `object-fit: cover`, `object-position: 50% 28%` (faces sit high)
- a floor gradient over the bottom 45% (`rgba(0,0,0,.6)` → 0) so the frame sinks into the plate

Crops:
- **Artist cards:** 4:5 on phones, 4:3 from 768, 4:3 for a full-width phone card.
- **Bio panel:** 4:5 on phones, the full panel height beside the text from 768.

Hover, on fine pointers only: the image scales to 1.035 over 700ms, the floor eases to 55%, the plate steps to `--c-plate-hi` and the arrow slides in.

An act with no photo yet shows a crop of `threads.webp` held down by a radial dark layer. Each card gets its own `--crop` position, so the set reads as one material.

Merch shots keep their own colour. They are products, not portraits.

## Motion and interaction

- The background loop and its gentle parallax stay as they are (`LoopBackground.tsx`). The scrim under the sections is still `--g-scrim` 0.72.
- **The bio pop-out** (`artist-select/popout.ts`):
  - The panel has two layers.
  - Its plain background FLIPs (translate + scale) out of the pressed card or lineup name.
  - The content fades up once the box lands.
  - Close runs in reverse and faster.
  - Use this pattern for any panel that opens from an element.
- **The menu:**
  - The black panel fades in.
  - The rows rise 8px, 40ms apart.
  - Close is a 200ms fade.
- Not allowed:
  - idle loops, pulsing, glows, shimmer or glitch below the flyer
  - scanlines or HUD readouts
  - 3D tilt

  The hero and flyer keep their own effects.

## Frozen

These must look and behave exactly as they do now:
- **The hero:** `Hero.tsx`, `HeroBits.tsx`, `sections/hero.css`, and the `.wh` block plus `.wh .w-btn.wh__cta` in `winter.css`.
- **The flyer layover:** `FlyerSection.tsx`, `FlyerStage.tsx`, and `.wposter` / `.wflyer` / `.wbg` in `winter-page.css`.

Every classic rule is scoped to a classic class, and the Button rules use `.w-btn:not(.wh__cta)`.

Before and after a change, screenshot the hero and the flyer at 0, 0.5, 1.4, 2.4, 2.9 and 3.5 viewport heights, at 390 and 1440. Diff them below the nav.

## Phase 2: what's left

For each item:
- Move it to `<Section>`.
- Delete its `SectionGrid`, `Row`, `Cell`, `LinkCell`, `Fill` and `Gap` usage.
- Rewrite its `styles/sections/*.css` in classic tokens.
- Check it at 390, 820 and 1440.

| Section | Notes |
|---|---|
| Preloader (`preloader/*`) | Restyle to the classic tokens: black, an Orbitron caps label, a red hairline progress bar. Keep its timing and its hand-off to the hero intro. |
| Tickets | Keep the **title mirror reflection**. The September version was a centred title over the venue video, then a list of ticket types in hairline rows. There are no tiers or prices (DICE has them), so the content is dates, venue and one primary Get tickets. Consider `align="center"`. |
| Merch | Keep **flip, holo and select** (`merch/*`). The September version ("The uniform") was a centred header, then 4 cards with name plates (the same plate as the roster), then a red View all. Merch photos keep their colour. |
| FAQ | The September version was a left heading, then an accordion: hairline rows with Orbitron 600 questions at about 15px and Archivo answers. Keep the mobile height animation. |
| Lockers | A slim band: a `.k-panel` with one line and a secondary button. It sits between FAQ and Getting here. |
| Getting here | Keep the **custom map** (`map/*`). Put it in a `.k-panel` beside the directions on desktop and stacked on phones. The route list is hairline rows. |
| Footer | The mark, an Orbitron caps nav, Archivo contact lines and Instagram handles. A hairline on top. Keep it quiet. |

When the last grid section has moved:
- Delete `styles/grid.css`, `components/winter/grid/` (icons already live in `ui/icons.tsx`), the `Gap`s in page.tsx, and the legacy tokens in `winter.css` (`--g-*` except `--g-nav` and `--g-scrim`, `--c-fg*`, `--c-rule*`, `--c-wash`, `--c-shade`, `--t-display`, `--t-title`).
- Mark `grid-brief.md` and `grid-system.md` as superseded.

## Open questions (for Jared)

- **Photos.** Only Flash Gea has one. The cards show the thread texture until press shots arrive, and they're the whole point of the cards. Ask Andres for press photos of the other 13 acts.
- **Order.** The page shows The roster before Lineup, but the nav lists Lineup first (this predates this branch).
- **Production.** The roster (the face cards) is still preview-only (`NEXT_PUBLIC_SHOW_ARTIST_SELECT`). Once photos land, it's probably the section to ship on main.
