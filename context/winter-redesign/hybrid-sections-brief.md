# Red hybrid: section agents' common brief (H1–H3), Oct 31 2026

## Context
Jared approved the foundation: "looks great". It's live at https://red-hybrid.agapefestival.pages.dev/.
- The direction is the blue build's features re-skinned to the DEPLOYED site's vibe (https://agape-festival.com): black, flat deep red `#8b0000`, Orbitron + Chonky Pixels, a thin red divider, faint white corner ticks, quiet scanlines.
- "We went too far." Reduce scanlines, non-essential text and decorative text. No gradients on buttons ("too cartoony"). "Slightly toned down."
- Jared LOVES:
  - the FAQ layout;
  - the interactive custom map;
  - the 3D ticket;
  - merch flip + select preview.
- Keep those interactions; re-skin and de-clutter them.

## Read first
1. `/Users/jaredbeguelin/code/agape-festival/context/winter-redesign/hybrid-plan.md`: the plan, including **the Decisions at the bottom**.
2. `context/winter-redesign/hybrid-theme.md`, in your branch: H0's rules (tokens, buttons, ticks, text diet, glow allowance, motion). **Follow it.**
3. The live site at https://agape-festival.com and the foundation preview: screenshot both and look at them.

## Setup
- **Branch:** in your worktree, run `git checkout -B <your-branch> 5c6e829` and confirm `git log --oneline -1` shows `5c6e829 Scroll background: lighter grade…`.
- **Install:** `cd agape-festival && npm ci --prefer-offline --no-audit --no-fund` under the heavy lock.
- **Heavy lock** (`npm ci`, `next build`, Lighthouse): `L=/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/1ca46e4c-138f-4f9e-8a9f-6cb15d7af4df/scratchpad/locks/heavy; until mkdir $L 2>/dev/null; do sleep 10; done; <cmd>; rmdir $L`
- **View slot** (each dev server + screenshot session, ≤6 min): `V=/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/1ca46e4c-138f-4f9e-8a9f-6cb15d7af4df/scratchpad/locks; until { mkdir $V/view1 2>/dev/null && S=view1; } || { mkdir $V/view2 2>/dev/null && S=view2; }; do sleep 10; done; echo $S`. Then stop the dev server and `rmdir $V/$S`.
- **Dev server:** `NEXT_PUBLIC_SHOW_ARTIST_SELECT=1 npx next dev -p <your port>`.
- **Screenshots:** Playwright headless only (`~/.cache/pw-tools/node_modules/playwright`). **Never use the chrome-devtools MCP or Google Chrome**: Jared is browsing in his own Chrome. Save to `/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/1ca46e4c-138f-4f9e-8a9f-6cb15d7af4df/scratchpad/hybrid/<job>/`. Take at least 3 rounds, desktop 1440x900 + mobile 390x844, and LOOK at each.
- **Skills:** `emil-design-eng`, `design-taste-frontend` and `impeccable` for spacing/copy, plus `animation-performance`. They serve restraint and polish; the deployed look wins any conflict.

## The section bar
- **It should feel like the deployed hero continued down the page.** Black, red only as the accent, white/grey type.
- **Chrome:** keep the corner ticks at the deployed strength (`#ffffff35`).
- **Remove:**
  - glass orbs, LCD bezels, double frames, shard clip-paths that are only ornament;
  - status lights, fake telemetry, coordinates, serials, `SYS//`-style codes, ticker rulers;
  - filler labels ("ENCRYPTED", "CONFIRMED", "EQUIPPED", "ONLINE"…) and duplicated dates/venues.
- **Text:** keep titles, real info, and at most one small label per block.
- **Buttons:** flat red, per hybrid-theme.md. No gradients anywhere in the UI chrome; real material gradients inside a rendered object (e.g. the ticket's foil) only if subtle and neutral/silver, not red-on-red.
- **Toned-down red:** the foundation's automatic recolour made some spots too red. Large areas should be black/neutral, with red as a small accent.
- **Motion:** keep the interactions and the scroll-in assembly. Remove idle decorative loops; glitch only on hover or entry, rarely. Pause offscreen, transforms/opacity only, respect reduced motion.
- **Layout:** sections may still fit one screen; don't make them taller than now.
- **Emoji arrows:** keep the U+FE0E fix.

## File ownership (strict: three agents run at once)
- Edit only your listed files; create new files freely in your section's folders.
- `src/styles/winter.css`, `ui/*`, Hero, Nav, FloatingCta, the preloader and `page.tsx` belong to the foundation. If you need a change there, put it in your report.

## Finish
- tsc and lint pass, and both builds pass under the lock: `npx next build` and `CF_PAGES=1 CF_PAGES_BRANCH=red-hybrid npx next build`.
- Commit on your branch with a message ending in `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Do NOT push.
- Stop all servers and browsers; hold no locks.

## Report (≤250 words)
- What changed, per section.
- Before/after screenshot paths (desktop + mobile).
- Requests for foundation-owned files.
- Branch + commit.
