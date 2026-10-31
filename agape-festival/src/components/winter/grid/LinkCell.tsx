import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cx } from "../ui/cx";
import { cellData, cellStyle, splitLayout, type CellLayout } from "./Cell";
import { ArrowRight, ArrowUpRight } from "./icons";

export interface LinkCellProps extends CellLayout, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  href: string;
  /** Opens in a new tab with rel=noopener; also picks the ↗ icon. */
  external?: boolean;
  /** Small muted line above the value (what it is: "Instagram", "Bookings and press"). Optional. */
  label?: ReactNode;
  /** The link text. */
  children: ReactNode;
  /** "body" (default, 16px) or "title" (24→32px) for the value. */
  size?: "body" | "title";
  /** "primary" = flat red fill (the ticket cell). Default: transparent cell with a hover wash. */
  variant?: "primary";
  /** "wipe" = a red fill wipes across the cell on hover/focus (clip-path). */
  fx?: "wipe";
  /** Arrow in the top-right corner. Default: ↗ for external links, none otherwise. */
  icon?: "arrow" | "external" | "none";
  /** Render as <li class="g-cell"><a>…</a></li>, for a Row rendered as a <ul>/<ol>. */
  listItem?: boolean;
}

/**
 * A whole cell that is one link: optional label on top, the value below, an optional corner arrow.
 * Hover = a surface step (never movement); focus = an inset 2px ring.
 */
export function LinkCell(props: LinkCellProps) {
  const [layout, rest] = splitLayout(props);
  const { href, external, label, children, size = "body", variant, fx, icon, listItem, className, style, ...anchor } = rest;
  const glyph = icon ?? (external ? "external" : "none");
  const link = (
    <a
      href={href}
      className={cx(listItem ? "g-link" : "g-cell g-link", !listItem && className)}
      style={listItem ? undefined : cellStyle(layout, style)}
      {...(listItem ? {} : cellData(layout))}
      data-variant={variant}
      data-fx={fx}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...anchor}
    >
      {label ? <span className="g-link__label">{label}</span> : null}
      <span className={size === "title" ? "g-link__value g-link__value--title" : "g-link__value"}>{children}</span>
      {glyph === "external" && <ArrowUpRight className="g-link__icon" />}
      {glyph === "arrow" && <ArrowRight className="g-link__icon" />}
    </a>
  );
  if (!listItem) return link;
  return (
    <li className={cx("g-cell g-cell--li", className)} style={cellStyle(layout, style)} {...cellData(layout)}>
      {link}
    </li>
  );
}
