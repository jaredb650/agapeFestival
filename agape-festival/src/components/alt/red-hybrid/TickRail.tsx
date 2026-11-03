import type { CSSProperties } from "react";
import { cx } from "./cx";

export interface TickRailProps {
  side: "l" | "r";
  className?: string;
  style?: CSSProperties;
}

/**
 * A gutter ruler (c9688b5 .whud-menu__rail): a 4px strip of 1px ticks every 8px with a hairline
 * spine. Absolutely positioned: give it a positioned parent (MechWindow places two itself).
 */
export function TickRail({ side, className, style }: TickRailProps) {
  return <span className={cx("rhk-rail", className)} data-side={side} style={style} aria-hidden="true" />;
}
