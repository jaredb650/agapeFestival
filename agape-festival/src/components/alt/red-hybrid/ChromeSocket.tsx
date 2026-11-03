import type { ReactNode } from "react";
import { cx } from "./cx";

export interface ChromeSocketProps {
  /** The glyph in the well (24px, currentColor). */
  icon: ReactNode;
  /** Accessible name (the socket shows only the icon). */
  label: string;
  /** Tiny pixel index in the corner, e.g. "01". */
  index?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * The footer's comms slot (c9688b5 .wft__slot): a chamfered silver ring around a recessed
 * dark well with scanlines; the icon lifts and turns ice on hover. <a> with href, else <button>.
 */
export function ChromeSocket({ icon, label, index, href, external, onClick, className }: ChromeSocketProps) {
  const inner = (
    <>
      <span className="rhk-sock__icon" aria-hidden="true">
        {icon}
      </span>
      {index && (
        <span className="rhk-sock__n" aria-hidden="true">
          {index}
        </span>
      )}
    </>
  );
  if (href)
    return (
      <a href={href} className={cx("rhk-sock", className)} aria-label={label} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {inner}
      </a>
    );
  return (
    <button type="button" className={cx("rhk-sock", className)} aria-label={label} onClick={onClick}>
      {inner}
    </button>
  );
}
