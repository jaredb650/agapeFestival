"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The "breeder unit" bezel around the desktop stage: chamfered corners, a
 * centre notch connector on the top edge (it houses the section label), and
 * a second hairline 6px inside. Drawn as SVG at the measured pixel size so
 * the chamfers and notch never stretch. Decorative.
 */
export function StageFrame({ label }: { label: string }) {
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

  return (
    <div ref={ref} className="asel-frame" aria-hidden="true">
      {size && size.w > 200 && (
        <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} focusable="false">
          <path className="asel-frame__outer" d={bezel(size.w, size.h, 0)} />
          <path className="asel-frame__inner" d={bezel(size.w, size.h, 6)} />
          <path className="asel-frame__notch" d={notchCap(size.w, 0)} />
        </svg>
      )}
      <span className="asel-frame__label">{label}</span>
    </div>
  );
}

const C = 24; // corner chamfer
const NW = 300; // notch floor width
const ND = 24; // notch depth
const NS = 24; // notch slope run

/** Chamfered rectangle with the top-centre notch, inset by `i`. */
function bezel(w: number, h: number, i: number) {
  const c = C - i * 0.42;
  const l = i + 0.5;
  const t = i + 0.5;
  const r = w - i - 0.5;
  const b = h - i - 0.5;
  const mid = w / 2;
  const half = NW / 2 + (i ? -i * 0.42 : 0);
  return [
    `M${l + c} ${t}`,
    `H${mid - half - NS}`,
    `L${mid - half} ${t + ND}`,
    `H${mid + half}`,
    `L${mid + half + NS} ${t}`,
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

/** Short chrome ticks either side of the notch floor (the connector "pins"). */
function notchCap(w: number, i: number) {
  const mid = w / 2;
  const y = i + 0.5 + ND;
  return `M${mid - NW / 2 + 10} ${y + 5}h18M${mid + NW / 2 - 28} ${y + 5}h18`;
}
