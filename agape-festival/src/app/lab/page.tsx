import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { winterFontVariables } from "@/components/winter/fonts";
import "@/styles/winter.css";
import "./lab.css";
import { LabView } from "./LabView";

// Dev-only style lab. Production builds render 404 unless NEXT_PUBLIC_LAB=1.
const LAB_ENABLED = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_LAB === "1";

export const metadata: Metadata = {
  title: "Style lab · ÄGAPĒ Winter",
  robots: { index: false, follow: false, nocache: true },
};

const exists = (publicPath: string) => fs.existsSync(path.join(process.cwd(), "public", publicPath));

export default function LabPage() {
  if (!LAB_ENABLED) notFound();

  // Prefer the media agent's flyer; fall back to the lab copy.
  const flyer = exists("/assets/winter/flyer/flyer-story-1080.jpg")
    ? "/assets/winter/flyer/flyer-story-1080.jpg"
    : "/assets/winter/lab/flyer-story-1080.webp";
  // Flash Gea is the only act with media; use the Sept press-kit headshot until the winter one lands.
  const flashGeaHeadshot = exists("/assets/winter/artists/flash-gea/headshot-600.webp")
    ? "/assets/winter/artists/flash-gea/headshot-600.webp"
    : "/assets/artists/flashgea/press-kit/flashgea-headshot.webp";

  // The media agent's no-text tower still and cut-out flyer layers, when present.
  const poster = exists("/assets/winter/bg/poster-desktop.webp") ? "/assets/winter/bg/poster-desktop.webp" : flyer;
  const layer = (name: string) => (exists(`/assets/winter/flyer/layers/${name}.webp`) ? `/assets/winter/flyer/layers/${name}.webp` : null);
  const layers = { date: layer("date"), title: layer("title"), mark: layer("logo-mark"), day1: layer("day1-label"), day2: layer("day2-label") };

  return (
    <div className={`winter lab-root ${winterFontVariables}`}>
      <LabView flyer={flyer} poster={poster} layers={layers} flashGeaHeadshot={flashGeaHeadshot} />
    </div>
  );
}
