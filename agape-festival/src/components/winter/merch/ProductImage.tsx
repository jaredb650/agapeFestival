import type { SyntheticEvent } from "react";

// The product photographs are served by Shopify's CDN, which resizes on `width=` (and sends WebP/AVIF
// to browsers that take them), so one URL gives a full srcset. All are ~6:5 on a pure black ground.
const WIDTHS = [400, 800, 1200, 1600];

/** The preview's slot: half the merch board from 768px (beside the cards), the full width on phones. */
export const PREVIEW_SIZES = "(min-width: 768px) 50vw, 100vw";

const withWidth = (url: string, w: number) => (/[?&]width=\d+/.test(url) ? url.replace(/([?&])width=\d+/, `$1width=${w}`) : `${url}${url.includes("?") ? "&" : "?"}width=${w}`);
const srcSetOf = (url: string) => WIDTHS.map((w) => `${withWidth(url, w)} ${w}w`).join(", ");

/** A lazy product photograph with a Shopify srcset. `alt=""` when the name is already beside it. */
export function ProductImage({ src, sizes, alt, onLoad }: { src: string; sizes: string; alt: string; onLoad?: (e: SyntheticEvent<HTMLImageElement>) => void }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={withWidth(src, 800)}
      srcSet={srcSetOf(src)}
      sizes={sizes}
      alt={alt}
      width={1200}
      height={1000}
      loading="lazy"
      decoding="async"
      draggable={false}
      onLoad={onLoad}
    />
  );
}

const warmed = new Set<string>();

/** Start fetching a product's preview photographs (same srcset and sizes, so the preview hits the cache). */
export function warmPreview(...urls: string[]) {
  for (const url of urls) {
    if (warmed.has(url)) continue;
    warmed.add(url);
    const img = new Image();
    img.decoding = "async";
    img.sizes = PREVIEW_SIZES;
    img.srcset = srcSetOf(url);
    img.src = withWidth(url, 800);
  }
}
