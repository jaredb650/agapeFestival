# Winter redesign: handoff (paused Oct 31, 2026 ~12:30)

**Start here next session.** The active branch is `red-hybrid`. Its preview is https://red-hybrid.agapefestival.pages.dev/ (a Cloudflare Pages branch preview; it auto-deploys on push).

## Where we are
- **Direction:** "red hybrid".
  - The blue mech-HUD build's features (`winter-redesign` @ `c9688b5`) are re-skinned to the deployed site's vibe (agape-festival.com: black, flat `#8b0000` buttons, Orbitron + Chonky Pixels, a thin red divider, faint corner ticks and scanlines).
  - The deployed hero is ported nearly pixel for pixel.
  - Plan + decisions: `hybrid-plan.md`. Theme rules: `hybrid-theme.md`.
- **History that led here:**
  1. The client said the blue build "looks too AI / less is more" and wanted black + red "like our old one, clean and classy".
  2. 4 simplified variants (`v1-poster`, `v2-sodium`, `v3-frost`, `v4-mono`, brief in `variants-brief.md`) were REJECTED by Jared: "terrible".
  3. He wanted the blue build's elements kept but toned down toward the deployed look, which became red-hybrid.
- **Done on red-hybrid** (all pushed; HEAD `20ffc36` + this doc):
  - **H0 foundation:** red/black tokens (all blue removed), flat red buttons (no gradients, "cartoony"), one faint global scanline layer, the deployed hero port (GlitchLogo mouse trail, typing intro, countdown), a quiet nav, a flat floating CTA, a neutral scroll-scrub video (`saturate(0.3)` only; darker made it invisible), and the flyer glitch recoloured red/white.
  - **Preloader "Aperture"** (`components/winter/preloader/`):
    - A red hairline fills edge to edge with real progress, with "LOADING" and stepping dots plus a small glowing red Ä mark under it.
    - Then a slit opens onto the logo, and the line drops into the hero divider.
    - It plays on EVERY load, reloads included; only back/forward gets the quick fade.
    - Scroll is locked (input cancelled, no overflow change) during the preloader + hero intro, when loading at the top.
  - **Hero fixes:**
    - The logo entrance moved to `.wh__logo-box`, so the preloader can skip it.
    - The WebGL logo overlays the static image and swaps in one frame once it's sized.
    - Fonts use `display: block`, so the typing doesn't shrink on a cold refresh.
  - **Roster** (2 rounds):
    - Desktop shows one artist across the whole banner. Click anywhere on the banner, or the old "PROFILE ▸" chip, to open the OLD bio window (title bar + LED + ✕, dot pager, ‹ ›) with its unfold animation, rising large over the banner.
    - Mobile: the old slanted DAY 1 / ? RANDOM / DAY 2 slabs (flat) and a 2-row tile grid per day (5+4 / 5+3).
    - Day 1 = white, Day 2 = red.
- **Jared said "I like everything else"** after the foundation. Tickets (3D pass), Merch (flip/select), FAQ, Map, Lockers, Footer and Lineup are recoloured only and intentionally untouched. Don't restyle them unless asked.

## Open / next
- Wait for Jared's review of Roster round 2.
- **Small offers made, not yet answered:**
  - make the preloader hold a bit longer so the loading dots get a moment on fast connections;
  - Roster: the floating Get Tickets hides over the Roster grid on desktop (alternative: reserve ~80px).
- **Later:**
  - QA (WebKit + Chromium at 7 sizes, Lighthouse ≥ 89, overflow, links/DICE, reduced motion);
  - the leftover perf items in the old plan (Grain/Marquee/nav loops, the inlineCss HTML size);
  - client copy confirmations (`content-questions.md`).
- **Merge to `main` (the live site) ONLY when Jared says so.** It's GitHub Pages; never push main otherwise. Never attach agape-festival.com to Cloudflare.

## Working rules (Jared)
- **Delegation:** delegate to background agents at xhigh effort so he can keep queuing.
- **Machine limits:** 8 GB Mac, so at most 3 heavy agents, using the mkdir lock pattern for builds and view slots for dev servers.
- **Agent setup:** agents start their worktrees from main, so always `git checkout -B <branch> <base>` first.
- **Browser testing:** Playwright headless (`~/.cache/pw-tools/node_modules/playwright`), NOT the chrome-devtools MCP or Google Chrome. A bot-driven Chrome blocked Jared from opening his own Chrome.
- **Builds:** `CF_PAGES=1 CF_PAGES_BRANCH=red-hybrid npx next build` (the Roster is gated on for CF branch previews). Turbopack refuses symlinked node_modules, so use `--webpack` there.
- **Before calling a deploy done:** confirm it via `gh api repos/jaredb650/agapeFestival/commits/<sha>/check-runs` ("Cloudflare Pages: agapefestival" success) before telling Jared it's live. He has hit a stale preview before. The "Workers Builds" check always fails (harmless).
- **Don't touch:** the flyer layover (`FlyerSection`/`FlyerStage`) and the scroll-scrub logic.
