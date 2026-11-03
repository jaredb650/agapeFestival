import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

export interface HoloKeyProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Label caps, e.g. "Menu". */
  children: ReactNode;
  /** burger (MENU: three lines, the middle one ice) · close (an ice ×) · any node · none. */
  icon?: "burger" | "close" | ReactNode;
}

/**
 * The HUD bar's MENU / CLOSE key (c9688b5 .whud-btn): chamfered ice glass with fine scanlines
 * inside a 1px luminous chamfered ring (an even-odd clip-path).
 */
export function HoloKey({ children, icon = "burger", className, type, ...rest }: HoloKeyProps) {
  return (
    <button type={type ?? "button"} className={cx("rhk-hk", className)} {...rest}>
      <span className="rhk-hk__glass" aria-hidden="true" />
      {icon === "burger" ? (
        <span className="rhk-hk__burger" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      ) : icon === "close" ? (
        <svg className="rhk-hk__x" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ) : (
        icon
      )}
      <span>{children}</span>
    </button>
  );
}
