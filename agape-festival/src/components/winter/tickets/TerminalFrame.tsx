"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The access terminal's bezel (artist-select language): chamfered corners, a
 * notch connector on the top edge housing the label, a shallower one on the
 * bottom edge, a second hairline inside, connector pins and tick rulers down
 * both sides. Drawn as SVG at the measured pixel size so chamfers and notches
 * never stretch. Decorative.
 */
export function TerminalFrame({ label, foot }: { label: string; foot?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setSize((s) => (s && Math.abs(s.w - width) < 1 && Math.abs(s.h - height) < 1 ? s : { w: Math.round(width), h: Math.round(height) }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const g = size ? geometry(size.w) : null;

  return (
    <div ref={ref} className="tk-frame tk-in" data-in="frame" aria-hidden="true">
      {size && g && size.w > 160 && (
        <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} focusable="false">
          <path className="tk-frame__outer" d={bezel(size.w, size.h, 0, g)} />
          <path className="tk-frame__inner" d={bezel(size.w, size.h, 6, g)} />
          <path className="tk-frame__pins" d={pins(size.w, size.h, g)} />
          <path className="tk-frame__ticks" d={ticks(size.w, size.h, g)} />
        </svg>
      )}
      <span className="tk-frame__label" style={g ? { height: g.nd } : undefined}>
        {label}
      </span>
      {foot && (
        <span className="tk-frame__foot" style={g ? { height: g.bd } : undefined}>
          {foot}
        </span>
      )}
    </div>
  );
}

interface Geo {
  /** corner chamfer */
  c: number;
  /** top notch floor half-width, depth, slope run */
  nh: number;
  nd: number;
  ns: number;
  /** bottom notch floor half-width, depth */
  bh: number;
  bd: number;
}

function geometry(w: number): Geo {
  const compact = w < 720;
  return compact
    ? { c: 14, nh: Math.min(118, w * 0.3), nd: 20, ns: 18, bh: Math.min(84, w * 0.22), bd: 14 }
    : { c: 24, nh: 170, nd: 24, ns: 24, bh: 120, bd: 16 };
}

/** Chamfered rectangle with a top-centre notch and a shallower bottom one, inset by `i`. */
function bezel(w: number, h: number, i: number, g: Geo) {
  const k = i * 0.42;
  const c = g.c - k;
  const l = i + 0.5;
  const t = i + 0.5;
  const r = w - i - 0.5;
  const b = h - i - 0.5;
  const mid = w / 2;
  const nh = g.nh - (i ? k : 0);
  const bh = g.bh - (i ? k : 0);
  return [
    `M${l + c} ${t}`,
    `H${mid - nh - g.ns}`,
    `L${mid - nh} ${t + g.nd}`,
    `H${mid + nh}`,
    `L${mid + nh + g.ns} ${t}`,
    `H${r - c}`,
    `L${r} ${t + c}`,
    `V${b - c}`,
    `L${r - c} ${b}`,
    `H${mid + bh + g.bd}`,
    `L${mid + bh} ${b - g.bd}`,
    `H${mid - bh}`,
    `L${mid - bh - g.bd} ${b}`,
    `H${l + c}`,
    `L${l} ${b - c}`,
    `V${t + c}`,
    "Z",
  ].join(" ");
}

/** Short chrome pins either side of each notch floor (the connector). */
function pins(w: number, h: number, g: Geo) {
  const mid = w / 2;
  const y = g.nd + 5.5;
  const yb = h - g.bd - 5.5;
  return [
    `M${mid - g.nh + 10} ${y}h18M${mid + g.nh - 28} ${y}h18`,
    `M${mid - g.bh + 8} ${yb}h12M${mid + g.bh - 20} ${yb}h12`,
  ].join("");
}

/** Tick rulers inside the left and right edges: a short tick every 12px, a long one every 5th. */
function ticks(w: number, h: number, g: Geo) {
  const top = g.c + 36;
  const bottom = h - g.c - 36;
  if (bottom - top < 60) return "";
  const out: string[] = [];
  const step = 12;
  for (let y = top, n = 0; y <= bottom; y += step, n++) {
    const len = n % 5 === 0 ? 9 : 4;
    const yy = Math.round(y) + 0.5;
    out.push(`M12 ${yy}h${len}M${w - 12} ${yy}h${-len}`);
  }
  return out.join("");
}
