// Winter Edition type stack. Each font exposes a CSS variable; winter.css
// reads them via --w-font-*. Apply `winterFontVariables` to <body> (or the
// `.winter` root) once.
//
// Display face = Orbitron black, the September site's heading face. It is the
// same variable file as the HUD labels (one 12 KB woff2, wght 400–900), so the
// display type costs no extra download. winter.css resolves the display face
// as `var(--font-display, var(--font-hud))`: to swap it later (e.g. ABC Whyte
// Inktrap once licensed), add a font here with `variable: "--font-display"`
// and list it in `winterFontVariables`. Nothing else needs to change.
import { Orbitron, Outfit } from "next/font/google";
import localFont from "next/font/local";

// Variable axis (no fixed weights) so display can sit at 800/900 and labels at 400/700.
export const hudFont = Orbitron({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hud",
});

// Body copy sits below the hero, so it isn't preloaded (keeps the hero image's bandwidth on mobile).
export const bodyFont = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  display: "swap",
  preload: false,
  variable: "--font-body",
});

// Rare accent (artist-select status lines): never worth a preload.
export const pixelFont = localFont({
  src: "../../../public/assets/fonts/ChonkyPixels.woff2",
  display: "swap",
  preload: false,
  variable: "--font-pixel",
});

/** Space-separated variable classNames for <body> or the `.winter` root. */
export const winterFontVariables = [hudFont.variable, bodyFont.variable, pixelFont.variable].join(" ");
