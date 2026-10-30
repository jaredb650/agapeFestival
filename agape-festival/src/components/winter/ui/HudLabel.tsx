import type { ReactNode } from "react";
import { cx } from "./cx";

export interface HudLabelProps {
  children: ReactNode;
  /** mist (default, secondary) · frost (emphasis) · fog (decorative, large/ink bg only) · ice (selected/live state only). */
  tone?: "mist" | "frost" | "fog" | "ice";
  /** orbitron (default) or the Chonky Pixels face. */
  font?: "orbitron" | "pixel";
  /** nano = 9px, decorative chrome only. */
  size?: "micro" | "nano";
  /** Leading index, e.g. "01". */
  index?: string;
  /** Short rule between index and text. */
  rule?: boolean;
  as?: "span" | "p" | "div" | "dt" | "li";
  className?: string;
}

/** Orbitron / pixel micro-label: section kickers, HUD readouts, badges. */
export function HudLabel({ children, tone = "mist", font = "orbitron", size = "micro", index, rule, as = "span", className }: HudLabelProps) {
  const Tag = as as "span";
  return (
    <Tag
      className={cx("w-hud", className)}
      data-tone={tone === "mist" ? undefined : tone}
      data-font={font === "pixel" ? "pixel" : undefined}
      data-size={size === "nano" ? "nano" : undefined}
    >
      {index && <span className="w-hud__idx">{index}</span>}
      {rule && <span className="w-hud__rule" aria-hidden="true" />}
      <span>{children}</span>
    </Tag>
  );
}
