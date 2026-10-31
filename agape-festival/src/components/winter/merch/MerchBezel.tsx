"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The armory bezel: the artist select's breeder-unit frame (chamfered corners,
 * a centre notch connector housing the label, a hairline 6px inside) plus
 * side "ports" where the slot wires dock. Drawn as SVG at the measured pixel
 * size so chamfers and notch never stretch; scales down for phones. Decorative.
 */
export function MerchBezel({ label }: { label: string }) {
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

  const d = size ? dims(size.w) : null;

  return (
    <div ref={ref} className="wmx-frame" aria-hidden="true">
      {size && d && size.w > 200 && (
        <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} focusable="false">
          <path className="wmx-frame__outer" d={bezel(size.w, size.h, 0, d)} />
          <path className="wmx-frame__inner" d={bezel(size.w, size.h, 6, d)} />
          <path className="wmx-frame__notch" d={notchCap(size.w, d)} />
          <path className="wmx-frame__port" d={ports(size.w, size.h)} />
        </svg>
      )}
      <span className="wmx-frame__label">{label}</span>
    </div>
  );
}

interface Dims {
  c: number; // corner chamfer
  nw: number; // notch floor width
  nd: number; // notch depth
}

const dims = (w: number): Dims => (w < 640 ? { c: 14, nw: Math.min(176, w * 0.46), nd: 18 } : { c: 24, nw: 300, nd: 24 });

/** Chamfered rectangle with the top-centre notch, inset by `i`. */
function bezel(w: number, h: number, i: number, { c: C, nw, nd }: Dims) {
  const c = C - i * 0.42;
  const l = i + 0.5;
  const t = i + 0.5;
  const r = w - i - 0.5;
  const b = h - i - 0.5;
  const mid = w / 2;
  const half = nw / 2 + (i ? -i * 0.42 : 0);
  return [
    `M${l + c} ${t}`,
    `H${mid - half - nd}`,
    `L${mid - half} ${t + nd}`,
    `H${mid + half}`,
    `L${mid + half + nd} ${t}`,
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
function notchCap(w: number, { nw, nd }: Dims) {
  const mid = w / 2;
  const y = 0.5 + nd + 5;
  const pin = nw > 200 ? 18 : 10;
  return `M${mid - nw / 2 + 10} ${y}h${pin}M${mid + nw / 2 - 10 - pin} ${y}h${pin}`;
}

/** Three-tick docking ports on both side edges, centred vertically. */
function ports(w: number, h: number) {
  const y = h / 2;
  return [-10, 0, 10].map((o) => `M2 ${y + o}h6M${w - 8} ${y + o}h6`).join("");
}
