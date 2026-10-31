import dynamic from "next/dynamic";
import { ARTISTS, ARTIST_PENDING, SHOW_ARTIST_SELECT, WINTER_DAYS } from "@/data/winter";
import { BG, FLYER } from "./media";

// Own chunk + CSS, and the import sits behind the env literal (inlined at build
// time) so the bundler drops it from builds without the flag: the hidden
// production page carries none of the artist select's JS or CSS.
const ArtistSelect =
  process.env.NEXT_PUBLIC_SHOW_ARTIST_SELECT === "1"
    ? dynamic(() => import("@/components/winter/artist-select/ArtistSelect").then((m) => m.ArtistSelect))
    : null;

const logoFestival = FLYER.layers.find((l) => l.id === "logo-festival")!;

/**
 * "Artist profiler": the split character select (Day 1 blue on the left, Day 2
 * red on the right; one day at a time on phones).
 * Gated by NEXT_PUBLIC_SHOW_ARTIST_SELECT; renders nothing when it's off.
 */
export function ArtistSelectSection({ bgAt }: { bgAt?: number }) {
  if (!SHOW_ARTIST_SELECT || !ArtistSelect) return null;
  return (
    <section id="artists" className="asel-section" aria-labelledby="artists-title" data-bg-at={bgAt}>
      <ArtistSelect
        artists={ARTISTS}
        days={WINTER_DAYS}
        pending={ARTIST_PENDING}
        headingId="artists-title"
        title="The roster"
        media={{
          frameDir: BG.frames.dir,
          tileStill: BG.posterMobile.src,
          emblem: { src: logoFestival.src, width: logoFestival.width, height: logoFestival.height },
          dayLabels: {
            1: { src: FLYER.dayLabels[1].src, width: FLYER.dayLabels[1].width, height: FLYER.dayLabels[1].height },
            2: { src: FLYER.dayLabels[2].src, width: FLYER.dayLabels[2].width, height: FLYER.dayLabels[2].height },
          },
        }}
      />
    </section>
  );
}
