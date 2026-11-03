import { Section } from "@/components/winter/classic";
import { GalleryRail, type GalleryPhoto } from "@/components/winter/gallery/GalleryRail";
import { orbitronSafe } from "@/components/winter/ui/orbitron";
import { GALLERY } from "@/data/gallery";
import "@/styles/sections/gallery.css";

/**
 * The card's width at each breakpoint (gallery.css, --gl-card). `sizes` is built from it, so keep the two
 * in step. Cards are 3:4; a wider photo (07, 3:2) fills the card's height, so it asks for proportionally
 * more pixels.
 */
const CARD: [query: string | null, vw: number, cap?: number][] = [
  ["(min-width: 1024px)", 34, 480],
  ["(min-width: 768px)", 46],
  [null, 78],
];

function sizesFor(width: number, height: number): string {
  const f = Math.max(1, width / height / (3 / 4));
  return CARD.map(([q, vw, cap]) => {
    const size = cap ? `min(${vw * f}vw, ${Math.round(cap * f)}px)` : `${vw * f}vw`;
    return q ? `${q} ${size}` : size;
  }).join(", ");
}

/** Each original has 480 and 960 px siblings (`01-crowd-480.webp`, `01-crowd-960.webp`). */
function srcSetFor(src: string, width: number): string {
  const base = src.replace(/\.webp$/, "");
  return `${base}-480.webp 480w, ${base}-960.webp 960w, ${src} ${width}w`;
}

/**
 * Gallery: the September 2026 site's "The first edition" photo carousel, brought into the classic page
 * after the FAQ. Same 18 photographs, order and alt text (data/gallery.ts). The September version was a
 * full-screen, auto-advancing loop; here it is a native scroll-snap rail (no animation loop): the cards
 * start on the heading's edge and run out to the right of the screen, with previous / next, a counter
 * and the September progress bar below. Server wrapper; the rail's controls are the one client island.
 */
export function Gallery() {
  const photos: GalleryPhoto[] = GALLERY.map((p) => ({
    src: p.src,
    srcSet: srcSetFor(p.src, p.width),
    sizes: sizesFor(p.width, p.height),
    alt: p.alt,
    width: p.width,
    height: p.height,
  }));
  return (
    <Section id="gallery" eyebrow={orbitronSafe("ÄGAPE FESTIVAL / 2026")} title="The first edition" className="gl">
      <GalleryRail photos={photos} date="September 05, 2026" credit="Photography / @emilyguzz" />
    </Section>
  );
}
