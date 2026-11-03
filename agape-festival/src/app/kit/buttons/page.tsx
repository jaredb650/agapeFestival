import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { GettingHere } from "@/components/winter/page/GettingHere";
import { BG } from "@/components/winter/page/media";
import { WINTER } from "@/data/winter";

// Preview + dev only, exactly like /kit/red-hybrid. NEXT_PUBLIC_SHOW_ARTIST_SELECT is inlined at build time
// by next.config.ts: "1" on Cloudflare branch previews (CF_PAGES=1, branch ≠ main), "0" for the GitHub Pages
// production build. Behind the literal, the bundler drops the showcase from production builds entirely;
// the route then renders the 404.
const Showcase =
  process.env.NEXT_PUBLIC_SHOW_ARTIST_SELECT === "1" || process.env.NODE_ENV === "development"
    ? dynamic(() => import("./Showcase").then((m) => m.Showcase))
    : null;

export const metadata: Metadata = {
  title: "Buttons",
  description: "The classic-refined control family: every variant, state and size, on the site's background.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function ButtonsKitPage() {
  if (!Showcase) notFound();
  return (
    <Showcase
      background={BG.posterDesktop.src}
      address={WINTER.venue.addressFull}
      routes={<GettingHere />}
    />
  );
}
