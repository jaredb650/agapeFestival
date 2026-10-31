import dynamic from "next/dynamic";
import { ARTISTS, SHOW_ARTIST_SELECT, WINTER_DAYS } from "@/data/winter";
import { BG } from "@/components/winter/page/media";
import { dayStamp } from "./labels";
import type { RosterDay } from "./RosterView";

// Behind the env literal (inlined at build time) so builds without the flag carry none of this JS.
const RosterView =
  process.env.NEXT_PUBLIC_SHOW_ARTIST_SELECT === "1" ? dynamic(() => import("./RosterView").then((m) => m.RosterView)) : null;

/** Tower-footage frames with strong structure: the still behind each act that has no photo yet. */
const FRAMES = [4, 12, 33, 38, 47, 55, 70, 85, 95, 99, 118, 124, 131, 137];
const frame = (n: number) => `${BG.frames.dir}f-${String(n).padStart(3, "0")}.webp`;

/**
 * The roster: pick an act and see their photo or footage and bio. Only Flash
 * Gea has media so far; everyone else shows a still from the festival's tower
 * footage until theirs arrives. Gated by NEXT_PUBLIC_SHOW_ARTIST_SELECT.
 */
export function Roster({ bgAt }: { bgAt?: number }) {
  if (!SHOW_ARTIST_SELECT || !RosterView) return null;
  let f = 0;
  const days: RosterDay[] = WINTER_DAYS.map((d) => ({
    day: d.day,
    label: `Day ${d.day}`,
    date: dayStamp(d.isoDate),
    acts: [
      ...ARTISTS.filter((a) => a.kind === "artist" && a.day === d.day),
      ...ARTISTS.filter((a) => a.kind === "tba" && a.day === d.day),
    ].map((a) =>
      a.kind === "artist"
        ? {
            slug: a.slug,
            name: a.name,
            locked: false,
            bio: a.bio,
            photo: a.headshot,
            photoLarge: a.headshotLarge,
            clip: a.clip,
            clipPoster: a.clipPoster,
            still: frame(FRAMES[f++ % FRAMES.length]),
            socials: (a.socials ?? []).map((s) => ({ label: s.handle ?? s.platform, url: s.url, platform: s.platform })),
          }
        : {
            slug: a.slug,
            name: "To be revealed",
            locked: true,
            bio: null,
            photo: null,
            photoLarge: null,
            clip: null,
            clipPoster: null,
            still: null,
            socials: [],
          },
    ),
  }));

  return (
    <section id="artists" className="s-sec s-roster" aria-labelledby="artists-title" data-bg-dim="0.8" data-bg-at={bgAt}>
      <header className="s-head" data-reveal="">
        <h2 id="artists-title" className="s-title">
          The roster
        </h2>
        <span className="s-rule" aria-hidden="true" />
        <p className="s-lede">Choose an artist to see their photo, footage and bio.</p>
      </header>
      <RosterView days={days} still={BG.posterMobile.src} />
    </section>
  );
}
