import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

export interface HudChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode;
  /** LED lit (ice). */
  on?: boolean;
  /** Pixel feed readout before the label, e.g. "CAM 01". */
  feed?: ReactNode;
  /** A small 8px glyph before the label. */
  icon?: ReactNode;
}

/** The hero's video chip (c9688b5 .wh-chip): dark pane, dim hairline, two ice corner ticks, an LED, tracked caps. */
export function HudChip({ children, on, feed, icon, className, type, ...rest }: HudChipProps) {
  return (
    <button type={type ?? "button"} className={cx("rhk-hchip", className)} data-on={on || undefined} {...rest}>
      <span className="rhk-hchip__led" aria-hidden="true" />
      {feed && <span className="rhk-hchip__feed">{feed}</span>}
      {icon}
      <span className="rhk-hchip__label">{children}</span>
    </button>
  );
}
