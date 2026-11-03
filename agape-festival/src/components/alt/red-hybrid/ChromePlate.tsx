import type { ReactNode } from "react";
import { cx } from "./cx";

export interface ChromePlateProps {
  children: ReactNode;
  /**
   * slant = the merch kicker chip (parallelogram) · chevron = the lineup spine node / menu
   * index chip (hex arrow) · tab = a title-bar corner cut · trap = the roster's RANDOM key ·
   * rect = the lockers / map index tag.
   */
  shape?: "slant" | "chevron" | "tab" | "trap" | "rect";
  as?: "span" | "div" | "b" | "strong" | "p";
  className?: string;
}

/**
 * The silver bevel chip (c9688b5 --wmx-chrome / --hud-silver): a four-stop silver gradient
 * with a hard break at 48/52%, a white top bevel and ink caps. <b> inside = deep accent,
 * <i> = dimmed.
 */
export function ChromePlate({ children, shape = "slant", as = "span", className }: ChromePlateProps) {
  const Tag = as as "span";
  return (
    <Tag className={cx("rhk-chip", className)} data-shape={shape}>
      {children}
    </Tag>
  );
}
