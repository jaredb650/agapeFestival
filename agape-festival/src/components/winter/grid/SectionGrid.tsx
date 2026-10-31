import type { ReactNode } from "react";
import { cx } from "../ui/cx";
import { Cell } from "./Cell";
import { Row } from "./Row";

export interface SectionGridProps {
  /** The section's id: the nav links to it (#id) and tracks it. */
  id: string;
  /** Id of the section's heading (aria-labelledby). */
  labelledBy?: string;
  /** "section" (default) or "footer". */
  as?: "section" | "footer";
  className?: string;
  /** Rows (Row, SectionHeader). Nothing else goes directly in a section. */
  children: ReactNode;
}

/** A page section: a full-bleed stack of Rows. page.tsx puts a <Gap /> between sections. */
export function SectionGrid({ id, labelledBy, as: Tag = "section", className, children }: SectionGridProps) {
  return (
    <Tag id={id} className={cx("g-section", className)} aria-labelledby={labelledBy}>
      {children}
    </Tag>
  );
}

export interface SectionHeaderProps {
  /** Id for the <h2>, referenced by SectionGrid's labelledBy. */
  id: string;
  /** The section's name, sentence case: "Lineup", "Getting here". */
  title: ReactNode;
  /** Optional right-hand cell: one or two sentences, or one Button. Omit it and the title spans the row. */
  aside?: ReactNode;
  /** Columns the title takes from 768px when there is an aside (the aside gets the rest). Default 8. */
  titleSpan?: number;
}

/**
 * The first row of every section: the name set large at the foot of a tall cell, and an optional aside
 * cell aligned to the same baseline area. No eyebrow, no index number, no label above the heading.
 */
export function SectionHeader({ id, title, aside, titleSpan = 8 }: SectionHeaderProps) {
  return (
    <Row>
      <Cell span={aside ? titleSpan : 12} h={3} className="g-head__title">
        <h2 id={id} className="w-display">
          {title}
        </h2>
      </Cell>
      {aside ? (
        <Cell span={12 - titleSpan} className="g-head__aside">
          {typeof aside === "string" ? <p>{aside}</p> : aside}
        </Cell>
      ) : null}
    </Row>
  );
}
