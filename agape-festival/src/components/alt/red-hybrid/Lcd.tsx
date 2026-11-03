import type { CSSProperties, ReactNode } from "react";
import { cx } from "./cx";

export interface LcdProps {
  /** One row each. Wrap labels in <i> (dim) and values in <b> (lit). Rows after the first run slightly dimmer. */
  rows?: ReactNode[];
  /** Key :: value pairs on one line (the lockers readout). */
  pairs?: { k: ReactNode; v: ReactNode }[];
  /** A big glowing readout line under the rows (the ticket terminal's). */
  big?: ReactNode;
  /** plain (default) or chamfer (the HUD bar's readout: cut corners, label left / value right). */
  shape?: "plain" | "chamfer";
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** LCDs are decorative readouts by default; pass false when the text is real content. */
  decorative?: boolean;
}

/**
 * The recessed pixel LCD (c9688b5 wfq__lcd / wmx-lcd / tk-lcd / wlk-lcd / whud__lcd): a navy
 * well with an inset shadow and an ice hairline, glowing Chonky Pixels rows, scanlines.
 */
export function Lcd({ rows, pairs, big, shape = "plain", children, className, style, decorative = true }: LcdProps) {
  return (
    <div
      className={cx("rhk-lcd", className)}
      data-shape={shape === "chamfer" ? "chamfer" : undefined}
      data-layout={pairs ? "pairs" : undefined}
      style={style}
      aria-hidden={decorative || undefined}
    >
      {rows?.map((r, i) => (
        <span key={i} className="rhk-lcd__row">
          {r}
        </span>
      ))}
      {pairs?.map((p, i) => (
        <span key={i}>
          <span className="rhk-lcd__k">{p.k}</span> <span className="rhk-lcd__v">{p.v}</span>
        </span>
      ))}
      {big !== undefined && <span className="rhk-lcd__big">{big}</span>}
      {children}
    </div>
  );
}
