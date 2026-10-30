"use client";

import { useState } from "react";
import type { MerchItem } from "@/data/winter";

/**
 * Ported from the Sept site: back print at rest, the front CRT-glitches in on
 * hover (mirrors the shop theme). The ref check catches images the browser
 * completed from cache before hydration attached onLoad (otherwise the card
 * would sit at opacity 0 forever on refresh).
 */
export function MerchCard({ item, href }: { item: MerchItem; href: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <a href={href} className="wmerch-card">
      <span className="wmerch-card__window">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.backImage}
          alt={`${item.name}, ÄGAPĒ Festival merch, back print`}
          loading="lazy"
          decoding="async"
          width={800}
          height={800}
          ref={(el) => {
            if (el?.complete && el.naturalWidth > 0) setLoaded(true);
          }}
          onLoad={() => setLoaded(true)}
          className="wmerch-card__back"
          data-loaded={loaded || undefined}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.frontImage} alt="" aria-hidden="true" loading="lazy" decoding="async" width={800} height={800} className="wmerch-card__front" />
        <span className="wmerch-card__sweep" aria-hidden="true" />
      </span>
      <span className="wmerch-card__info">
        <span className="wmerch-card__name">{item.name}</span>
        <svg className="wmerch-card__arrow" viewBox="0 0 22 10" fill="none" aria-hidden="true">
          <path d="M0 5h20M16 1l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </span>
    </a>
  );
}
