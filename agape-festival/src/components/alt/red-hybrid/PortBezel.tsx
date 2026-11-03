"use client";

import type { CSSProperties, ReactNode } from "react";
import { useMeasure } from "./useMeasure";
import { cx } from "./cx";

export interface PortBezelProps {
  /** Caps in the top notch, e.g. "ARMORY". */
  label: string;
  children?: ReactNode;
  /** Three-tick docking ports on both side edges. Default true (false = the roster's StageFrame). */
  ports?: boolean;
  /** The tinted glass plate (scanlines + steel core) clipped to the bezel. Default true. */
  glass?: boolean;
  as?: "div" | "section" | "article";
  className?: string;
  /** Padding defaults to 30px 12px 14px; set --pb-pad to change it. */
  style?: CSSProperties;
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
  return [`M${l + c} ${t}`, `H${mid - half - nd}`, `L${mid - half} ${t + nd}`, `H${mid + half}`, `L${mid + half + nd} ${t}`, `H${r - c}`, `L${r} ${t + c}`, `V${b - c}`, `L${r - c} ${b}`, `H${l + c}`, `L${l} ${b - c}`, `V${t + c}`, "Z"].join(" ");
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

/**
 * The merch armory's bezel (c9688b5 merch/MerchBezel.tsx, itself the roster's StageFrame):
 * chamfered corners, a centre notch connector housing the label, a hairline 6px inside,
 * connector pins, docking ports on both sides, and the tinted glass plate clipped to the same
 * shape. Drawn at the measured pixel size; scales down under 640px. A container.
 */
export function PortBezel({ label, children, ports: showPorts = true, glass = true, as = "div", className, style }: PortBezelProps) {
  const [ref, size] = useMeasure<HTMLDivElement>();
  const d = size ? dims(size.w) : null;
  const geo = d ? ({ "--c": `${d.c}px`, "--nh": `${d.nw / 2}px`, "--nd": `${d.nd}px` } as CSSProperties) : undefined;
  const Tag = as as "div";
  return (
    <Tag className={cx("rhk-pb", className)} data-glass={glass ? undefined : "none"} style={{ ...geo, ...style }}>
      <div ref={ref} className="rhk-pb__frame" aria-hidden="true">
        {size && d && size.w > 200 && (
          <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} focusable="false">
            <path className="rhk-pb__outer" d={bezel(size.w, size.h, 0, d)} />
            <path className="rhk-pb__inner" d={bezel(size.w, size.h, 6, d)} />
            <path className="rhk-pb__notch" d={notchCap(size.w, d)} />
            {showPorts && <path className="rhk-pb__port" d={ports(size.w, size.h)} />}
          </svg>
        )}
        <span className="rhk-pb__label">{label}</span>
      </div>
      {children}
    </Tag>
  );
}
