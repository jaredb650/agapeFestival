// Winter Edition type stack. Each font exposes a CSS variable; winter.css
// reads them via --w-font-*. Apply `winterFontVariables` to <body> (or the
// `.winter` root) once.
//
// Display face = Orbitron black, the September site's heading face. It is the
// same variable file as the HUD labels (wght 400–900), so the display type
// costs no extra download. winter.css resolves the display face as
// `var(--font-display, var(--font-hud))`: to swap it later (e.g. ABC Whyte
// Inktrap once licensed), add a font here with `variable: "--font-display"`
// and list it in `winterFontVariables`. Nothing else needs to change.
//
// The files are self-hosted subsets (context/winter-redesign/media-scripts/
// p3_fonts.py): only the glyphs the site sets, with the same outlines, metrics
// and OpenType features the Google Fonts files had. Orbitron 11.8 → 9.5 KB;
// Outfit 47 KB in two files (latin + latin-ext) → 21 KB in one. Rerun the
// script after adding copy with new characters.
import localFont from "next/font/local";

// Variable axis so display can sit at 800/900 and labels at 400/700.
export const hudFont = localFont({
  src: "./load/fonts/orbitron.woff2",
  weight: "400 900",
  style: "normal",
  display: "swap",
  variable: "--font-hud",
});

// Body copy sits below the hero, so it isn't preloaded (keeps the hero image's bandwidth on mobile).
// The weight axis is trimmed to the 300–500 the page uses.
export const bodyFont = localFont({
  src: "./load/fonts/outfit.woff2",
  weight: "300 500",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-body",
});

// Chonky Pixels: the hero's WINTER EDITION + date (as deployed), so it is above the fold now. 4 KB: preloaded.
export const pixelFont = localFont({
  src: "../../../public/assets/fonts/ChonkyPixels.woff2",
  display: "swap",
  preload: true,
  variable: "--font-pixel",
});

/** Space-separated variable classNames for <body> or the `.winter` root. */
export const winterFontVariables = [hudFont.variable, bodyFont.variable, pixelFont.variable].join(" ");
