import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../ui/cx";

/** Horizontal placement of a cell's content. */
export type CellX = "start" | "center" | "end" | "stretch";
/** Vertical placement of a cell's content (the cell is a flex column). */
export type CellY = "start" | "center" | "end" | "between";
/** Min-height token: --g-row-1 … --g-row-5 (56 / 96 / 160 / 192→240 / 240→320 px). */
export type CellH = 1 | 2 | 3 | 4 | 5;

export interface CellLayout {
  /** Columns spanned from 768px up, of 12. Default 12. */
  span?: number;
  /** Columns spanned below 768px, of 4. Default 4 (cells stack on phones). */
  spanSm?: number;
  /** Start column (1–12) from 768px. Usually leave it to auto-placement. */
  start?: number;
  /** Start column (1–4) below 768px. */
  startSm?: number;
  /** Rows spanned from 768px (inside one Row). Default 1. */
  rows?: number;
  /** Rows spanned below 768px. Default 1. */
  rowsSm?: number;
  /** Minimum height token. */
  h?: CellH;
  /** Show the cell only below 768px ("sm") or only from 768px ("md"). For fillers. */
  only?: "sm" | "md";
  x?: CellX;
  y?: CellY;
  /** "none" for media that runs to the hairlines; "lg" doubles the padding. */
  pad?: "none" | "lg";
  /** "shade": a dark fill for long text over a bright moment of the footage. */
  tone?: "shade";
}

const X: Record<CellX, string> = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch" };
const Y: Record<CellY, string> = { start: "flex-start", center: "center", end: "flex-end", between: "space-between" };

/** The CSS custom properties grid.css reads for a cell's placement. */
export function cellStyle(l: CellLayout, style?: CSSProperties): CSSProperties {
  const s: Record<string, string | number> = {};
  if (l.span !== undefined) s["--span"] = l.span;
  if (l.spanSm !== undefined) s["--span-sm"] = l.spanSm;
  if (l.start !== undefined) s["--start"] = l.start;
  if (l.startSm !== undefined) s["--start-sm"] = l.startSm;
  if (l.rows !== undefined) s["--rows"] = l.rows;
  if (l.rowsSm !== undefined) s["--rows-sm"] = l.rowsSm;
  if (l.h !== undefined) s["--cell-h"] = `var(--g-row-${l.h})`;
  if (l.x) {
    s["--cell-x"] = X[l.x];
    s["--cell-text"] = l.x === "center" ? "center" : l.x === "end" ? "end" : "start";
  }
  if (l.y) s["--cell-y"] = Y[l.y];
  return { ...(s as CSSProperties), ...style };
}

/** The data attributes grid.css reads for a cell's look. */
export function cellData(l: CellLayout) {
  return { "data-pad": l.pad, "data-tone": l.tone, "data-only": l.only };
}

/** Split layout props from everything else. */
export function splitLayout<T extends CellLayout>(p: T) {
  const { span, spanSm, start, startSm, rows, rowsSm, h, only, x, y, pad, tone, ...rest } = p;
  return [{ span, spanSm, start, startSm, rows, rowsSm, h, only, x, y, pad, tone } as CellLayout, rest] as const;
}

/** Elements a cell can render as. */
export type CellTag = "div" | "li" | "article" | "header" | "figure" | "aside" | "dl" | "blockquote";

export interface CellProps extends CellLayout, Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Element to render: div (default), li (inside a list Row), article, header, figure… */
  as?: CellTag;
  children?: ReactNode;
}

/**
 * One rectangle of the grid. It draws its own top and left hairline; content sits inside `--g-pad`.
 * An empty <Cell /> is a legitimate filler: every Row must be fully tiled.
 */
export function Cell(props: CellProps) {
  const [layout, { as = "div", className, style, children, ...rest }] = splitLayout(props);
  const Tag = as as "div";
  return (
    <Tag className={cx("g-cell", className)} style={cellStyle(layout, style)} {...cellData(layout)} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Tiles the end of a Row: `md` = columns left empty from 768px (of 12), `sm` = below 768px (of 4).
 * Renders nothing, or one empty cell shown only where it is needed. `as="li"` inside a list Row.
 */
export function Fill({ md = 0, sm = 0, as }: { md?: number; sm?: number; as?: CellTag }) {
  if (md > 0 && sm > 0) return <Cell as={as} span={md} spanSm={sm} aria-hidden="true" />;
  if (md > 0) return <Cell as={as} span={md} only="md" aria-hidden="true" />;
  if (sm > 0) return <Cell as={as} spanSm={sm} only="sm" aria-hidden="true" />;
  return null;
}
