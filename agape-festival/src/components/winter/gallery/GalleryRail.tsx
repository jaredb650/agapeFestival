"use client";

import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/winter/classic";
import { ArrowLeft, ArrowRight } from "@/components/winter/ui/icons";

export interface GalleryPhoto {
  src: string;
  srcSet: string;
  sizes: string;
  alt: string;
  width: number;
  height: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The gallery rail (styles/sections/gallery.css, gl-*). The browser does the scrolling: a horizontal
 * scroll-snap row, swiped on touch, scrolled by trackpad or the arrow keys once focused, stepped by the
 * previous / next buttons. JS only reads the position: one passive scroll listener, at most one rAF per
 * scroll burst (no loop), for the counter, the progress bar and the button states.
 *
 * Images are native lazy (none load until the section is near). Each step also wakes the next few photos
 * (`loading = "eager"`), so a swipe never lands on an empty plate.
 */
export function GalleryRail({ photos, date, credit }: { photos: GalleryPhoto[]; date: string; credit: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [edge, setEdge] = useState<{ start: boolean; end: boolean }>({ start: true, end: false });
  const count = photos.length;

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const max = el.scrollWidth - el.clientWidth;
      const x = Math.max(0, Math.min(max, el.scrollLeft));
      // The scroll range maps evenly onto the photos: 01 at the start, the last one at the end.
      const i = max > 1 ? Math.round((x / max) * (count - 1)) : 0;
      setIndex(i);
      setEdge((e) => {
        const start = x < 2;
        const end = x > max - 2;
        return e.start === start && e.end === end ? e : { start, end };
      });
      const imgs = el.querySelectorAll("img");
      for (let k = i; k < Math.min(count, i + 4); k++) if (imgs[k].loading !== "eager") imgs[k].loading = "eager";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    el.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      el.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [count]);

  const step = (dir: 1 | -1) => {
    const el = rail.current;
    const card = el?.querySelector<HTMLElement>(".gl-card");
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <div className="gl-body" data-reveal="">
      <div
        ref={rail}
        className="gl-rail"
        role="region"
        aria-roledescription="carousel"
        aria-label="Photographs from the first ÄGAPĒ Festival, September 5, 2026"
        tabIndex={0}
        data-nosnippet=""
      >
        {photos.map((p, i) => (
          <figure key={p.src} className="gl-card" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static export; srcset built from pre-encoded widths */}
            <img src={p.src} srcSet={p.srcSet} sizes={p.sizes} width={p.width} height={p.height} alt={p.alt} loading="lazy" decoding="async" draggable={false} />
            <span className="gl-num" aria-hidden="true">
              {pad(i + 1)}
            </span>
          </figure>
        ))}
      </div>
      <div className="gl-foot">
        <div className="gl-bar" aria-hidden="true">
          {photos.map((p, i) => (
            <span key={p.src} data-on={i === index ? "" : undefined} />
          ))}
        </div>
        <p className="gl-meta">
          <span className="k-label gl-meta__date">{date}</span>
          <span className="k-label">{credit}</span>
        </p>
        <div className="gl-nav">
          <p className="gl-count" aria-hidden="true">
            {pad(index + 1)}
            <span> / {pad(count)}</span>
          </p>
          <IconButton
            label="Previous photo"
            icon={<ArrowLeft size={20} />}
            variant="outline"
            aria-disabled={edge.start || undefined}
            onClick={() => !edge.start && step(-1)}
          />
          <IconButton
            label="Next photo"
            icon={<ArrowRight size={20} />}
            variant="outline"
            aria-disabled={edge.end || undefined}
            onClick={() => !edge.end && step(1)}
          />
        </div>
      </div>
    </div>
  );
}
