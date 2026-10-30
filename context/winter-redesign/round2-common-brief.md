# Round 2: common brief for all section agents (Oct 30, 2026)

You are one of ~8 agents working IN PARALLEL on the ÄGAPĒ Winter Festival site (Brooklyn techno, Feb 19–20 2027, Industry City). Each agent owns one part of the page. Jared, the developer, has ~2.5 hours of heavy usage budget and wants every section brought up to one standard. Work fast but at full quality.

## Setup (you are in your own git worktree)
- The app is in `agape-festival/` inside your worktree. It's a Next.js 16 App Router static export, Tailwind v4, React, TypeScript, with GSAP + ScrollTrigger (`src/components/winter/page/loadGsap.ts`) and framer-motion installed.
- First run `cd agape-festival && npm ci --prefer-offline --no-audit --no-fund` (your worktree has no node_modules).
- Dev server: `NEXT_PUBLIC_SHOW_ARTIST_SELECT=1 npx next dev -p <YOUR PORT>`, using the port in your brief. If turbopack complains, use `--webpack`. Stop it when done.
- Screenshots: `chrome-devtools-axi` or the chrome-devtools MCP, at desktop 1440x900 and mobile 390x844. Save them to `/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/1ca46e4c-138f-4f9e-8a9f-6cb15d7af4df/scratchpad/r2/<your-job>/`. Writing screenshots inside a repo silently fails. LOOK at every screenshot and iterate at least twice.
- Finish with `./node_modules/.bin/tsc --noEmit`, lint, and `npx next build` (normal + `CF_PAGES=1 CF_PAGES_BRANCH=winter-redesign`), all passing.
- Then **commit in your worktree branch** with a clear message ending in `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. **Do not push.** The orchestrator merges all branches.

## Read first
1. `context/winter-redesign/critiques-round2.md`: Jared's full critique. Your section's items are there; read all of it for the vibe.
2. `context/winter-redesign/inspo-analysis.md` + `context/winter-redesign/references/inspo/*`: the Y2K design refs (Floodgear, breeder-unit Winamp skin, Xefirotarch, Attik). LOOK at the images.
3. **THE STANDARD:** the artist select ("fighter select") at `src/components/winter/artist-select/**` + `src/styles/artist-select.css`. Jared: "better than anything I've generated with AI ever visually." Study how it builds its chrome frame with the centre notch, glass orbs, LCD readouts, shard clip-paths, scanlines, header/footer bars, splash transitions, the name decode effect and the GlitchLayer bursts. Bring your section up to THAT level, in the same visual language, reusing its patterns (import its pieces if they're reusable, e.g. `Lcd`, `StageFrame`; don't edit them).
4. The design kit `src/components/winter/ui/*`, `src/styles/winter.css`, `context/winter-redesign/design-system.md`. Content lives in `src/data/winter.ts` (TODO_CONFIRM items render as "to be announced"; never invent facts).

## The bar (Jared, verbatim spirit)
- "The website itself should feel like art." "Breathtaking award-winning site… very stylized and beautiful."
- Everything should feel like a **fighting-game / mech-game / Gundam HUD UI**: maximal, crafted, systematic. Not cluttered.
- **Everything animated:** elements pop in, assemble, decode and glitch as you scroll to them, with hover/tap micro-interactions everywhere. Overdo it, but with choreography.
- **Each section fits in one screen** (desktop AND mobile 390x844), except the FAQ. No endless scrolls of stuff; compact, dense, designed. On mobile, a section can softly settle into view like a PDA locking in, but never hard-lock scrolling.
- **BUTTERY SMOOTH** is part of the wow: Jared is impressed by how well it runs now, so don't regress it.
  - Animate transforms/opacity only.
  - No per-frame React state; drive motion with GSAP/CSS.
  - No live `filter`/`backdrop-filter`/`mix-blend-mode` animation on big areas.
  - Lazy-init when near the viewport, and pause off-screen.
  - Respect `prefers-reduced-motion` (static, no bursts).
- **Do NOT apply unslop/impeccable "AI tell" rules** against tracked caps, glows, HUD labels, chrome, orbs or parallax. That's the wanted language. Use those tools only for spacing, copy and perf.

## Do not touch (anyone)
- The **flyer layover** section (`FlyerSection.tsx`, `FlyerStage.tsx`).
- The **scroll-scrubbed background** (`ScrollBackground.tsx`).
- `agape-shop/`, `.shopify/`, `archive/`.

## File ownership: CRITICAL, everyone works at once
- Only edit the files your brief lists as yours. Create NEW files for your section's CSS: `src/styles/sections/<name>.css`, imported from your component.
- **Do NOT edit `src/styles/winter-page.css`, `src/styles/winter.css` or `src/components/winter/page/Info.tsx`**, unless your brief explicitly grants it. Leave your section's old rules in winter-page.css as dead code; the integrator deletes them.
- `src/app/page.tsx`: only change the import + JSX line(s) for YOUR component.
- If you need a shared change outside your files, put the request in your report instead.

## Report (≤250 words)
- What you built.
- Files touched.
- Your worktree branch name + commit hash.
- 2–4 final screenshot paths (desktop + mobile).
- Anything the integrator must do.
