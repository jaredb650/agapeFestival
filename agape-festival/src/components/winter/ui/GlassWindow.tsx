import type { ReactNode } from "react";
import { cx } from "./cx";

export interface GlassWindowProps {
  /** Title-bar text (HUD style). */
  title: ReactNode;
  /** Right side of the title bar, e.g. "14/17". */
  meta?: ReactNode;
  /** Optional footer status strip. */
  status?: ReactNode;
  /** steel = quiet dark bevel (info panels). chrome = silver Y2K bar (the artist select). */
  skin?: "steel" | "chrome";
  /** Focused/selected window: ice→volt underline under the bar + lit LED. */
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

/** Skinned "app window" panel: bevelled title bar, frosted body, optional status strip. */
export function GlassWindow({
  title,
  meta,
  status,
  skin = "steel",
  active,
  flush,
  controls = true,
  children,
  as = "section",
  className,
  "aria-label": ariaLabel,
}: GlassWindowProps) {
  const Tag = as as "section";
  return (
    <Tag
      className={cx("w-window", className)}
      data-skin={skin}
      data-active={active || undefined}
      data-flush={flush || undefined}
      aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}
    >
      <div className="w-window__bar">
        <span className="w-window__led" aria-hidden="true" />
        <span className="w-window__title">{title}</span>
        {meta && <span className="w-window__meta">{meta}</span>}
        {controls && (
          <span className="w-window__controls" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        )}
      </div>
      <div className="w-window__body">{children}</div>
      {status && <div className="w-window__status">{status}</div>}
    </Tag>
  );
}
