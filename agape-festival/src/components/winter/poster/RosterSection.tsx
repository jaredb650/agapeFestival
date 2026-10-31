import dynamic from "next/dynamic";
import { ARTISTS, SHOW_ARTIST_SELECT, WINTER_DAYS } from "@/data/winter";
import { SectionHead } from "./SectionHead";
import type { RosterArtist } from "./Roster";

// Behind the env literal (inlined at build time), so builds without the flag carry none of the roster's JS.
const Roster =
  process.env.NEXT_PUBLIC_SHOW_ARTIST_SELECT === "1" ? dynamic(() => import("./Roster").then((m) => m.Roster)) : null;

/** Gated by NEXT_PUBLIC_SHOW_ARTIST_SELECT; renders nothing when it is off. */
export function RosterSection({ index }: { index: string }) {
  if (!SHOW_ARTIST_SELECT || !Roster) return null;
  // Named acts in flyer order per day, then the unannounced slots.
  const artists: RosterArtist[] = [...ARTISTS]
    .sort((a, b) => Number(a.kind === "tba") - Number(b.kind === "tba"))
    .map((a) =>
      a.kind === "artist"
        ? {
            slug: a.slug,
            name: a.name,
            day: a.day,
            locked: false,
            bio: a.bio,
            photo: a.headshotLarge ?? a.headshot,
            clip: a.clip,
            clipPoster: a.clipPoster,
            focus: a.splashFocus ?? "50% 30%",
            socials: a.socials ?? [],
          }
        : { slug: a.slug, name: a.name, day: a.day, locked: true, bio: null, photo: null, clip: null, clipPoster: null, focus: "50% 50%", socials: [] },
    );
  const days = WINTER_DAYS.map((d) => ({ day: d.day, label: `Day ${d.day} · ${d.dateLong.replace(/, \d{4}$/, "")}` }));
  // Open on the first act with footage (Flash Gea today).
  const initial = (artists.find((a) => a.clip) ?? artists.find((a) => !a.locked) ?? artists[0]).slug;

  return (
    <section id="artists" className="pp-sec" aria-labelledby="artists-title" data-reveal>
      <SectionHead index={index} id="artists-title" title="The roster" meta="Photos, clips and bios as they are announced" />
      <Roster artists={artists} days={days} initial={initial} />
    </section>
  );
}
