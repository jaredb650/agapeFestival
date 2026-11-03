"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { armEntrance } from "./fx";
import { cx } from "./cx";

export interface ChromeHousingProps {
  children?: ReactNode;
  /** The silver top rail with its two ice pins. Default true. */
  rail?: boolean;
  /** CRT power-on when it scrolls into view. Default true. */
  power?: boolean;
  as?: "div" | "section" | "article" | "aside";
  className?: string;
  style?: CSSProperties;
}

/**
 * The lockers band's unit (c9688b5 .wlk-unit): a chamfered steel housing with scanlines and an
 * ice hairline, a silver top rail with two ice pins, and a CRT power-on. Layout is yours
 * (className / style); padding defaults to the original 22px 28px 22px 24px (--housing-pad).
 */
export function ChromeHousing({ children, rail = true, power = true, as = "div", className, style }: ChromeHousingProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !power) return;
    return armEntrance(el);
  }, [power]);
  const Tag = as as "div";
  return (
    <Tag ref={ref} className={cx("rhk-housing", className)} style={style}>
      {rail && <span className="rhk-housing__rail" aria-hidden="true" />}
      {children}
    </Tag>
  );
}
