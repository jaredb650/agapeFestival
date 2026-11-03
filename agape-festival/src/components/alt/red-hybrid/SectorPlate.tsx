import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { cx } from "./cx";

export interface SectorPlateProps {
  /** Index in the silver hex chip, e.g. "03". */
  index: string;
  /** Display label (Orbitron 800 caps). */
  label: string;
  /** Pixel state readout on the right, e.g. "SEC.03". On the current plate it becomes a lit volt tag. */
  state?: ReactNode;
  /** The current plate: ice ring, blue-lit glass, volt state tag. */
  current?: boolean;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  style?: CSSProperties;
}

/**
 * The mech menu's sector plate (c9688b5 .whud-menu__link): a chamfered steel plate with
 * scanlines and a 1px chamfered ring, a silver hex index chip, a display label and a state
 * readout. Inside MechWindow the label and index decode in as the plates flip down.
 */
export function SectorPlate({ index, label, state, current, href, onClick, className, style }: SectorPlateProps) {
  const inner = (
    <>
      <span className="rhk-plate__ring" aria-hidden="true" />
      <span className="rhk-plate__idx" aria-hidden="true">
        <span data-decode={index} data-ms="240">
          {index}
        </span>
      </span>
      <span className="rhk-plate__label" data-decode={label} data-ms="380">
        {label}
      </span>
      {state !== undefined && (
        <span className="rhk-plate__state" aria-hidden="true">
          {state}
        </span>
      )}
    </>
  );
  const cls = cx("rhk-plate", className);
  if (href)
    return (
      <a href={href} className={cls} style={style} aria-current={current ? "location" : undefined} onClick={onClick}>
        {inner}
      </a>
    );
  return (
    <button type="button" className={cls} style={style} data-current={current || undefined} aria-pressed={current || undefined} onClick={onClick}>
      {inner}
    </button>
  );
}
