# Critiques: round 2 (Jared, Oct 30, 2026 ~18:05–18:45)

Status: COLLECTING. Don't dispatch until Jared says go. Review build at http://localhost:3456 (commit 3a72db5).

## The bar
- **Choose Your Fighter is the standard**: "better than anything I've generated with AI ever visually." **Every section** must be brought up to it: same maximal chrome/HUD style, and the whole site should read like a **fighting-game / mech-game UI**.
- **Everything animated.** Overdo it: things pop in, assemble and glitch as you scroll past them.
- Jared is impressed with how well it runs. **Keep it buttery smooth.** Smoothness is part of the wow.

## DO NOT TOUCH
- **The flyer layover section** after the hero: "absolutely perfect, couldn't ask for any better."
- **The scroll-scrubbed background video.** REVERSAL: forget the earlier "switch to auto-loop" note. The scrub is now super smooth and doesn't chug. Keep it.
- The **"Sign up for updates"** color-changing effect ("looks sick").
- The **nav link hover animation** ("amazing").

## Get Tickets CTA (final decision)
- **Shape:** a plain rectangle with **targeting corner brackets on all four corners**, symmetrical, like a lock-on reticle when hovered. This REPLACES "cut all corners".
- **Keep the little ▶ play glyph** (he likes it) and the new blue hologram look.
- **Placement:** NOT in the top-right nav. A **floating overlay CTA at the bottom center of the screen**, glowing (like the old site had), with a periodic glow/pulse to entice clicks. Inside the hero, Get Tickets is dead center.

## Hero
- Doesn't like everything tucked in the corner.
- **ÄGAPĒ logo big in the center.** Preserve the vibe of the current live site's hero (big centered logo, simple "get your tickets" feel). Add **stylized overlay/HUD elements over the video**.
- **Countdown timer back**, prominent.
- **Get Tickets dead center.**
- **Remove the "LINEUP →" button.** Unnecessary; people can scroll.

## Top nav / header
- Too minimalistic. Make it a **crazy HUD / game UI bar**.
- **Wordmark:** the "ÄGAPĒ" text in the top-left renders badly because the font lacks Ē (E-macron). Use a plain **E** in that font ("ÄGAPE"), or use the logo image.
- Remove Get Tickets from the top-right (it moves to the floating bottom CTA).
- **Menu open animation** (mobile menu): a beautiful flip-out animation styled like the fighter select.

## Lineup section (real-text, after the layover)
- Feels **redundant** right after the flyer layover shows the lineup, and looks basic.
- Jared may send a reference for it. Rethink or merge it.
  - **Open:** whether the section is cut, merged into the artist profiler, or redesigned. Ask before deleting.

## Artist select → rename + fixes
- **Rename "CHOOSE YOUR FIGHTER"** ("too on the nose") to something like **"ARTIST PROFILER"**: check out the artists' profiles.
- **Day labelling:** it isn't obvious that left = Day 1 and right = Day 2. The handwritten DAY labels are tucked in corners.
  - The hover cursor tag says **"DAY 1" / "DAY 2"** (or D1/D2) instead of P1, matching the artist's day.
  - **Color-code by day**, like fighting games' P1 blue / P2 red. The cursor/highlight box takes that day's color.
- **Desktop is ~99% there.**
- **PERFORMANCE REGRESSION:** it felt smoother in the agent's headless test runs. Now there's a delay as the cursor tracks the mouse, and it feels laggier. Find whatever made it laggier (cursor smoothing/lerp, transitions on the cursor, heavy filters, React re-renders on hover, etc.) and remove it. It must be buttery and instant.
- **Mobile: a dedicated design**, different from desktop.
  - Keep the condensed splash panel concept.
  - **Day switcher:** a smaller, less chunky **DAY 1 | ? RANDOM | DAY 2** control near the top. Tap Day 1/Day 2 to switch which artists' tiles show.
  - **Tiles:** **square** on mobile, in a **centered inverted-pyramid grid**. Not the current half-wing look where Day 1 aligns right and Day 2 aligns left.
  - **Tap a tile:** locks that artist into the splash. **Tap the looping footage:** pops up their bio (overlay), instead of the bio sitting below.
  - **The whole profiler fits in one screen, on mobile AND desktop.** No scrolling to reveal more: one connected element (splash + switcher + grid + bio popup).

## Sections needing the full fighter-select-level makeover
- **Tickets**: "way swagged out, way cooler." There's not much information, so make it a crazy game-UI moment.
- **The Uniform (merch)**
- **FAQ**
- **Find Your Way In / Getting Here**: crazy **cyberpunk UI**: a map with a crosshair and targeting HUD. These are ideas; bring it up to the standard.
- **Join the Movement / sign-up**: keep the color change, restyle the rest.
- **Footer.**
- Everything should pop and animate on scroll.

## Assets
- The ÄGAPĒ logo and the ÄGAPĒ Festival logo at the very bottom (footer) look **low-res**. Use the higher-res source/clean extracted logo (`~/Downloads/AgapeFestival_Logo/`, `public/assets/winter/flyer/layers/logo-*.webp`), or vector if available.

## Additional critiques (18:30)
- **Lineup reference:** `references/lineup-ref.jpg` (Sound & Motion Vol.01 DVD back cover, 2000): two columns, outlined pixel index numbers (01, 02…), a thin small sub-label over each name, the name in a wide techno face, and a **hairline underline per entry with a small step/notch at its start**. A thin index ticker (.01 .02 … .16) across the top. "Don't go exactly like this", but use **thinner lines and more visually pleasing alignment**.
- The lineup must **fit in one screen**, mobile included. No "endless scroll of just names". The lineup appears in the layover AND the profiler, so the standalone lineup must be compact. "This needs to be one section."
- **Every section fits in your screen** (except the FAQ, which is fine appended at the bottom). Nothing super chunky.
- **Mobile artist profiler = a big chunky PDA:** the whole UI fits on screen, top to bottom, all text visible, and the section *smoothly* settles/centres into view (soft lock, not a hard scroll lock).
- **Mobile hamburger menu:** flips/unfolds with a badass mech/HUD animation, "like some shit out of Gundam… absolutely insane."
- "The website itself should feel like art."
- GO given ~18:35. Budget: ~2.5 h of unlimited parallel agents.

## Decision (18:50): section order + lineup
- Preview (profiler on): **artist profiler BEFORE the lineup**. The profiler is the fun explorable thing. Nobody is forced through it: right after it comes the plain lineup, easy to read, aesthetically pleasing, symmetrical, compact, all text fitting in one area.
- Real site (main): leave it alone until the whole redesign is merged. Touching main = merging this branch.
