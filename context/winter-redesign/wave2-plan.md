# Autonomous pipeline: wave 1 → integrate → wave 2 → QA → deploy (Oct 30, 2026)

Jared is away ~18:55 → 20:00+ and authorized running this end to end without him: merge, launch agents, deploy to the **Cloudflare preview branch `winter-redesign` only**. NEVER merge to or push `main` (the live site). The weekly usage limit resets 21:00, with only 12% used at 18:44, so spend freely.

If the session crashes, resume from this file + `scratchpad/r2-agents.txt` (agent roster) + `git log` on `winter-redesign` + `git worktree list`.

## Stage 1: wave 1 (running, launched ~18:40)
8 section agents in worktrees (A hero+CTA, B nav+menu, C profiler, D lineup, E tickets, F merch, G getting-here+lockers, H faq+footer+logos), plus a toolkit/perf research agent writing `toolkit-and-perf-playbook.md`.

## Stage 2: merge (orchestrator)
- Merge each worktree branch into `winter-redesign` as it lands; resolve page.tsx line conflicts by hand.
- Section order on preview: Hero, Flyer layover, ArtistSelect (profiler), Lineup, Tickets, Merch, FAQ, Lockers, GettingHere, Footer.
- Commit, push, verify the preview builds; refresh the local review server (:3456).

## Stage 3: W2-0 integrator (single agent, xhigh, on the merged branch)
Glue everything into one design:
- consistent motion tokens/easing, a shared reveal/assemble primitive if sections diverged;
- consistent chrome, spacing and type;
- section-to-section transitions;
- floating CTA vs nav vs sections interplay;
- remove dead code (old winter-page.css rules, Info.tsx, gallery.ts, framer-motion if unused, `window.__winterBg`, old lab sketches);
- swap the hi-res logos into the nav/hero;
- fit-in-one-screen checks;
- full-page screenshots desktop + mobile;
- builds green.

## Stage 4: wave 2 (parallel worktrees off the integrated commit, strict file ownership)
- **W2-1 PRELOADER:** a themed boot sequence (mech/HUD "SYSTEM BOOT", the ÄGAPĒ mark assembling, an LCD % counter, scanlines).
  - Inline in the initial HTML so it paints instantly; tiny (no external deps).
  - It genuinely warms caches: hero poster, fonts, first background frames, the flyer layers.
  - Exits with a glitch handoff into the hero.
  - Rules: max ~1.5–2.5 s, skipped on repeat visits in the session, no LCP/CLS regression (the hero must still paint as LCP under or after it; measure), reduced motion = quick fade.
  - Owns: new `components/winter/preloader/**`, `styles/sections/preloader.css`, layout.tsx injection.
- **W2-2 McMASTER PERF PASS:** "insane optimization with zero or positive visual impact", following `toolkit-and-perf-playbook.md`:
  - sprite atlases (UI images, logos, artist tiles);
  - WebP frame sequences packed into sprite sheets;
  - AVIF/srcsets;
  - font subsetting;
  - a lighter mobile hero video (the 11 MB issue);
  - a service-worker precache for repeat visits (static-export compatible);
  - idle/viewport prefetch;
  - removing unused deps, a bundle diet;
  - `content-visibility`, preload ordering.
  - Before/after Lighthouse + request count + bytes.
  - Owns: public/assets processing, next.config, media.ts/manifest paths, the SW, loaders. Coordinates through data paths, not component styling.
- **W2-3 MOTION + SMOOTHNESS PASS:** every section animated with choreography:
  - scroll-in assemble/decode/glitch, hover micro-interactions, and section transitions;
  - then a performance trace of every section at 4x CPU throttle;
  - kill jank (long tasks, layout thrash, non-composited animations, too many promoted layers);
  - 60 fps target.
  - Owns: section components' animation code + section CSS (not assets/config).
- After all 3: merge, push.

## Stage 5: W2-4 QA + polish (single agent, xhigh)
- Playwright WebKit (Safari engine) + Chromium at 375x667, 390x844, 430x932, 768x1024, 1280x800, 1440x900, 1920x1080.
- Overflow, fit-in-one-screen, broken links, the DICE link, the artist select gated off in the normal build, reduced motion, keyboard/a11y.
- Lighthouse mobile ≥ 90 performance with 100s elsewhere, console errors, video autoplay paths.
- An impeccable audit for spacing/copy only.
- Fix everything; screenshot contact sheets for Jared.
- Merge, push, verify the preview. Then write the summary to `context/winter-redesign/wave2-report.md` and message Jared.

## Standing rules for all agents
- `round2-common-brief.md` applies (the artist select is the standard; don't touch the flyer layover or the scroll background; buttery smooth; no unslop rules against the HUD language).
- Worktrees: run `npm ci`, use unique dev ports, commit in the branch, never push.
- xhigh effort for build agents.
