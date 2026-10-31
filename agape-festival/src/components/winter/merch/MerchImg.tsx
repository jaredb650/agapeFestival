"use client";

import { useCallback, useState } from "react";

/**
 * Lazy product image that fades in once decoded. The ref check catches images
 * the browser completed from cache before hydration attached onLoad
 * (otherwise it would sit at opacity 0 forever on refresh). Pattern kept from
 * the Sept site's merch card.
 */
export function MerchImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useCallback((el: HTMLImageElement | null) => {
    if (el?.complete && el.naturalWidth > 0) setLoaded(true);
  }, []);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      loading="lazy"
      decoding="async"
      width={800}
      height={800}
      draggable={false}
      onLoad={() => setLoaded(true)}
      className={className}
      data-loaded={loaded || undefined}
    />
  );
}
