# Performance wave: common brief (Oct 30, 2026 ~21:00)

**Jared, verbatim: "This site is grinding my laptop to a halt so it needs to be butter smooth."** His machine is an **8 GB RAM MacBook**. This is the top priority now. The design is approved ("each one nailed it"), so **performance work must have zero visual downgrade**: same look, same animations, same feel. Cheaper implementations are fine, and better looking is a bonus.

## Setup
- You're in a git worktree that may have started on `main`. FIRST run: `git checkout -B "$(git branch --show-current)" fd51e16`, then confirm `git log --oneline -1` shows `fd51e16 Rename Artist Profiler to The Roster`. Then `cd agape-festival && npm ci --prefer-offline --no-audit --no-fund` (under the lock, see below).
- **8 GB RAM, three agents at once:**
  - Gate `npm ci`, `next build`, Lighthouse and perf traces behind the shared lock: `L=/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/1ca46e4c-138f-4f9e-8a9f-6cb15d7af4df/scratchpad/locks/heavy; until mkdir $L 2>/dev/null; do sleep 10; done; <cmd>; rmdir $L` (always release it).
  - Stop your dev server and close your browser between measurement rounds.
  - Use ONE browser instance; never leave tabs open.
- Measure on a production build (`CF_PAGES=1 CF_PAGES_BRANCH=winter-redesign npx next build` → `npx serve out -l <port>`), not dev mode. The artist select is only in the CF build.
- Tools: chrome-devtools MCP (`performance_start_trace`/`stop`/`analyze_insight`, `emulate` for CPU throttle), Playwright at `~/.cache/pw-tools/node_modules/playwright` (WebKit + Chromium), lighthouse 12 (global).
- Skills (via the Skill tool): `animation-performance`, `performance`, `core-web-vitals`, `vercel-react-best-practices`, `gsap-skills:gsap-performance`. The playbook is `context/winter-redesign/toolkit-and-perf-playbook.md`.
- Screenshots/traces go in `/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/1ca46e4c-138f-4f9e-8a9f-6cb15d7af4df/scratchpad/perf/<job>/`.

## What to measure, before AND after, per section you own
1. **Idle cost:** CPU main-thread busy % and GPU/raster activity while the section sits on screen and the user does nothing, over 5 s. **Target: near zero.** Nothing animates continuously unless it's visible AND cheap (compositor-only transform/opacity). Clocks/countdowns update text at most once per second, only while visible.
2. **Offscreen cost:** with the section scrolled far away, its timers, rAF loops, videos, GSAP tweens and observers must be stopped or paused. **Target: zero.**
3. **Scroll smoothness:** frame times while scrolling through it at 4x CPU throttle. Target: no frames over 33 ms, and no long tasks.
4. **Memory:** JS heap + layer count + decoded image memory. Fewer, smaller composited layers; no giant `will-change` layers left on permanently.

## Usual suspects to hunt
- Always-running `requestAnimationFrame` loops.
- `setInterval`s at sub-second rates.
- Multiple independent clocks/countdowns (consolidate into one shared 1 Hz ticker that only runs while any subscriber is visible).
- Text-scramble/decode effects running forever.
- Infinite CSS animations on large elements, or on elements that aren't visible (pause with `animation-play-state` via an IntersectionObserver-driven class).
- `backdrop-filter` (very expensive; replace with pre-blurred images or semi-opaque fills that look the same).
- `filter: blur/drop-shadow` animations, `mix-blend-mode`, and `box-shadow` animations (fake them with pre-rendered pseudo-elements animated by opacity).
- Big animated `background-position`.
- Animated SVG filters (feTurbulence grain animated per frame is a killer: use a pre-rendered noise tile moved by transform in steps).
- Too many simultaneously playing videos.
- React state updates per frame or per pointer move.
- Layout reads inside scroll handlers.
- ScrollTriggers that never die.
- Huge DOM counts (render decorative tick marks as one SVG path or a CSS repeating-gradient, not hundreds of divs).

## Rules
- **Don't change the look.** Compare before/after screenshots side by side for every change.
- Don't touch content or copy.
- The flyer layover + scroll-scrubbed background (`FlyerSection`, `FlyerStage`, `ScrollBackground`) is loved. Optimize it only if it's measurably part of the problem, with identical output.
- Respect `prefers-reduced-motion` (already implemented; keep it).
- **File ownership** is in your job brief. Shared files outside it: write the request in your report instead.
- Finish with tsc, lint, both builds passing (under the lock). Commit in your branch with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Don't push.

## Report (≤250 words)
- Before/after table of the metrics per section.
- Root causes found.
- Files touched.
- Branch + commit.
- Anything the orchestrator must do.
