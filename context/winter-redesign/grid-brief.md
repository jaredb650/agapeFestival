# Grid redesign: common brief (Nov 2026; supersedes red-hybrid styling)

## Why
The client looked at red-hybrid (https://red-hybrid.agapefestival.pages.dev/) and said it's **"obvious AI"**. He wants it **simpler, more mature, more modern, less cyber**.

His reference is **https://www.intercell.events/**. Screenshots are in `context/winter-redesign/references/intercell/`. LOOK at them.
- A full-page looping background video.
- A visible hairline grid laid across the whole page: columns and rows of big rectangular cells.
- A few centred labels in cells.
- Rectangle-outlined buttons in a grid.
- A plain nav bar divided by hairlines.
- Nothing else. Almost no decoration.

## Jared's rules (verbatim, condensed)
- **"Strip away as much unnecessary detail as possible."** Any detail that doesn't communicate something to the viewer goes.
  - No decorative text, no target lock ("TGT-01 LOCKED"), no "nav link ready", no coordinates, no "system shutdown", no decorative lines, no status readouts.
- **"Everything is based on a grid or a rectangle."** Use a strict grid system in every section, inspired by Intercell. All our custom shapes (shards, slanted slabs, notches, clipped corners, angled tiles) are retired.
- **"More modern, less AI, less cyber-y, more mature."**
- **Red, black and white** only.
- **No 3D elements.** The 3D ticket card is out ("it makes it feel like it's AI").
- **Keep, but simpler:**
  - **Merch:** flip front/back, the holographic view, select a product.
  - **Tickets:** the mirrored, inverted, fading reflection of the "Tickets" title ("looks really cool").
  - **Getting Here:** the custom map, minus all HUD detail.
- **Impressive animations on click/interaction are welcome**, e.g. the roster's bio window pop-out ("really nice"). They must still be built from rectangles on the grid.
- **No idle decorative loops.** The constant motion comes from the background video only.
- **Background video:** LOOPING, not scroll-scrubbed (the client says the scrub is glitchy), with a gentle **parallax** on scroll, like Intercell: a fixed full-page loop that drifts slightly as you scroll.
- **Keep the HERO and the FLYER LAYOVER exactly as they are.** Don't touch `Hero.tsx`, `HeroBits.tsx`, `sections/hero.css`, `FlyerSection.tsx`, `FlyerStage.tsx` or the preloader.

## Anti-AI skills: STRICT, as originally written
**The earlier carve-outs are REVOKED.** We used to exempt tracked caps, HUD micro-labels, glows, orbs, chrome and parallax from the unslop/impeccable rules; that exemption is gone. Load and follow, without exceptions:
- `unslop`, read fully, including `references/signs.md`, `tokens.md` and `visuals.md`. Skip its "wait for the user" step.
- `impeccable`
- `design-taste-frontend`
- `emil-design-eng`

**Concretely:**
- **Case:** sentence case, no wide-tracked uppercase micro-labels.
- **Type:** two weights (400/500, 600 rare), and type hierarchy from size and colour.
- **Surfaces:** no glows, colored shadows, gradients on chrome, scanlines, grain, glitch bursts, decode/scramble text, pulsing or breathing elements.
- **Spacing:** a 4px spacing grid. Same thing, same size. Hairlines are white at 8–12%.
- **Accent:** red is used rarely: the primary action, the active state, one key figure.
- **Motion:** one easing curve, a few durations. Only transform, opacity and clip.
- **Exceptions, client-mandated and documented:** the looping background video with parallax, and the click animations.

## Theme
- **Colours:**
  - Black page `#000`, over the video with a dark scrim so text reads.
  - White text, plus one secondary grey and one muted grey.
  - Red: the deployed site's `#8b0000` (hover `#a00000`) for fills, `#a42b2b` / `#e52424` for small marks, checked for contrast.
- **Grid:**
  - One page-wide grid system shared by every section: a 12-column grid (4 on mobile) with a fixed gutter.
  - Visible hairline cell borders, like Intercell, as the structure: the lines ARE the layout, not decoration.
  - Sections are stacks of rectangular cells. Content sits in cells, aligned to the grid.
- **Type:**
  - One interface family for everything below the hero, plus at most one partner. Choose per the skills (e.g. a neutral grotesk; Intercell uses a geometric sans).
  - Orbitron and the pixel font stay ONLY inside the untouched hero/flyer/preloader.
- **Buttons:** plain rectangles, either a flat red fill or a hairline outline. No corner ticks, no brackets, no glyph decorations.

## Ownership and setup
- **Base branch:** `grid-redesign`, created by G0 from `red-hybrid` @ `20a217c`. Section agents branch from G0's commit (given in their prompt).
- **8 GB RAM Mac:**
  - Heavy lock for `npm ci`, `next build` and Lighthouse: `L=/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/1ca46e4c-138f-4f9e-8a9f-6cb15d7af4df/scratchpad/locks/heavy; until mkdir $L 2>/dev/null; do sleep 10; done; <cmd>; rmdir $L`
  - View slots for each dev server + screenshot session: `V=/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/1ca46e4c-138f-4f9e-8a9f-6cb15d7af4df/scratchpad/locks; until { mkdir $V/view1 2>/dev/null && S=view1; } || { mkdir $V/view2 2>/dev/null && S=view2; }; do sleep 10; done; echo $S`. Stop the server and `rmdir $V/$S` after each session.
- **Screenshots:** **Playwright headless only** (`~/.cache/pw-tools/node_modules/playwright`). NEVER the chrome-devtools MCP or Google Chrome: Jared uses his Chrome. Save to `/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/1ca46e4c-138f-4f9e-8a9f-6cb15d7af4df/scratchpad/grid/<job>/`. Take at least 3 rounds at 1440x900 + 390x844, and LOOK at them.
- **Builds:** `npx next build` and `CF_PAGES=1 CF_PAGES_BRANCH=grid-redesign npx next build` (the roster is gated on in CF previews).
- **Finish:** tsc, lint and both builds green, then commit on your branch ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. **Do not push.** Stop servers; hold no locks.
- **Edit only the files your prompt lists.** Shared files (tokens, ui primitives, page.tsx) belong to G0; put requests in your report.
- **Content:** real content only, from `src/data/winter.ts`. TODO_CONFIRM items render as "To be announced". Never invent facts. Keep the emoji-arrow fix (U+FE0E) or use lucide icons.
- **Performance:**
  - no per-frame React state;
  - nothing animating offscreen;
  - lazy-init near the viewport;
  - respect reduced motion.
  - Simpler should mean lighter: delete the code you no longer import.

## Report (≤250 words)
- What changed, with a short audit of what was removed.
- Screenshot paths (desktop + mobile).
- Requests for G0-owned files.
- Branch + commit.
