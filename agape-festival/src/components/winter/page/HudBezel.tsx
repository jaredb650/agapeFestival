"use client";

import { useEffect, useRef, useState } from "react";
import "@/styles/sections/hud-bezel.css";

/**
 * Chrome bezel for the FAQ and footer panels, in the artist select's frame
 * language: chamfered corners, a centre notch on the top edge that houses
 * the label, a second ice hairline 6px inside, and ONE curved corner
 * (bottom-right, the Floodgear content column). Optional bottom notch.
 * Drawn as SVG at the measured pixel size so the chamfers never stretch;
 * it re-measures on resize only. Decorative.
 */
export function HudBezel({ label, bottomLabel, className }: { label: string; bottomLabel?: string; className?: string }) {
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

  const narrow = !!size && size.w < 600;
  const g = narrow ? GEO_SM : GEO;
  const nw = notchWidth(label, narrow);
  const bw = bottomLabel ? notchWidth(bottomLabel, narrow) : 0;

  return (
    <div ref={ref} className={`wbz${className ? ` ${className}` : ""}`} aria-hidden="true">
      {size && size.w > 120 && (
        <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} focusable="false">
          <path className="wbz__fill" d={bezel(size.w, size.h, 0, g, nw, bw)} />
          <path className="wbz__outer" d={bezel(size.w, size.h, 0, g, nw, bw)} />
          <path className="wbz__inner" d={bezel(size.w, size.h, 6, g, nw, bw)} />
          <path className="wbz__pins" d={pins(size.w, size.h, g, nw, bw)} />
          <path className="wbz__accent" d={accents(size.w, size.h, g)} />
        </svg>
      )}
      <span className="wbz__label" style={{ width: nw }}>
        {label}
      </span>
      {bottomLabel && (
        <span className="wbz__label wbz__label--bottom" style={{ width: bw }}>
          {bottomLabel}
        </span>
      )}
    </div>
  );
}

interface Geo {
  c: number; // chamfer
  r: number; // the curved corner's radius
  nd: number; // notch depth
  ns: number; // notch slope run
}
const GEO: Geo = { c: 22, r: 64, nd: 22, ns: 22 };
const GEO_SM: Geo = { c: 14, r: 36, nd: 18, ns: 16 };

/** Notch floor width from the label (Orbitron nano caps, wide tracking). */
function notchWidth(label: string, narrow: boolean) {
  return Math.round(label.length * (narrow ? 7.2 : 8.4) + (narrow ? 28 : 56));
}

function bezel(w: number, h: number, i: number, g: Geo, nw: number, bw: number) {
  const c = g.c - i * 0.42;
  const r = Math.max(4, g.r - i);
  const l = i + 0.5;
  const t = i + 0.5;
  const rr = w - i - 0.5;
  const b = h - i - 0.5;
  const mid = w / 2;
  const half = nw / 2 - i * 0.42;
  const bh = bw / 2 - i * 0.42;
  const d = [
    `M${l + c} ${t}`,
    `H${mid - half - g.ns}`,
    `L${mid - half} ${t + g.nd}`,
    `H${mid + half}`,
    `L${mid + half + g.ns} ${t}`,
    `H${rr - c}`,
    `L${rr} ${t + c}`,
    `V${b - r}`,
    `A${r} ${r} 0 0 1 ${rr - r} ${b}`,
  ];
  if (bw) d.push(`H${mid + bh + g.ns}`, `L${mid + bh} ${b - g.nd}`, `H${mid - bh}`, `L${mid - bh - g.ns} ${b}`);
  d.push(`H${l + c}`, `L${l} ${b - c}`, `V${t + c}`, "Z");
  return d.join(" ");
}

/** Short chrome ticks either side of each notch floor (the connector pins). */
function pins(w: number, h: number, g: Geo, nw: number, bw: number) {
  const mid = w / 2;
  const y = 0.5 + g.nd + 5;
  let d = `M${mid - nw / 2 + 8} ${y}h16M${mid + nw / 2 - 24} ${y}h16`;
  if (bw) {
    const yb = h - 0.5 - g.nd - 5;
    d += `M${mid - bw / 2 + 8} ${yb}h16M${mid + bw / 2 - 24} ${yb}h16`;
  }
  return d;
}

/** Ice segments riding the outer edge just past each chamfer. */
function accents(w: number, h: number, g: Geo) {
  const c = g.c;
  const s = Math.min(56, w * 0.06);
  return [
    `M${c + 6} 0.5h${s}`,
    `M${w - c - 6 - s} 0.5h${s}`,
    `M0.5 ${c + 6}v${s * 0.6}`,
    `M0.5 ${h - c - 6 - s * 0.6}v${s * 0.6}`,
    `M${w - 0.5} ${c + 6}v${s * 0.6}`,
  ].join("");
}
