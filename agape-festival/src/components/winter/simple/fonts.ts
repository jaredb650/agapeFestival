// Type for the simple page: Instrument Sans for everything you read, DM Mono
// only for figures (the countdown, dates, times). Two families, latin only.
import { DM_Mono, Instrument_Sans } from "next/font/google";

// Variable weight + width: the lineup credits use the slightly narrow cut (wdth 88).
export const sans = Instrument_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-sans",
});

export const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
  variable: "--font-mono",
});

export const fontVariables = `${sans.variable} ${mono.variable}`;
