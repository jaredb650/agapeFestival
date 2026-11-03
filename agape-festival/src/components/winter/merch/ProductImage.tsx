import type { SyntheticEvent } from "react";

// The locked silhouettes (public/assets/winter/merch): each garment's shadow at two widths, WebP with
// alpha on a transparent ground, about 7:6. `src` is the base path; the width and extension are added here.
const WIDTHS = [640, 1280];

/** The preview's slot: half the merch board from 768px (beside the cards), the full width on phones. */
export const PREVIEW_SIZES = "(min-width: 768px) 50vw, 100vw";

const at = (base: string, w: number) => `${base}-${w}.webp`;
const srcSetOf = (base: string) => WIDTHS.map((w) => `${at(base, w)} ${w}w`).join(", ");

/** A lazy silhouette with its srcset. `alt=""` when the name is already beside it. */
export function ProductImage({ src, sizes, alt, onLoad }: { src: string; sizes: string; alt: string; onLoad?: (e: SyntheticEvent<HTMLImageElement>) => void }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={at(src, WIDTHS[0])}
      srcSet={srcSetOf(src)}
      sizes={sizes}
      alt={alt}
      width={1280}
      height={1100}
      loading="lazy"
      decoding="async"
      draggable={false}
      onLoad={onLoad}
    />
  );
}

const warmed = new Set<string>();

/** Start fetching a product's preview images (same srcset and sizes, so the preview hits the cache). */
export function warmPreview(...urls: string[]) {
  for (const url of urls) {
    if (warmed.has(url)) continue;
    warmed.add(url);
    const img = new Image();
    img.decoding = "async";
    img.sizes = PREVIEW_SIZES;
    img.srcset = srcSetOf(url);
    img.src = at(url, WIDTHS[0]);
  }
}
