import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../ui/cx";
import type { CellH } from "./Cell";

export interface RowProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** div (default), ul / ol for lists of cells (then render Cells as="li" / LinkCells listItem). */
  as?: "div" | "ul" | "ol";
  /** Minimum height of every line of cells in this row (token, like Cell h). */
  h?: CellH;
  /** Also draw a bottom hairline (only the last row before non-grid content needs it). */
  close?: boolean;
  children?: ReactNode;
}

/**
 * A full-bleed band of cells on the page's columns (12 from 768px, 4 below), inside the page margins.
 * Its top hairline runs edge to edge; the frame lines sit on the margins. Cells may span columns and,
 * inside the row, several lines (`rows`). Tile it completely (use <Fill /> or an empty <Cell />).
 */
export function Row({ as = "div", h, close, className, style, children, ...rest }: RowProps) {
  const Tag = as as "div";
  const s = h ? ({ "--row-h": `var(--g-row-${h})`, ...style } as CSSProperties) : style;
  return (
    <Tag className={cx("g-row", className)} style={s} data-close={close || undefined} {...rest}>
      {children}
    </Tag>
  );
}

/** The empty band between two sections: two edge-to-edge rules and the frame lines, --g-gutter tall. */
export function Gap() {
  return (
    <div className="g-row" aria-hidden="true">
      <div className="g-cell" data-pad="none" style={{ "--cell-h": "var(--g-gutter)" } as CSSProperties} />
    </div>
  );
}
