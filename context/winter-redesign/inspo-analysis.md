# Y2K inspiration: what to take from it (Oct 30, 2026)

**Quality bar (Jared, verbatim): "breathtaking award winning site type shit… very stylized and beautiful."** Target Awwwards Site-of-the-Day craft: a singular, committed art direction, every element designed (no default-looking components), cinematic motion choreography, meticulous typography and spacing, delightful micro-interactions, and still fast on phones. Safe or generic is a failure; so is clutter without a system.

Jared's refs are in `references/inspo/`. He loves this direction and wants it pushed further into the site's UI elements. All six are ~1998–2002 digital design.

| File | What it is | What to take |
|---|---|---|
| inspo-1.jpg | Nessim Higson / Adatech print collage | Layered translucent photo rectangles in blue/red duotone; hairline grid; crosshair and targeting circles; ultra-wide spaced caps ("E V O L V E"); vertical type stacks; micro data-text blocks; a row of tiny circular glyph icons; film-strip edge markings on inset prints |
| inspo-2.jpg | Xefirotarch portfolio site | Black with fine horizontal scanline texture; multi-column text-list nav (dim grey caps, active = white); media windows with a header row (`PROJECT: CELL` left, `RENDER` right) and a footer control bar (dot pagination, `0/13  < >  TEXT`); a wide-spaced mono ticker line at the bottom |
| inspo-3.jpg | Green Winamp skin ("Vision") | Hardware-panel language: LCD numeric readout, EQ sliders, pill transport buttons, labelled module tabs (`VISION`, `ENGINE`). Take the structure, not the green |
| inspo-4.jpg | The Attik / NOISE 3.5 | Interlocking grey bar blocks and tab shapes around a heavy header; a rounded tab with an arrow; giant cyan blueprint shapes plus technical-drawing annotation lines; a numbered thumbnail grid (01–08) with an index list (`01 Kodak Cineon…`); wide-spaced caps CTA ("CLICK TO PREVIEW") |
| inspo-5.png | Floodgear v7.2 (2001) | Blue chrome splash collage bleeding off the top-left; content column bounded by a hairline that curves at the bottom corner; stacked small right-aligned nav buttons with tab notches; `:: FEBRUARY 22 2001 ::` headers; dotted separators; chamfered thumbnail frame with vertical "HELP / CLICK TO SEE"; arrow callouts with labels (`↙ weblogs:luke`); vertical tick numbers (04–09) down the margin |
| inspo-6.png | "breeder unit" Winamp skin (blue) | **Closest palette match**: steel-blue panels, silver biomech chrome, cyan glass orbs as indicators, pixel/LCD readouts, `::breed::` double-colon framing, dot-matrix microtext, a highlighted playlist row, stacked modules joined by centre notch connectors, hex-link logo |

## The shared language
1. **Palette:** already ours (steel blue, silver, deep black). The refs use cyan/ice as **light**: glows, glass, highlights. Loosen "accent is rare" to: no solid blue slabs, but ice light/glass can appear in every HUD element.
2. **Type:** ultra-wide spaced caps for display and labels (Orbitron fits); pixel/LCD faces for readouts and numbers (ChonkyPixels; use it more); a small plain sans for body; `:: LABEL ::` framing; numbered indexes (01, 02…).
3. **Panels/windows:** a header row with label left and meta right, then content, then a footer control bar. Panels have chamfered/notched corners or one curved corner; modules stack with notch connectors. Hairline frames by default, with chrome bevel only on 1–2 hero objects.
4. **HUD overlays:** hairline grid, crosshairs/targeting rings, registration marks, vertical tick rulers with numbers, micro data-text blocks, arrow callouts with labels.
5. **Texture:** fine horizontal scanlines over black; grain (already present); duotone photo collage with overlapping translucent rectangles.

## Caution for the unslop/impeccable passes
Their generic "AI tells" (uppercase tracked labels, glows, numbered section indices, HUD micro-labels) ARE this reference language. When a critique flags one of them, keep it if it's executed in the refs' manner: hairline, purposeful, data-like. Remove it only when it's random decoration with no system behind it. (The earlier build removed section labels/indices and a barcode as "template tells". Reintroduce them in the refs' idiom.)

## Proposed mapping to the site
- **Nav:** desktop = Xefirotarch-style text list (dim → white active) or Floodgear stacked tab buttons, with a `::ÄGAPĒ::` mark. Mobile menu = a full-screen panel with a header row and footer bar.
- **Hero:** add HUD over the video: a targeting ring, a wide-spaced `W I N T E R` line, a vertical tick ruler with numbers, a micro data block (coords for Industry City, dates, `CH.01`), an arrow callout `↙ get tickets`. Countdown as an LCD readout (pixel font, `T-112 : DAYS`).
- **Lineup = playlist module** (breeder/Winamp): an LCD header (`DAY 1 :: FRI 02.19.27`), numbered rows `01. DIOSSA`, a highlighted row on hover/focus, redaction blobs for TBAs, a small EQ-bar strip as a header ornament (static or very low-cost).
- **Tickets:** a "player" panel: an LCD readout of date/venue/status, hologram transport-style buttons (`▶ GET TICKETS`), footer bar `DICE  < >  INFO`.
- **Artist select:** the hero chrome object. breeder-style frame (centre notch connector, cyan orb indicators, LCD artist readout: `DAY 2 / STAGE 01 / STATUS: CONFIRMED`) around the SF5-style split layout.
- **Merch:** Xefirotarch windows: `ITEM: LIBERTY TEE` / `VIEW` header, image, footer bar `0/2  < >  SHOP`.
- **FAQ:** Floodgear news column: `:: QUESTION ::` headers, dotted separators, one curved panel corner.
- **Getting Here:** Attik blueprint: the map/route as a line drawing with technical annotation callouts.
- **Background/texture:** add fine scanlines over the tower footage; the vertical tick ruler runs down the page margin as scroll progress (already partly present).
- **Section intros:** wide-spaced caps title + index (`03 :: TICKETS`) + a micro data line.

Build all chrome as CSS/SVG (hairlines, clip-path chamfers, SVG notch connectors), not raster images, to keep it sharp and cheap. Animation stays transforms/opacity only.
