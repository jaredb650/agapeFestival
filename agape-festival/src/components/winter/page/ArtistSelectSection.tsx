import { SectionHeading } from "@/components/winter/ui";
import { ARTISTS, ARTIST_PENDING, WINTER_DAYS } from "@/data/winter";
import { ArtistSelect } from "./ArtistSelect";
import { NO_SIGNAL_STILL } from "./media";

/** Gated by NEXT_PUBLIC_SHOW_ARTIST_SELECT (the page only renders this when SHOW_ARTIST_SELECT). */
export function ArtistSelectSection({ bgAt }: { bgAt?: number }) {
  const locked = ARTISTS.filter((a) => a.kind === "tba").length;
  return (
    <section id="artists" className="w-section wartists" aria-labelledby="artists-title" data-bg-at={bgAt}>
      <div className="w-container">
        <SectionHeading title="Choose your fighter" id="artists-title">
          Hover or tap a tile to load an artist. {locked === 3 ? "Three" : locked} slots stay locked until the reveal.
        </SectionHeading>
        <ArtistSelect
          artists={ARTISTS}
          dayDates={{ 1: WINTER_DAYS[0].date, 2: WINTER_DAYS[1].date }}
          noSignal={NO_SIGNAL_STILL}
          pending={ARTIST_PENDING}
        />
      </div>
    </section>
  );
}
