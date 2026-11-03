import type { ReactNode } from "react";
import { cx } from "./cx";

export interface GlassWindowProps {
  /** Title-bar text (HUD style). */
  title: ReactNode;
  /** Right side of the title bar, e.g. "14/17". */
  meta?: ReactNode;
  /** Optional footer status strip. */
  status?: ReactNode;
  /** steel = the dark bevelled bar (info panels). chrome = the silver Y2K bar (roster, tickets, map). */
  skin?: "steel" | "chrome";
  /** Focused / selected window: ice→volt underline under the bar + lit LED. */
  active?: boolean;
  /** Body without padding (media, grids that bleed to the edge). */
  flush?: boolean;
  /** Decorative window buttons. Default true. */
  controls?: boolean;
  children?: ReactNode;
  as?: "section" | "div" | "article" | "aside";
  className?: string;
  /** Accessible name when `title` isn't plain text. */
  "aria-label"?: string;
}

/**
 * Skinned "app window" panel (c9688b5 ui/GlassWindow.tsx): a frosted steel body with a
 * chrome sheen, a bevelled title bar (LED, title, meta, window controls), an optional
 * status strip. The chrome skin is the silver bevel bar from the Y2K references.
 */
export function GlassWindow({ title, meta, status, skin = "steel", active, flush, controls = true, children, as = "section", className, "aria-label": ariaLabel }: GlassWindowProps) {
  const Tag = as as "section";
  return (
    <Tag
      className={cx("rhk-win", className)}
      data-skin={skin}
      data-active={active || undefined}
      data-flush={flush || undefined}
      aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}
    >
      <div className="rhk-win__bar">
        <span className="rhk-win__led" aria-hidden="true" />
        <span className="rhk-win__title">{title}</span>
        {meta && <span className="rhk-win__meta">{meta}</span>}
        {controls && (
          <span className="rhk-win__controls" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        )}
      </div>
      <div className="rhk-win__body">{children}</div>
      {status && <div className="rhk-win__status">{status}</div>}
    </Tag>
  );
}
