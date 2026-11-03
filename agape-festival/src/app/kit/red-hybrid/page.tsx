import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

// Preview + dev only. NEXT_PUBLIC_SHOW_ARTIST_SELECT is inlined at build time by next.config.ts: "1" on
// Cloudflare branch previews (CF_PAGES=1, branch ≠ main), "0" for the GitHub Pages production build. Behind
// the literal, the bundler drops the showcase (and the kit's JS + CSS) from production builds entirely;
// the route then renders the 404.
const Showcase =
  process.env.NEXT_PUBLIC_SHOW_ARTIST_SELECT === "1" || process.env.NODE_ENV === "development"
    ? dynamic(() => import("./Showcase").then((m) => m.Showcase))
    : null;

export const metadata: Metadata = {
  title: "Red hybrid kit",
  description: "The blue HUD build's cyber frames and chrome (c9688b5), as an opt-in alternate kit.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function RedHybridKitPage() {
  if (!Showcase) notFound();
  return <Showcase />;
}
