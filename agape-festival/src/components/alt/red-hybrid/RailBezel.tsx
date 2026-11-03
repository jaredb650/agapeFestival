"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useMeasure } from "./useMeasure";
import { decode, prefersReducedMotion } from "./fx";
import { cx } from "./cx";

export interface RailBezelProps {
  /** Caps in the top notch, e.g. "INDUSTRY CITY". */
  label: string;
  children?: ReactNode;
  /** Boot when it scrolls into view: the outer line draws on, the rest flickers, the label decodes. Default true. */
  boot?: boolean;
  as?: "div" | "section" | "article" | "figure";
  className?: string;
  /** Padding defaults to 40px 24px 24px; set --rb-pad to change it. The rails sit 6–14px outside the box. */
  style?: CSSProperties;
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
  return [`M${l + c} ${t}`, `H${mid - half - ns}`, `L${mid - half} ${t + nd}`, `H${mid + half}`, `L${mid + half + ns} ${t}`, `H${r - c}`, `L${r} ${t + c}`, `V${b - c}`, `L${r - c} ${b}`, `H${l + c}`, `L${l} ${b - c}`, `V${t + c}`, "Z"].join(" ");
}

/** Chrome ticks either side of the notch floor (the connector "pins"). */
function pins(w: number, { nw, nd }: G) {
  const mid = w / 2;
  const y = 0.5 + nd + 5;
  return `M${mid - nw / 2 + 10} ${y}h18M${mid + nw / 2 - 28} ${y}h18`;
}

/** Short tick ladders on both side rails, mid-height, plus bottom-centre index ticks. */
function rails(w: number, h: number, { c }: G) {
  const out: string[] = [];
  const y0 = h / 2 - 40;
  for (let k = 0; k < 9; k++) {
    const y = y0 + k * 10;
    const len = k % 4 === 0 ? 8 : 4;
    out.push(`M${-6} ${y}h${-len}`, `M${w + 6} ${y}h${len}`);
  }
  for (let k = -3; k <= 3; k++) out.push(`M${w / 2 + k * 14} ${h + 6}v${k === 0 ? 8 : 4}`);
  return out.join("") + `M${c + 30} ${h + 6}h40M${w - c - 70} ${h + 6}h40`;
}

/** Ice accent strokes along each chamfer. */
function corners(w: number, h: number, { c }: G) {
  const o = 0.5;
  return [`M${o} ${c + 22}V${c}L${c} ${o}H${c + 22}`, `M${w - c - 22} ${o}H${w - c}L${w - o} ${c}V${c + 22}`, `M${w - o} ${h - c - 22}V${h - c}L${w - c} ${h - o}H${w - c - 22}`, `M${c + 22} ${h - o}H${c}L${o} ${h - c}V${h - c - 22}`].join("");
}

/**
 * The Getting Here map panel's breeder-unit bezel (c9688b5 map/HudBezel.tsx): chamfered
 * corners, a centre notch housing the label, an outer line that draws on, an ice hairline
 * inside, chrome pins, tick ladders outside both side rails and under the bottom edge, ice
 * strokes along every chamfer. Drawn at the measured pixel size. A container.
 */
export function RailBezel({ label, children, boot = true, as = "div", className, style }: RailBezelProps) {
  const [ref, size] = useMeasure<HTMLDivElement>();
  const labelRef = useRef<HTMLSpanElement>(null);
  const g = size ? geom(size.w) : null;

  useEffect(() => {
    const el = ref.current;
    if (!el || !boot || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    el.setAttribute("data-armed", "");
    let t = 0;
    let cancelDecode = () => {};
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        el.setAttribute("data-boot", "");
        if (labelRef.current) cancelDecode = decode(labelRef.current, label, { delay: 120, ms: 520, pre: true });
        // One-shots detach once played (their end state is the base style).
        t = window.setTimeout(() => el.setAttribute("data-booted", ""), 1800);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(t);
      cancelDecode();
    };
  }, [ref, boot, label]);

  const Tag = as as "div";
  return (
    <Tag className={cx("rhk-rb-host", className)} style={style}>
      <div ref={ref} className="rhk-rb" aria-hidden="true" style={g ? ({ "--rb-nd": `${g.nd}px` } as CSSProperties) : undefined}>
        {size && g && size.w > 120 && (
          <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} focusable="false">
            <path className="rhk-rb__outer" d={bezel(size.w, size.h, 0, g)} pathLength={1} />
            <path className="rhk-rb__inner" d={bezel(size.w, size.h, 6, g)} />
            <path className="rhk-rb__pins" d={pins(size.w, g)} />
            <path className="rhk-rb__rails" d={rails(size.w, size.h, g)} />
            <path className="rhk-rb__corners" d={corners(size.w, size.h, g)} />
          </svg>
        )}
        <span ref={labelRef} className="rhk-rb__label" style={g ? { width: g.nw } : undefined}>
          {label}
        </span>
      </div>
      {children}
    </Tag>
  );
}
