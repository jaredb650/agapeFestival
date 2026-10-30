import type { CSSProperties } from "react";
import { cx } from "./cx";

export interface ScrimProps {
  /** bottom/top = linear fade to ink; radial = dark pool behind centred text; vignette = dark edges. */
  variant?: "bottom" | "top" | "radial" | "vignette";
  /** Peak ink alpha, 0–1. Default 0.7. */
  strength?: number;
  className?: string;
  style?: CSSProperties;
}

/** Absolute, pointer-transparent darkening layer. Parent must be positioned. */
export function Scrim({ variant = "bottom", strength = 0.7, className, style }: ScrimProps) {
  return (
    <div
      aria-hidden="true"
      className={cx("w-scrim", className)}
      data-variant={variant}
      style={{ ["--w-scrim-a" as string]: String(strength), ...style }}
    />
  );
}
