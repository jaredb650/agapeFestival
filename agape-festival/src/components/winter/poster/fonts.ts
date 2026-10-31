// Poster variant type: one grotesk family for everything (headlines set large
// and tight, interface text at 14–16px). Weights used: 400 and 500.
// `subsets` only controls preloading: the latin-ext face (for Ē in ÄGAPĒ) is
// still declared with its unicode-range and loads only when that glyph renders.
import { Archivo } from "next/font/google";

export const posterSans = Archivo({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-poster",
});
