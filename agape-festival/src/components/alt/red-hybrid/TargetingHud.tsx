"use client";

import { isValidElement, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { parkOffscreen } from "./fx";
import { cx } from "./cx";

/** A readout row: plain content, or content with a tone (ice = lit, fog = dim). */
export type HudRow = ReactNode | { content: ReactNode; tone?: "ice" | "fog" };

export interface TargetingHudProps {
  /** The lockup the HUD frames (logo, title, CTA). Centred above the HUD. */
  children?: ReactNode;
  /** Pixel LCD rows that type in at three corners. Wrap separators in <i> (dim ice). */
  data?: { tl?: HudRow[]; tr?: HudRow[]; bl?: HudRow[] };
  /** Readouts riding the reticle, upper right (ne) and lower left (sw). */
  tags?: { ne?: HudRow; sw?: HudRow };
  /** Pitch-ruler labels down both edges (9: the middle one is lit). */
  ruler?: string[];
  /** Heading-tape labels along the bottom. */
  tape?: string[];
  /** The tape label set in bold frost. Default "N". */
  north?: string;
  /** The scroll cue under the tape. Default "Scroll"; "" hides it. */
  cue?: string;
  /** Vertical caps strip on the left edge. */
  vtext?: string;
  as?: "div" | "section" | "header" | "figure";
  className?: string;
  /** min-height defaults to 640px (--th-h); the HUD fills the box. */
  style?: CSSProperties;
}

const RULER = ["+40", "+30", "+20", "+10", "00", "-10", "-20", "-30", "-40"];
const TAPE = ["33", "34", "35", "N", "01", "02", "03"];

/** SVG arc path, angles in degrees clockwise from 12 o'clock. */
function arc(r: number, a0: number, a1: number) {
  const p = (a: number) => {
    const t = ((a - 90) * Math.PI) / 180;
    return `${(200 + r * Math.cos(t)).toFixed(2)} ${(200 + r * Math.sin(t)).toFixed(2)}`;
  };
  return `M${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}`;
}

const isToned = (r: HudRow): r is { content: ReactNode; tone?: "ice" | "fog" } =>
  typeof r === "object" && r !== null && !isValidElement(r) && !Array.isArray(r) && "content" in r;

/** A HUD readout row that types in (stepped clip). */
function Row({ i, row }: { i: number; row: HudRow }) {
  const toned = isToned(row);
  return (
    <span className="rhk-th-type" data-tone={toned ? row.tone : undefined} style={{ "--i": i } as CSSProperties}>
      {toned ? row.content : row}
    </span>
  );
}

/** The blinking REC dot for a readout row. */
export function HudRec() {
  return <span className="rhk-th__rec" />;
}

/**
 * The hero's targeting HUD (c9688b5 page/Hero.tsx HeroHud + hero.css): viewfinder corners
 * with ice knee ticks, registration crosses, a reticle ringing the centre (two slow
 * counter-rotating layers), axis lines, pitch rulers, a heading tape with the scroll cue, LCD
 * rows that type in, a vertical strip, a scan band every 8s and intro glitch slices. It
 * assembles from first paint (CSS only) and parks its loops off screen. Sized by its host box
 * (container units), so it works for any panel, not only a full-viewport hero.
 */
export function TargetingHud({ children, data, tags, ruler = RULER, tape = TAPE, north = "N", cue = "Scroll", vtext, as = "div", className, style }: TargetingHudProps) {
  const hudRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = hudRef.current;
    return el ? parkOffscreen(el) : undefined;
  }, []);
  const Tag = as as "div";
  const block = (pos: "tl" | "tr" | "bl", rows: HudRow[] | undefined, i0: number) =>
    rows && rows.length > 0 ? (
      <div className="rhk-th__data" data-pos={pos}>
        {rows.map((r, i) => (
          <Row key={i} i={i0 + i} row={r} />
        ))}
      </div>
    ) : null;

  return (
    <Tag className={cx("rhk-th-host", className)} style={style}>
      <div ref={hudRef} className="rhk-th" aria-hidden="true">
        <div className="rhk-th__in">
          <span className="rhk-th__scan" />
          <span className="rhk-th__frame">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="rhk-th__reg" data-pos="tl" />
          <span className="rhk-th__reg" data-pos="tr" />
          <span className="rhk-th__reg" data-pos="bl" />
          <span className="rhk-th__reg" data-pos="br" />

          <div className="rhk-thr">
            <div className="rhk-thr__in">
              <svg className="rhk-thr__base" viewBox="0 0 400 400" focusable="false">
                <circle cx="200" cy="200" r="197" className="rhk-thr__ring" />
                <circle cx="200" cy="200" r="150" className="rhk-thr__ring rhk-thr__ring--in" />
                <path d="M200 -14v26M200 388v26M-14 200h26M388 200h26" className="rhk-thr__cross" />
                <path d="M200 44v10M200 346v10M44 200h10M346 200h10" className="rhk-thr__cross rhk-thr__cross--in" />
                <path d="M195 18h10l-5 8z" className="rhk-thr__pip" />
              </svg>
              <div className="rhk-thr__spin rhk-thr__spin--ticks">
                <svg viewBox="0 0 400 400" focusable="false">
                  <circle cx="200" cy="200" r="182" className="rhk-thr__ticks" />
                  <circle cx="200" cy="200" r="182" className="rhk-thr__ticks rhk-thr__ticks--major" />
                </svg>
              </div>
              <div className="rhk-thr__spin rhk-thr__spin--arcs">
                <svg viewBox="0 0 400 400" focusable="false">
                  <path d={arc(166, 24, 66)} className="rhk-thr__arc" />
                  <path d={arc(166, 114, 156)} className="rhk-thr__arc" />
                  <path d={arc(166, 204, 246)} className="rhk-thr__arc" />
                  <path d={arc(166, 294, 336)} className="rhk-thr__arc" />
                  <path d={arc(166, 80, 100)} className="rhk-thr__arc rhk-thr__arc--hot" />
                  <path d={arc(166, 260, 280)} className="rhk-thr__arc rhk-thr__arc--hot" />
                </svg>
              </div>
              {tags?.ne !== undefined && (
                <span className="rhk-thr__tag" data-pos="ne">
                  <Row i={3} row={tags.ne} />
                </span>
              )}
              {tags?.sw !== undefined && (
                <span className="rhk-thr__tag" data-pos="sw">
                  <Row i={4} row={tags.sw} />
                </span>
              )}
            </div>
          </div>

          <span className="rhk-th__axis" data-side="l" />
          <span className="rhk-th__axis" data-side="r" />

          {(["l", "r"] as const).map((side) => (
            <div key={side} className="rhk-th__ruler" data-side={side}>
              <span className="rhk-th__ticks" />
              <span className="rhk-th__nums">
                {ruler.map((n, i) => (
                  <b key={i}>{n}</b>
                ))}
              </span>
              <span className="rhk-th__pin">{side === "l" ? "◂︎" : "▸︎"}</span>
            </div>
          ))}

          <div className="rhk-th__tape">
            <span className="rhk-th__tape-ticks" />
            <span className="rhk-th__tape-nums">
              {tape.map((n, i) => (
                <b key={i} data-n={n === north || undefined}>
                  {n}
                </b>
              ))}
            </span>
            <span className="rhk-th__tape-pin">▲︎</span>
            {cue && <span className="rhk-th__scroll">{cue}</span>}
          </div>

          {block("tl", data?.tl, 0)}
          {block("tr", data?.tr, 1)}
          {block("bl", data?.bl, 4)}
          {vtext && <span className="rhk-th__vtext">{vtext}</span>}

          <span className="rhk-th__slice" data-n="1" />
          <span className="rhk-th__slice" data-n="2" />
          <span className="rhk-th__slice" data-n="3" />
        </div>
      </div>
      {children}
    </Tag>
  );
}
