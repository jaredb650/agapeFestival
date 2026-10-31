// Frost type: Newsreader (editorial serif) for large headlines and display
// figures only, Inter for everything else. Newsreader is the static 400 cut
// (22 KB; the variable file with the optical-size axis was 131 KB), Inter the
// variable file (400/500). Both subset to Latin; characters outside it (the Ē
// in ÄGAPĒ) come from the latin-ext file, fetched only when such a glyph shows.
import { Inter, Newsreader } from "next/font/google";

export const serif = Newsreader({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--fr-font-serif",
});

export const sans = Inter({
  subsets: ["latin"],
  style: "normal",
  display: "swap",
  variable: "--fr-font-sans",
});

export const frostFontVariables = `${serif.variable} ${sans.variable}`;
