# Hybrid theme plan: blue build × deployed red site (Oct 31, 2026)

STATUS: APPROVED Oct 31. H0 foundation + P preloader dispatched; pause for Jared's review after H0.

## What Jared said (verbatim, condensed)
- "A combination of the blue one and the currently deployed red one."
- "I love a lot of the new elements, but keep it looking like an extension of the currently deployed one's vibe. We went too far."
- "Reduce scan lines and non-essential text, and reduce decorative text."
- "Remove gradients from buttons; it looks too cartoony."
- "The currently deployed hero is great."
- "All 4 of the variants you made are terrible." Discard v1–v4. Don't reuse their code; they stay as branches only.
- **Keep, he loves these:**
  - the blue FAQ layout;
  - the interactive custom map;
  - the ticket section with the 3D ticket;
  - the merch flip + select preview.
- "More in line with the currently deployed style, slightly toned down."

## The idea in one line
The deployed site's look (black, deep red, Orbitron + Chonky Pixels, one thin red divider, faint corner ticks, quiet scanlines), carried through the blue build's best interactive pieces. Same structure and interactions, re-skinned and de-cluttered.

## Base
- **Branch:** `red-hybrid`, cut from `winter-redesign` @ `c9688b5` (the blue build with all its features).
- **Not from** the v1–v4 variants or from main.
- **Preview:** `https://red-hybrid.agapefestival.pages.dev/`. The live site and `winter-redesign` stay untouched.

## 1. Theme foundation (tokens + global rules)
The deployed site's palette becomes the system.

| Token | Now (blue) | New (deployed red) |
|---|---|---|
| page / ink | #04060a | #000 / #050505 |
| panels | #1b212c steel-blue | #0b0b0b / #121212 neutral |
| primary text | #e9ebec | #fff |
| secondary | #a7afba | #d5d5d5 / #a6a6a6 |
| accent (fills) | --w-volt #3d6bff | #8b0000 (hover #a00000) |
| accent (lines, marks) | --w-ice #9cc8ff | #a42b2b |
| accent (small bright marks) | — | #e52424 / #d32222, sparingly |
| bracket/tick | rgba(233,235,236,.34) | #ffffff35 (the deployed `.winter-frame`) |
| glow | rgba(61,107,255,.45) | at most `0 0 14px #a42b2b66` on the divider-type marks only |
| accent gradients | ice→volt | **deleted**: solid colours only |

**Global rules:**
- **Buttons:** flat solid `#8b0000` with white text, as deployed. The deployed button's four small corner ticks are allowed. No gradients, no inner bevels, no glass, no 3D shading.
  - Hover: `#a00000`.
  - Keep a subtle periodic glow on the main Get Tickets only if it matches the deployed `0 0 8px rgba(200,0,0,.3)`.
  - Secondary buttons: transparent with a hairline border.
- **Scanlines/grain:** one global layer at the deployed strength (`#0002` every 4px, fading in), or less. Remove the per-section scanline layers and the animated grain.
- **Text diet**, applied to every section. Delete:
  - fake telemetry, coordinates, serials and `SYS//`-style codes;
  - decorative readouts, tick-ruler labels, doubled labels and filler status words;
  - repeated date/venue strings.
  - Keep: section titles, real info, one small label per block at most.
  - Tracked caps survive only at the deployed scale (8–10px units like "DAYS").
- **Type:** as deployed. Orbitron for display/labels, Chonky Pixels for the dates/countdown accents, plus the current body face for paragraphs. No new fonts.
- **Glows/orbs/chrome:** tone down by about half. Keep the shapes that carry the interactions (ticket, merch flip, map HUD), but drop decorative glass orbs, LCD bezels and double frames where they're only ornament.
- **Motion:** keep the interactions and scroll-ins. Remove the idle decorative loops (blinking status lights, constant flicker), and make glitch bursts rarer and only on hover/entry.

## 2. Section by section
| Section | Plan |
|---|---|
| **Preloader** | Recolour to black/red, simplify, and keep it short. Or drop it (see Q3). |
| **Nav** | Keep the structure and the loved link-hover animation. Strip the HUD clutter (status lights, readouts) and recolour red. The mobile menu flip stays, toned down. |
| **Hero** | **Port the deployed hero** (main `page.tsx` + `globals.css` `.winter-*`): Kobosil video, vignette, faint scanlines, corner frame, GlitchLogo mouse-trail logo, "Winter Edition", Chonky Pixels date, red divider, 4-box countdown, red Get Tickets, pause button. Near pixel-for-pixel, adapted to scroll into the next section. |
| **Floating CTA** | Keep the bottom-center ticket button, restyled as the flat deployed red button. No hologram, no gradient. |
| **Flyer layover** | Untouched (Jared's rule). Neutralise its cyan glitch colour to red/white in CSS only (Q4). |
| **Scroll background video** | Keep, regraded to neutral (strip the blue tint in CSS) and dimmed a bit. |
| **The Roster** | Keep the layout and interactions. Day 1 / Day 2 colour coding becomes white vs red (not blue vs red). Strip about half the chrome and labels (Q1). |
| **Lineup** | Keep the DVD-style board idea, recoloured with thinner lines and less decorative text. Day 1 white, Day 2 red. |
| **Tickets ★** | Keep the 3D holo ticket and the interaction. Recolour to black/red/silver, remove the gradients and cut the decorative text on the pass to the real info. |
| **Merch ★** | Keep the flip + select preview. Recolour and drop the "Armory" HUD chrome and filler labels. |
| **FAQ ★** | Keep the layout exactly. Recolour, with fewer labels. |
| **Lockers** | Recolour, keep compact. |
| **Getting Here ★** | Keep the interactive custom map and crosshair. Recolour to red/white on black, and remove the coordinate/telemetry text that isn't real info. |
| **Footer + sign-up** | Keep the colour-changing "sign up" effect he liked. Recolour the rest and cut decorative text. |

## 3. Execution
Run in this order, with at most 3 heavy agents at once (8 GB Mac), all at xhigh effort, on the shared lock.
1. **H0 Foundation** (one agent, first, ~45–60 min). Owns the tokens in `winter.css` / `winter-page.css`, the button + bracket primitives, global scanlines/grain, the hero port, nav, floating CTA, preloader and the scroll-bg grade. It also writes `context/winter-redesign/hybrid-theme.md`, the rules every section follows.
2. **H1–H3 Sections** (three agents in parallel, from H0's commit, strict file ownership, each ~45–60 min):
   - H1: Roster + Lineup.
   - H2: Tickets + Merch.
   - H3: FAQ + Lockers + Getting Here + Footer.
3. **Merge + QA** (me plus one QA agent): side-by-side with the deployed hero, a blue-leftover grep (`#3d6bff`, `#9cc8ff`, `--w-volt`, `--w-ice`), a gradient-on-button grep, phone + desktop screenshots, performance holding at 89–90, builds green. Then push to the preview.
- **Total:** about 2–2.5 h wall-clock.
- **Pause point:** after H0, I send you the hero + nav + palette preview to approve before the sections get re-skinned. This catches a wrong direction early.

## Open questions (defaults in bold)
1. **Roster:** **keep, recoloured and toned down**; or simplify it hard?
2. **Lineup:** **keep the DVD board, recoloured**; or just a plain list like the deployed vibe?
3. **Preloader:** **keep a short black/red version**; or remove it?
4. **Flyer glitch:** **recolour its cyan flash to red/white**; or leave it exactly as is?

## Decisions (Jared, Oct 31)
1. **Roster:** keep it, toned down and recoloured.
2. **Lineup:** keep it, but remove a lot of the unnecessary decorative elements so it's cleaner.
3. **Preloader:** design a NEW one entirely. Separate agent P, in parallel with H0, owning `components/winter/preloader/**`.
4. **Flyer glitch:** recolour it (cyan becomes red/white), CSS only.
5. **Roster layout (H1):** ONE artist highlighted at a time. No split screen (no Day 1 left / Day 2 right splash halves). The selected artist's splash (video/photo + name + bio access) covers the WHOLE area above the tile grid. The grid below still selects, with day colour-coding white/red. Applies to desktop; mobile is already one splash above the grid, so keep that consistent.
6. **Scope cut (Jared, after seeing the foundation):** "just do the roster, I like everything else." H2 (tickets/merch) and H3 (faq/map/footer) were cancelled, and H1 does the Roster ONLY (no lineup changes). Every other section stays exactly as the foundation left it.
