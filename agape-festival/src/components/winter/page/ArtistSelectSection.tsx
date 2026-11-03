import dynamic from "next/dynamic";
import { Section } from "@/components/winter/classic";
import { ARTISTS, SHOW_ARTIST_SELECT, WINTER, WINTER_DAYS } from "@/data/winter";

// Own chunk + CSS, and the import sits behind the env literal (inlined at build time) so the bundler
// drops it from builds without the flag: the hidden production page carries none of the roster's JS or CSS.
const Roster =
  process.env.NEXT_PUBLIC_SHOW_ARTIST_SELECT === "1"
    ? dynamic(() => import("@/components/winter/artist-select/Roster").then((m) => m.Roster))
    : null;

/**
 * The roster: the section heading, then per day a stage heading and a grid of artist cards
 * (artist-select/Roster.tsx). Pressing a card pops its bio out of it.
 * Gated by NEXT_PUBLIC_SHOW_ARTIST_SELECT; renders nothing when it's off.
 */
export function ArtistSelectSection() {
  if (!SHOW_ARTIST_SELECT || !Roster) return null;
  return (
    <Section id="artists" title="The roster" className="rs-sec">
      <Roster artists={ARTISTS} days={WINTER_DAYS} id="artists" venue={`${WINTER.venue.name}, ${WINTER.venue.city}`} />
    </Section>
  );
}
