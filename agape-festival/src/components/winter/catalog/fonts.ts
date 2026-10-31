// Catalog variant: one monospace family for everything, weights 400/500.
// `subsets` only decides what is preloaded: the latin-ext face (Ē in ÄGAPĒ)
// is still declared and loads on demand through its unicode-range.
import { IBM_Plex_Mono } from "next/font/google";

export const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  style: "normal",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});
