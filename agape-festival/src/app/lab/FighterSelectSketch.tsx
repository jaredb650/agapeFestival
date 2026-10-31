"use client";

import { ArtistSelect } from "@/components/winter/artist-select/ArtistSelect";
import { ARTISTS, ARTIST_PENDING, WINTER_DAYS } from "@/data/winter";

// The lab shows the real artist select (the page section renders the same
// component). Paths mirror public/assets/winter/manifest.json; the page reads
// them from media.ts, which is server-only.
const MEDIA = {
  frameDir: "/assets/winter/bg/frames/",
  tileStill: "/assets/winter/bg/poster-mobile.webp",
  emblem: { src: "/assets/winter/flyer/layers/logo-festival.webp", width: 355, height: 203 },
  dayLabels: {
    1: { src: "/assets/winter/flyer/layers/day1-label.webp", width: 211, height: 92 },
    2: { src: "/assets/winter/flyer/layers/day2-label.webp", width: 244, height: 103 },
  },
} as const;

/** Props kept for LabView's call site; the artist data (incl. Flash Gea's headshot) comes from winter.ts. */
export function FighterSelectSketch(props: { poster: string; flashGeaHeadshot: string }) {
  void props;
  return (
    <div className="lab-fighter">
      <ArtistSelect artists={ARTISTS} days={WINTER_DAYS} media={MEDIA} pending={ARTIST_PENDING} headingId="lab-select-title" title="Artist profiler" />
    </div>
  );
}
