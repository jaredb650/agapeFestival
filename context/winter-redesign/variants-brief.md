# Simpler variants: common brief (Oct 31, 2026)

## Why
The client looked at the current preview (https://winter-redesign.agapefestival.pages.dev/, commit `c9688b5`) and said it **"looks too AI"** and **"less is more."** Jared wants **4 simpler variations**:
- Each one is based on the current site: same content, same sections, same order, same real media.
- Each one follows the **unslop / anti-AI-slop guidelines strictly**. The earlier carve-out that protected the HUD language (tracked caps, glows, orbs, brackets, scanlines) is **revoked** for these variants.
- Each one uses **its own colors** and is clearly different from the other three.

You build ONE variant. Your direction is in your job prompt; the other three are listed at the bottom so you stay distinct from them.

## Setup
- **Branch:** you are in a git worktree that may have started on `main`. FIRST run `git checkout -B <your-branch> c9688b5`, then confirm with `git log --oneline -1`.
- **Install:** run `cd agape-festival && npm ci --prefer-offline --no-audit --no-fund` under the heavy lock (below).
- **Skill:** load the `unslop` skill via the Skill tool and read its references, especially `signs.md`, `tokens.md`, `visuals.md` and `refs.md`, and look at the ref images.
  - Skip its "stop and wait for the user" step: Jared said just do it.
  - Still write the 5-line direction plus the audit at the top of your report.
  - The `impeccable` skill may help with spacing and copy.
- **This Mac has 8 GB RAM, and 4 agents run at once:**
  - **Builds/installs (one at a time):** `npm ci`, `next build` and Lighthouse go behind the single heavy lock: `L=/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/1ca46e4c-138f-4f9e-8a9f-6cb15d7af4df/scratchpad/locks/heavy; until mkdir $L 2>/dev/null; do sleep 10; done; <cmd>; rmdir $L`. Always release it.
  - **Dev server + screenshots (two at a time):** take a view slot with `V=/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/1ca46e4c-138f-4f9e-8a9f-6cb15d7af4df/scratchpad/locks; until mkdir $V/view1 2>/dev/null && S=view1 || mkdir $V/view2 2>/dev/null && S=view2; do sleep 10; done; echo $S`.
    - Note the slot name. Start the dev server (`NEXT_PUBLIC_SHOW_ARTIST_SELECT=1 npx next dev -p <your port>`, background), take your screenshots, then **stop the dev server** and `rmdir $V/<slot>`.
    - Keep each session under ~6 minutes.
  - **Screenshots:** use **Playwright** headless (`~/.cache/pw-tools/node_modules/playwright`, Chromium; close the browser at the end of the script). Do NOT use the chrome-devtools MCP: it is a shared browser that other agents are using.
  - Save shots to `/private/tmp/claude-501/-Users-jaredbeguelin-code-agape-festival/1ca46e4c-138f-4f9e-8a9f-6cb15d7af4df/scratchpad/variants/<your-branch>/`. Do NOT save inside the repo.
  - LOOK at every shot. Do at least 3 rounds: desktop 1440x900 and mobile 390x844, full page plus first screen.

## What "simpler" means here (apply strictly)
**Strip the AI-looking HUD/game-UI language everywhere:**
- targeting brackets, corner ticks, notches and shard clip-paths;
- scanlines, the grain overlay, glitch/RGB-split bursts, text decode/scramble effects;
- LCD readouts, glass orbs, status lights, pulsing glows, neon borders, glowing buttons, colored shadows, gradient text;
- tracked uppercase micro-labels ("SYS//", "T–MINUS", "▸ DAY 01");
- fake telemetry/coordinates, decorative tick rulers, faux bezels/frames;
- looping animations on things that aren't live;
- the glowing pulsing floating CTA.

**Keep the real things.** They are the "moments" unslop wants richness in:
- the hero footage (Kobosil video) and the festival logo;
- the **flyer layover section** (`FlyerSection.tsx` / `FlyerStage.tsx`): Jared's rule is don't touch it. It is the real poster art. Keep it as-is; you may only change what surrounds it, like the spacing before and after.
- the artist photos and splash videos;
- the real copy and data in `src/data/winter.ts` and `components/winter/page/media.ts`;
- the map location, the merch product images, the ticket link (DICE).

**Every section, simplified, in this order:**
1. Hero, then the flyer layover.
2. **The Roster** (artist profiler, gated by `SHOW_ARTIST_SELECT`): keep it as an explorable way to see each artist's photo, splash video and bio, but restyled plainly. For example, a clean grid of photos where selecting one shows the video and bio. No fighting-game chrome.
3. Lineup, Tickets, Merch, FAQ, Lockers (if enabled), Getting Here (a calm map: a plain styled map or static image with the address and a directions link, no crosshair HUD), Footer.
4. Nav plus the mobile menu.
5. The preloader: remove it, or reduce it to nothing more than a quick neutral fade. Your call, but no "SYSTEM BOOT".

**Rules:**
- **Countdown:** fine to keep, as quiet tabular-number text. It updates once a second, only while visible.
- **One primary action:** Get Tickets. If you keep a sticky/floating ticket button, it is quiet: no glow, no pulse. Don't stack it over the nav button.
- **Type:** 2 families max (one interface family plus at most one partner), weights 400/500 (600 rare), sentence case, no wide tracking on small text. Orbitron and the pixel font go unless your direction says otherwise. Load fonts via `next/font/google` in `src/components/winter/fonts.ts` (or a new file), subset to latin.
- **Color:** one neutral ramp tinted to your direction's world, plus one accent, used rarely. Hairline borders. No hue-to-hue gradients. A dark scrim over video for legibility is fine.
- **Motion:** at most a short fade-and-rise per section on entry, quick hover color/surface changes, a press scale-down. The scroll-scrubbed background video (`ScrollBackground.tsx`) may stay or go per your direction. If it goes, remove its component from page.tsx (don't delete the file).
- **Fitting the screen:** sections no longer have to fit one screen. Natural page length is fine. No horizontal overflow at 375px.
- **Emoji arrows:** keep the U+FE0E text-presentation fix on arrow glyphs, or use lucide icons instead (lucide-react may be added).
- **Performance stays good:** no per-frame React state, nothing animating offscreen, a light DOM. Simpler should mean faster: delete the code you no longer use from your branch's page tree (unused components can stay on disk but must not be imported).

**Code approach (pick what's fastest and cleanest):**
- Either restyle the existing components in place, or write lean replacement components (e.g. `src/components/winter/simple/*` with your own CSS) that read the same data and media, and point `src/app/page.tsx` at them.
- Replacements are usually easier than fighting the heavy HUD CSS. You own every file on your branch; nobody merges it with the other variants.
- Don't touch `agape-shop/`, `.shopify/` or `archive/`.

## Finish
- `./node_modules/.bin/tsc --noEmit` and lint must pass.
- Both builds must pass, under the heavy lock: `npx next build` and `CF_PAGES=1 CF_PAGES_BRANCH=<your-branch> npx next build`.
- Commit on your branch with a clear message ending in `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. **Do not push.** The orchestrator pushes it as a Cloudflare preview.
- Stop every dev server and browser you started. Leave no lock held.

## Report (≤300 words)
- Your 5-line direction and a short audit list.
- What changed, per section.
- Palette hexes and fonts.
- Branch + commit hash.
- 3–4 screenshot paths: desktop first screen, desktop full page, mobile first screen, mobile full page.
- Open questions.

## The four directions (stay distinct from the others)
| Branch | Name | Surface | Accent | Type | Feel |
|---|---|---|---|---|---|
| `v1-poster` | Poster | light warm paper `#efebe4`, ink `#141210` | international orange `#ff4f00` | big grotesk (e.g. Inter Tight / Archivo), one family + mono for meta | Swiss print poster: strict grid, huge type, rules |
| `v2-sodium` | Sodium | dark warm graphite `#141311` | sodium-lamp amber `#f2a33a` | Instrument Sans or Geist + a mono for times | cinematic night, film-credit lineup, keeps the scroll video |
| `v3-frost` | Frost | light cold grey-blue `#e7ebef`, ink `#0f1722` | Industry City brick red `#b23a2a` | Newsreader or Instrument Serif headlines + Inter interface | editorial winter magazine, airy, serif display |
| `v4-mono` | Catalog | pure black `#0a0a0a`, white, greys | acid chartreuse `#d4ff3a`, tiny doses | ONE monospace for everything (e.g. JetBrains Mono / IBM Plex Mono / Geist Mono) | record-label catalog sleeve: catalog numbers, plain lists, utter restraint |

The hexes are starting points: tune them for contrast (text on the accent ≥ 4.5:1) but keep the family.

## UPDATE (Oct 31, 09:35): client feedback overrides the palettes above
Client, verbatim:
- "Let's go with something more similar to our old one, maintaining black and red as main colors and not blue. Doesn't have to be too complicated."
- "This is just too much for the viewer."
- "Gotta be more clean and classy looking."

What this means for every variant:
- **Black and red only.** Black surfaces, white/grey text, red as the only accent: old site #8b0000 / #a00000 / #a42b2b / #e52424. No blue anywhere.
- **Close to the old live site** (agape-festival.com; code extracted to scratchpad/old-site/): video on black, a big centered logo, a date line, a simple countdown, one deep red button.
- **Clean and classy:** fewer elements, generous space.
- **Identities kept:** v1 Swiss grotesk grid, v2 cinematic credits, v3 editorial serif, v4 mono catalog.
