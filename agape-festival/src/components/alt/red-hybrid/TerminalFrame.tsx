"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { useMeasure } from "./useMeasure";
import { armEntrance } from "./fx";
import { cx } from "./cx";

export interface TerminalFrameProps {
  /** Caps in the top notch (frost), e.g. "ACCESS TERMINAL". */
  label: string;
  /** Caps in the shallower bottom notch (fog). */
  foot?: string;
  children?: ReactNode;
  /** The cockpit glass behind it: scanlines, a cold core, a hairline grid fading out. Default true. */
  glass?: boolean;
  /** Flicker on when it scrolls into view. Default true. */
  power?: boolean;
  as?: "div" | "section" | "article";
  className?: string;
  /** Padding defaults to 40px 32px 34px; set --tf-pad to change it. */
  style?: CSSProperties;
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
  return compact ? { c: 14, nh: Math.min(118, w * 0.3), nd: 20, ns: 18, bh: Math.min(84, w * 0.22), bd: 14 } : { c: 24, nh: 170, nd: 24, ns: 24, bh: 120, bd: 16 };
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
    `M${l + c} ${t}`, `H${mid - nh - g.ns}`, `L${mid - nh} ${t + g.nd}`, `H${mid + nh}`, `L${mid + nh + g.ns} ${t}`,
    `H${r - c}`, `L${r} ${t + c}`, `V${b - c}`, `L${r - c} ${b}`,
    `H${mid + bh + g.bd}`, `L${mid + bh} ${b - g.bd}`, `H${mid - bh}`, `L${mid - bh - g.bd} ${b}`,
    `H${l + c}`, `L${l} ${b - c}`, `V${t + c}`, "Z",
  ].join(" ");
}

/** Short chrome pins either side of each notch floor (the connector). */
function pins(w: number, h: number, g: Geo) {
  const mid = w / 2;
  const y = g.nd + 5.5;
  const yb = h - g.bd - 5.5;
  return [`M${mid - g.nh + 10} ${y}h18M${mid + g.nh - 28} ${y}h18`, `M${mid - g.bh + 8} ${yb}h12M${mid + g.bh - 20} ${yb}h12`].join("");
}

/** Tick rulers inside the left and right edges: a short tick every 12px, a long one every 5th. */
function ticks(w: number, h: number, g: Geo) {
  const top = g.c + 36;
  const bottom = h - g.c - 36;
  if (bottom - top < 60) return "";
  const out: string[] = [];
  for (let y = top, n = 0; y <= bottom; y += 12, n++) {
    const len = n % 5 === 0 ? 9 : 4;
    const yy = Math.round(y) + 0.5;
    out.push(`M12 ${yy}h${len}M${w - 12} ${yy}h${-len}`);
  }
  return out.join("");
}

/**
 * The tickets' access-terminal bezel (c9688b5 tickets/TerminalFrame.tsx + the .tk-scrim glass):
 * chamfered corners, a notch connector on the top edge housing the label, a shallower one on
 * the bottom edge housing the foot, an ice hairline inside, connector pins and tick rulers
 * down both sides. Drawn at the measured pixel size. A container.
 */
export function TerminalFrame({ label, foot, children, glass = true, power = true, as = "div", className, style }: TerminalFrameProps) {
  const [ref, size] = useMeasure<HTMLDivElement>();
  const g = size ? geometry(size.w) : null;
  useEffect(() => {
    const el = ref.current;
    if (!el || !power) return;
    return armEntrance(el);
  }, [ref, power]);
  const Tag = as as "div";
  return (
    <Tag className={cx("rhk-tf", className)} style={style}>
      {glass && <div className="rhk-tf__glass" aria-hidden="true" />}
      <div ref={ref} className="rhk-tf__frame" data-compact={size && size.w < 720 ? "" : undefined} aria-hidden="true">
        {size && g && size.w > 160 && (
          <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} focusable="false">
            <path className="rhk-tf__outer" d={bezel(size.w, size.h, 0, g)} />
            <path className="rhk-tf__inner" d={bezel(size.w, size.h, 6, g)} />
            <path className="rhk-tf__pins" d={pins(size.w, size.h, g)} />
            <path className="rhk-tf__ticks" d={ticks(size.w, size.h, g)} />
          </svg>
        )}
        <span className="rhk-tf__label" style={g ? { height: g.nd } : undefined}>
          {label}
        </span>
        {foot && (
          <span className="rhk-tf__foot" style={g ? { height: g.bd } : undefined}>
            {foot}
          </span>
        )}
      </div>
      {children}
    </Tag>
  );
}
