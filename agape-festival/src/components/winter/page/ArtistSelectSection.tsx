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
 * The roster: one artist's splash above the tile grid (Day 1 white, Day 2 red;
 * one day of keys at a time on phones).
 * Gated by NEXT_PUBLIC_SHOW_ARTIST_SELECT; renders nothing when it's off.
 */
export function ArtistSelectSection({ bgAt }: { bgAt?: number }) {
  if (!SHOW_ARTIST_SELECT || !ArtistSelect) return null;
  return (
    <section id="artists" className="asel-section" aria-labelledby="artists-title" data-bg-at={bgAt} data-pause-offscreen="">
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
        }}
      />
    </section>
  );
}
