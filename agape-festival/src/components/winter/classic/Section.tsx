import type { ReactNode } from "react";
import { cx } from "../ui/cx";

export interface SectionProps {
  /** The section's id: the nav links to it (#id) and tracks it (`main > section[id]`). */
  id: string;
  /** The title, as the nav names it ("Lineup", "The roster"). Set in Orbitron caps by CSS. */
  title: ReactNode;
  /** Optional caps label above the title ("ÄGAPE FESTIVAL / 2026"). Orbitron: strip marks it can't draw. */
  eyebrow?: ReactNode;
  /** Optional lead under the title: one or two short sentences. */
  intro?: ReactNode;
  /** Heading alignment. Long sections start-align; short ones (one block of content) may centre. */
  align?: "start" | "center";
  /** Revealed with the scroll entrance (default true). */
  reveal?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * A classic section: a hairline across the top, side padding, a centred content column (max 1280px)
 * and the heading block (optional eyebrow, title, a 48px rule, the optional lead). Server component, no client JS.
 * Styles: styles/classic.css (.k-sec, .k-wrap, .k-head).
 */
export function Section({ id, title, eyebrow, intro, align = "start", reveal = true, className, children }: SectionProps) {
  const titleId = `${id}-title`;
  return (
    <section id={id} className={cx("k-sec", className)} aria-labelledby={titleId}>
      <div className="k-wrap">
        <header className="k-head" data-align={align === "center" ? "center" : undefined} data-reveal={reveal ? "" : undefined}>
          {eyebrow ? <p className="k-label k-head__eyebrow">{eyebrow}</p> : null}
          <h2 id={titleId} className="k-h1">
            {title}
          </h2>
          <div className="k-head__rule" aria-hidden="true" />
          {intro ? typeof intro === "string" ? <p className="k-lead">{intro}</p> : intro : null}
        </header>
        {children}
      </div>
    </section>
  );
}

export interface StageHeadingProps {
  /** Caps label above the heading ("Day 1"). */
  label: ReactNode;
  /** The heading ("Friday, February 19"). */
  children: ReactNode;
  /** Heading level (default h3). */
  as?: "h3" | "h4";
  id?: string;
  /** Red label (a day, the one key fact). */
  red?: boolean;
}

/** A sub-group heading centred between two fading hairlines (the September site's stage headers). */
export function StageHeading({ label, children, as: Tag = "h3", id, red }: StageHeadingProps) {
  return (
    <div className="k-stage">
      <span className="k-stage__line" aria-hidden="true" />
      <div className="k-stage__text">
        <p className={cx("k-label", red && "k-label--red")}>{label}</p>
        <Tag id={id} className="k-h2">
          {children}
        </Tag>
      </div>
      <span className="k-stage__line" aria-hidden="true" />
    </div>
  );
}
