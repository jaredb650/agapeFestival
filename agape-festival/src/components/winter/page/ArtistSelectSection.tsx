import dynamic from "next/dynamic";
import { Section } from "@/components/winter/classic";
import { ARTISTS, SHOW_ARTIST_SELECT, WINTER, WINTER_DAYS } from "@/data/winter";

// Its own chunk + CSS (dynamic import), so the roster's code stays out of the main bundle.
const Roster = dynamic(() => import("@/components/winter/artist-select/Roster").then((m) => m.Roster));

/**
 * The roster: the section heading, then per day a stage heading and a grid of artist cards
 * (artist-select/Roster.tsx). Pressing a card pops its bio out of it.
 * On everywhere (SHOW_ARTIST_SELECT in data/winter.ts).
 */
export function ArtistSelectSection() {
  if (!SHOW_ARTIST_SELECT) return null;
  return (
    <Section id="artists" title="The roster" className="rs-sec">
      <Roster artists={ARTISTS} days={WINTER_DAYS} id="artists" venue={`${WINTER.venue.name}, ${WINTER.venue.city}`} />
      {/* Without JS nothing sets data-tex (roster.css), so the texture is applied here instead. */}
      <noscript>
        <style>{`.rs .rs-card__media:not([data-photo],.rs-tba){background-image:url(/assets/winter/texture/threads.webp)}`}</style>
      </noscript>
    </Section>
  );
}
