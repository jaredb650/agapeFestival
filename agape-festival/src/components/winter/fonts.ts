// Winter Edition type stack. Each font exposes a CSS variable; winter.css reads them.
// Apply `winterFontVariables` once, on the `.winter` page root.
//
// - Archivo (--font-ui): the ONE interface face for everything below the hero (grid redesign). Pinned at
//   width 112.5 (semi-expanded), weight 400–500, in one variable file.
// - Orbitron (--font-hud) and Chonky Pixels (--font-pixel): ONLY the frozen hero, flyer and preloader.
//   winter.css scopes them to the hero (.wh); the preloader's inline CSS reads --font-hud directly.
//
// The files are self-hosted subsets: only the glyphs the site sets (ÄGAPĒ, dashes, arrows, Latin-1 for
// names). Archivo: context/winter-redesign/media-scripts/g0_font.py (≈21 KB); Orbitron and Chonky Pixels:
// p3_fonts.py. Rerun after adding copy with new characters.
import localFont from "next/font/local";

/** The interface face. The nav sets it over the hero at first paint, so it is preloaded (≈21 KB). */
export const uiFont = localFont({
  src: "./load/fonts/archivo.woff2",
  weight: "400 500",
  style: "normal",
  display: "swap",
  variable: "--font-ui",
  fallback: ["system-ui", "Arial"],
});

// Variable axis so the hero's display can sit at 700/800 and labels at 400.
export const hudFont = localFont({
  src: "./load/fonts/orbitron.woff2",
  weight: "400 900",
  style: "normal",
  // block, not swap: the hero types its lines in this face (and the pixel one) right after the preloader. With
  // swap, a hard refresh (empty cache) could start the intro in the wider fallback and visibly shrink the text
  // when the real font lands. Both files are tiny and preloaded, and the preloader covers the block period.
  display: "block",
  variable: "--font-hud",
});

// Chonky Pixels: the hero's WINTER EDITION + date (as deployed), so it is above the fold. 4 KB: preloaded.
export const pixelFont = localFont({
  src: "../../../public/assets/fonts/ChonkyPixels.woff2",
  display: "block",
  preload: true,
  variable: "--font-pixel",
});

/** Space-separated variable classNames for the `.winter` root. */
export const winterFontVariables = [uiFont.variable, hudFont.variable, pixelFont.variable].join(" ");
