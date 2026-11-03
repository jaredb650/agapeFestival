import type { ReactNode } from "react";
import { cx } from "./cx";

export interface HudLabelProps {
  children: ReactNode;
  /** mist (default, secondary) · frost (emphasis) · fog (decorative) · ice (selected / live state). */
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

/** Orbitron / pixel micro-label: kickers, HUD readouts, badges (c9688b5 ui/HudLabel.tsx). */
export function HudLabel({ children, tone = "mist", font = "orbitron", size = "micro", index, rule, as = "span", className }: HudLabelProps) {
  const Tag = as as "span";
  return (
    <Tag
      className={cx("rhk-hud", className)}
      data-tone={tone === "mist" ? undefined : tone}
      data-font={font === "pixel" ? "pixel" : undefined}
      data-size={size === "nano" ? "nano" : undefined}
    >
      {index && <span className="rhk-hud__idx">{index}</span>}
      {rule && <span className="rhk-hud__rule" aria-hidden="true" />}
      <span>{children}</span>
    </Tag>
  );
}
