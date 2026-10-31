import dynamic from "next/dynamic";
import { SectionGrid, SectionHeader } from "@/components/winter/grid";
import { ARTISTS, SHOW_ARTIST_SELECT, WINTER, WINTER_DAYS } from "@/data/winter";

// Own chunk + CSS, and the import sits behind the env literal (inlined at build time) so the bundler
// drops it from builds without the flag: the hidden production page carries none of the roster's JS or CSS.
const Roster =
  process.env.NEXT_PUBLIC_SHOW_ARTIST_SELECT === "1"
    ? dynamic(() => import("@/components/winter/artist-select/Roster").then((m) => m.Roster))
    : null;

/**
 * The roster: the section header, one featured artist across the full width, then a row of tiles per
 * day (artist-select/Roster.tsx). Pressing the feature opens the bio panel.
 * Gated by NEXT_PUBLIC_SHOW_ARTIST_SELECT; renders nothing when it's off.
 */
export function ArtistSelectSection() {
  if (!SHOW_ARTIST_SELECT || !Roster) return null;
  return (
    <SectionGrid id="artists" labelledBy="artists-title" className="rs">
      <SectionHeader id="artists-title" title="The roster" />
      <Roster artists={ARTISTS} days={WINTER_DAYS} id="artists" venue={`${WINTER.venue.name}, ${WINTER.venue.city}`} />
    </SectionGrid>
  );
}
