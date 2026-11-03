"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { useMeasure } from "./useMeasure";
import { armEntrance } from "./fx";
import { cx } from "./cx";

export interface HudBezelProps {
  /** Caps in the top notch, e.g. "FREQUENTLY ASKED". The notch is sized to it. */
  label: string;
  /** Optional second notch on the bottom edge with its own caps. */
  bottomLabel?: string;
  children?: ReactNode;
  /** The panel glass in the bezel's own shape. Default true (rgba ink 82%; --bz-fill overrides). */
  fill?: boolean;
  /** Power-on flicker when it scrolls into view. Default true. */
  power?: boolean;
  as?: "div" | "section" | "article" | "aside" | "footer";
  className?: string;
  /** Padding defaults to 44px 28px 32px (clears the notch); set --bz-pad to change it. */
  style?: CSSProperties;
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
  const d = [`M${l + c} ${t}`, `H${mid - half - g.ns}`, `L${mid - half} ${t + g.nd}`, `H${mid + half}`, `L${mid + half + g.ns} ${t}`, `H${rr - c}`, `L${rr} ${t + c}`, `V${b - r}`, `A${r} ${r} 0 0 1 ${rr - r} ${b}`];
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
  return [`M${c + 6} 0.5h${s}`, `M${w - c - 6 - s} 0.5h${s}`, `M0.5 ${c + 6}v${s * 0.6}`, `M0.5 ${h - c - 6 - s * 0.6}v${s * 0.6}`, `M${w - 0.5} ${c + 6}v${s * 0.6}`].join("");
}

/**
 * The chrome bezel of the FAQ terminal and the footer panel (c9688b5 page/HudBezel.tsx):
 * chamfered corners, a centre notch on the top edge housing the label, a second ice hairline
 * 6px inside, ONE curved corner (bottom-right, the Floodgear content column), connector pins,
 * ice accent segments and an optional bottom notch. Drawn as SVG at the measured pixel size
 * so the chamfers never stretch. Renders as a container: put the panel content inside.
 */
export function HudBezel({ label, bottomLabel, children, fill = true, power = true, as = "div", className, style }: HudBezelProps) {
  const [ref, size] = useMeasure<HTMLDivElement>();
  useEffect(() => {
    const el = ref.current;
    if (!el || !power) return;
    return armEntrance(el);
  }, [ref, power]);

  const narrow = !!size && size.w < 600;
  const g = narrow ? GEO_SM : GEO;
  const nw = notchWidth(label, narrow);
  const bw = bottomLabel ? notchWidth(bottomLabel, narrow) : 0;
  const Tag = as as "div";

  return (
    <Tag className={cx("rhk-bz-host", className)} style={style}>
      <div ref={ref} className="rhk-bz" data-narrow={narrow || undefined} data-fill={fill ? undefined : "none"} aria-hidden="true">
        {size && size.w > 120 && (
          <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} focusable="false">
            <path className="rhk-bz__fill" d={bezel(size.w, size.h, 0, g, nw, bw)} />
            <path className="rhk-bz__outer" d={bezel(size.w, size.h, 0, g, nw, bw)} />
            <path className="rhk-bz__inner" d={bezel(size.w, size.h, 6, g, nw, bw)} />
            <path className="rhk-bz__pins" d={pins(size.w, size.h, g, nw, bw)} />
            <path className="rhk-bz__accent" d={accents(size.w, size.h, g)} />
          </svg>
        )}
        <span className="rhk-bz__label" style={{ width: nw }}>
          {label}
        </span>
        {bottomLabel && (
          <span className="rhk-bz__label rhk-bz__label--bottom" style={{ width: bw }}>
            {bottomLabel}
          </span>
        )}
      </div>
      {children}
    </Tag>
  );
}
