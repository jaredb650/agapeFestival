"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Breeder-unit bezel for the map panel (same language as the artist select's
 * StageFrame): chamfered corners, a centre notch on the top edge that houses
 * the label, a second hairline inside, chrome pins and side rails with ticks.
 * Drawn at the measured pixel size so nothing stretches. Decorative.
 */
export function HudBezel({ label }: { label: string }) {
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

  const g = size ? geom(size.w) : null;

  return (
    <div ref={ref} className="wgh-bezel" aria-hidden="true">
      {size && g && size.w > 120 && (
        <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} focusable="false">
          <path className="wgh-bezel__outer" d={bezel(size.w, size.h, 0, g)} pathLength={1} />
          <path className="wgh-bezel__inner" d={bezel(size.w, size.h, 6, g)} />
          <path className="wgh-bezel__pins" d={pins(size.w, g)} />
          <path className="wgh-bezel__rails" d={rails(size.w, size.h, g)} />
          <path className="wgh-bezel__corners" d={corners(size.w, size.h, g)} />
        </svg>
      )}
      <span className="wgh-bezel__label" data-decode="120" style={g ? { width: g.nw } : undefined}>
        {label}
      </span>
    </div>
  );
}

interface G {
  c: number; // corner chamfer
  nw: number; // notch floor width
  nd: number; // notch depth
  ns: number; // notch slope run
}

function geom(w: number): G {
  const small = w < 600;
  return { c: small ? 14 : 24, nw: Math.min(small ? 220 : 330, w * 0.56), nd: small ? 18 : 24, ns: small ? 16 : 24 };
}

function bezel(w: number, h: number, i: number, { c: C, nw, nd, ns }: G) {
  const c = C - i * 0.42;
  const l = i + 0.5;
  const t = i + 0.5;
  const r = w - i - 0.5;
  const b = h - i - 0.5;
  const mid = w / 2;
  const half = nw / 2 - i * 0.42;
  return [
    `M${l + c} ${t}`,
    `H${mid - half - ns}`,
    `L${mid - half} ${t + nd}`,
    `H${mid + half}`,
    `L${mid + half + ns} ${t}`,
    `H${r - c}`,
    `L${r} ${t + c}`,
    `V${b - c}`,
    `L${r - c} ${b}`,
    `H${l + c}`,
    `L${l} ${b - c}`,
    `V${t + c}`,
    "Z",
  ].join(" ");
}

/** Chrome ticks either side of the notch floor (the connector "pins"). */
function pins(w: number, { nw, nd }: G) {
  const mid = w / 2;
  const y = 0.5 + nd + 5;
  return `M${mid - nw / 2 + 10} ${y}h18M${mid + nw / 2 - 28} ${y}h18`;
}

/** Short tick ladders on both side rails, mid-height. */
function rails(w: number, h: number, { c }: G) {
  const out: string[] = [];
  const y0 = h / 2 - 40;
  for (let k = 0; k < 9; k++) {
    const y = y0 + k * 10;
    const len = k % 4 === 0 ? 8 : 4;
    out.push(`M${-6} ${y}h${-len}`, `M${w + 6} ${y}h${len}`);
  }
  // Bottom-centre index ticks.
  for (let k = -3; k <= 3; k++) out.push(`M${w / 2 + k * 14} ${h + 6}v${k === 0 ? 8 : 4}`);
  return out.join("") + `M${c + 30} ${h + 6}h40M${w - c - 70} ${h + 6}h40`;
}

/** Ice accent strokes along each chamfer. */
function corners(w: number, h: number, { c }: G) {
  const o = 0.5;
  return [
    `M${o} ${c + 22}V${c}L${c} ${o}H${c + 22}`,
    `M${w - c - 22} ${o}H${w - c}L${w - o} ${c}V${c + 22}`,
    `M${w - o} ${h - c - 22}V${h - c}L${w - c} ${h - o}H${w - c - 22}`,
    `M${c + 22} ${h - o}H${c}L${o} ${h - c}V${h - c - 22}`,
  ].join("");
}
