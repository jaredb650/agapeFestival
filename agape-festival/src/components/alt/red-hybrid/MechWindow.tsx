"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Orb } from "./Orb";
import { SectorPlate, type SectorPlateProps } from "./SectorPlate";
import { TickRail } from "./TickRail";
import { decode, prefersReducedMotion } from "./fx";
import { cx } from "./cx";

type Phase = "opening" | "open" | "closing" | "closed";

export interface MechWindowProps {
  /** Title-bar caps (silver bar). */
  title: ReactNode;
  /** Right of the title, e.g. "07 SEC". */
  meta?: ReactNode;
  /** Boot LCD rows under the bar (strings decode in while it unfolds). */
  lcd?: ReactNode[];
  /** Sector plates rendered as the body's list (they flip down one by one). */
  plates?: SectorPlateProps[];
  /** Any other body content, after the plates. */
  children?: ReactNode;
  /** Status strip content (chamfered bottom). */
  status?: ReactNode;
  /** A row of glass orbs at the start of the status strip; `lit` = index of the lit one. */
  statusOrbs?: { count: number; lit?: number };
  /** Tick rulers outside both sides. Default true. */
  rails?: boolean;
  /** Window controls in the title bar. Default true. */
  controls?: boolean;
  /** true (default): unfolds on mount. Set false to fold it away; true again to replay the unfold. */
  open?: boolean;
  as?: "section" | "div" | "nav" | "aside";
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

const ROW0 = 300;
const ROW_STEP = 55;

/**
 * The mech menu's window (c9688b5 nav/MenuDialog.tsx): a chamfered steel bezel with a
 * gradient ring, snapping corner brackets, a silver title bar, a boot LCD, sector plates and
 * an orb status strip. Unfolds on mount (plates flip down on hinges, labels decode, a scan
 * band sweeps), folds back when `open` turns false. The dialog / focus-trap / scroll-lock of
 * the original menu are not included: this is the window itself.
 */
export function MechWindow({ title, meta, lcd, plates, children, status, statusOrbs, rails = true, controls = true, open = true, as = "section", className, style, "aria-label": ariaLabel }: MechWindowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>(open ? "opening" : "closed");
  const [wasOpen, setWasOpen] = useState(open);
  // `open` flipped: start the unfold / fold (state adjusted during render, not in an effect).
  if (open !== wasOpen) {
    setWasOpen(open);
    setPhase(open ? "opening" : phase === "closed" ? "closed" : "closing");
  }
  // Settle once the choreography has played (end states equal the base styles).
  useEffect(() => {
    if (phase !== "opening" && phase !== "closing") return;
    const t = setTimeout(() => setPhase(phase === "opening" ? "open" : "closed"), prefersReducedMotion() ? 0 : phase === "opening" ? 1400 : 600);
    return () => clearTimeout(t);
  }, [phase]);

  // Boot: decode the LCD rows and the plates' labels as they land (direct textContent writes).
  useEffect(() => {
    const root = ref.current;
    if (phase !== "opening" || !root || prefersReducedMotion()) return;
    const cancels: (() => void)[] = [];
    root.querySelectorAll<HTMLElement>(".rhk-mw__lcd [data-decode]").forEach((el, i) => {
      cancels.push(decode(el, el.dataset.decode ?? "", { delay: 300 + i * 120, ms: 420 + i * 40, pre: true }));
    });
    root.querySelectorAll<HTMLElement>(".rhk-mw__item").forEach((item, i) => {
      const at = ROW0 + i * ROW_STEP;
      item.querySelectorAll<HTMLElement>("[data-decode]").forEach((el) => {
        const idx = !!el.closest(".rhk-plate__idx");
        cancels.push(decode(el, el.dataset.decode ?? "", { delay: at + (idx ? 140 : 90), ms: Number(el.dataset.ms || 360), pre: true }));
      });
    });
    return () => cancels.forEach((c) => c());
  }, [phase]);

  const Tag = as as "div";
  return (
    <Tag
      ref={ref}
      className={cx("rhk-mw", className)}
      data-phase={phase}
      style={style}
      aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}
    >
      <span className="rhk-mw__bezel" aria-hidden="true" />
      {[0, 1, 2, 3].map((k) => (
        <i key={k} className="rhk-mw__brk" style={{ "--k": k } as CSSProperties} aria-hidden="true" />
      ))}
      {rails && <TickRail side="l" />}
      {rails && <TickRail side="r" />}

      <div className="rhk-mw__title" aria-hidden="true">
        <span className="rhk-mw__led" />
        <span className="rhk-mw__title-text">{title}</span>
        {meta && <span className="rhk-mw__meta">{meta}</span>}
        {controls && (
          <span className="rhk-mw__ctrl">
            <i />
            <i />
            <i />
          </span>
        )}
      </div>

      {lcd && lcd.length > 0 && (
        <div className="rhk-mw__lcd" aria-hidden="true">
          {lcd.map((row, i) => (
            <span key={i} data-decode={typeof row === "string" ? row : undefined}>
              {row}
            </span>
          ))}
        </div>
      )}

      {(plates?.length || children) && (
        <div className="rhk-mw__body">
          {plates && plates.length > 0 && (
            <ol className="rhk-mw__list" style={{ "--n": plates.length } as CSSProperties}>
              {plates.map((p, i) => (
                <li key={`${p.index}-${p.label}`} className="rhk-mw__item" style={{ "--i": i } as CSSProperties}>
                  <SectorPlate {...p} />
                </li>
              ))}
            </ol>
          )}
          {children}
        </div>
      )}

      {(status || statusOrbs) && (
        <div className="rhk-mw__status">
          {statusOrbs && (
            <span className="rhk-mw__orbs" aria-hidden="true">
              {Array.from({ length: statusOrbs.count }, (_, k) => (
                <span key={k} style={{ "--k": k } as CSSProperties}>
                  <Orb size="sm" lit={k === statusOrbs.lit} />
                </span>
              ))}
            </span>
          )}
          {status}
        </div>
      )}

      <span className="rhk-mw__clip" aria-hidden="true">
        <span className="rhk-mw__scan" />
        <span className="rhk-mw__flash" />
      </span>
    </Tag>
  );
}
