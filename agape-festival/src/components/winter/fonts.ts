// Winter Edition type stack. Each font exposes a CSS variable; winter.css
// reads them via --w-font-*. Apply `winterFontVariables` to <body> (or the
// `.winter` root) once.
//
// --font-display: stand-in for the flyer's lineup face (best guess ABC Whyte
// Inktrap, not licensed yet). Bricolage Grotesque at heavy weight + low optical
// size shows ink traps; to swap later, replace this one definition and keep
// the variable name.
import { Orbitron, Outfit } from "next/font/google";
import localFont from "next/font/local";

// Self-hosted instance of Bricolage Grotesque (OFL) cut to what winter.css uses:
// wght 800, opsz 12–14, wdth 75–92. Identical outlines at those settings and
// 43 KB instead of 131 KB, which matters because the hero title is the LCP.
// Rebuild: context/winter-redesign/media-scripts/instance_bricolage.py.
export const displayFont = localFont({
  src: "../../../public/assets/fonts/bricolage-winter-800-latin.woff2",
  weight: "800",
  display: "swap",
  variable: "--font-display",
  adjustFontFallback: "Arial",
});

// Ē and the rest of latin-ext live in a second face. It's listed after the
// latin face in --w-font-display, so it only downloads when such a glyph shows.
export const displayExtFont = localFont({
  src: "../../../public/assets/fonts/bricolage-winter-800-latin-ext.woff2",
  weight: "800",
  display: "swap",
  preload: false,
  variable: "--font-display-ext",
  adjustFontFallback: false,
});

export const hudFont = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
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
export const winterFontVariables = [
  displayFont.variable,
  displayExtFont.variable,
  hudFont.variable,
  bodyFont.variable,
  pixelFont.variable,
].join(" ");
